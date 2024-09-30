import { Answer, QuizItem, Card } from "@/types";
import axios from "axios";
import { useCallback, useState, useEffect, useRef } from "react";

interface UseQuizLogicReturn {
    question: number;
    answers: Answer[];
    quizdone: boolean;
    score: number;
    saveAnswer: (answer: string, correct: boolean, cardId: string) => void;
    cards: Card[];
    nextQuizDate?: Date | null;
}

const useQuizLogic = (quiz: QuizItem[], deckId: any): UseQuizLogicReturn => {
    const userId = localStorage.getItem('userId')
    const [question, setQuestion] = useState<number>(1)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [quizdone, setQuizDone] = useState<boolean>(false)
    const [score, setScore] = useState<number>(0)
    const [cards, setCards] = useState<Card[]>([])
    const [nextQuizDate, setNextQuizDate] = useState<Date | null>(null)

    const startTimeRef = useRef<number>(Date.now())

    useEffect(() => {
        startTimeRef.current = Date.now()
    }, [question])

    const fetchCards = async () => {
        try {
            const response = await axios.get(`/decks/${deckId}`);
            setCards(response.data.cards);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    };

    useEffect(() => {
        fetchCards();
    }, [deckId])

    const finishQuiz = useCallback(async (updatedCards: Card[], lastAnswer?: Answer) => {
        try {
            // Update the deck on the server
            await axios.put(`/decks/update-card/${deckId}`, { cards: updatedCards });

            const allAnswers = lastAnswer ? [...answers, lastAnswer] : answers;
            const quizDetails = allAnswers.map(answer => ({
                engCard: quiz[answer.question - 1].userLangCard,
                userAnswer: answer.userAnswer,
                correctAnswer: quiz[answer.question - 1].correctAnswer,
                correct: answer.correct,
                _id: answer.cardId,
                cardScore: updatedCards.find(card => card._id === answer.cardId)?.cardScore || 0,
                timeTaken: answer.timeTaken
            }))
            
            const response = await axios.post(`/learning-history/save-quiz-result`, {
                userId: userId,
                deckId: deckId,
                cardsStudied: allAnswers.length, 
                correctAnswers: allAnswers.filter(a => a.correct).length,
                quizType: 'learn',
                quizDetails: quizDetails
            })
            setNextQuizDate(new Date(response.data.nextQuizDate))
        } catch (error) {
            console.error('Error saving quiz result: ', error)
        }
    }, [userId, deckId, quiz, answers])

    const saveAnswer = async (userAnswer: string, correct: boolean, cardId: string) => {
        const currentQuestion = quiz[question - 1]

        const endTime = Date.now()
        const timeTaken = endTime - startTimeRef.current
        
        // Update card score
        const updatedCards = cards.map(card => {
            if (card._id === cardId) {
                const newScore = Math.min(Math.max(card.cardScore + (correct ? 1 : -1), 0), 5);
                if (!card.learning) {
                    card.learning = true
                    // Call the backend to update the learning property
                    axios.put(`/decks/${deckId}/cards/${cardId}/learning`, { learning: true })
                }
                return { ...card, cardScore: newScore };
            }
            return card;
        });
        
        setCards(updatedCards);

        const newAnswer: Answer = {
            question: question,
            userAnswer: userAnswer,
            correctAnswer: currentQuestion.correctAnswer,
            correct: correct,
            cardId: cardId,
            cardScore: updatedCards.find(card => card._id === cardId)?.cardScore || 0,
            timeTaken: timeTaken
        }

        if (correct) {
            setScore(prevScore => prevScore + 1)
        }

        if (question < quiz.length) {
            setAnswers(prev => [...prev, newAnswer])
            setQuestion(prevQuestion => prevQuestion + 1)
        } else {
            await finishQuiz(updatedCards, newAnswer)
            setQuizDone(true)
        }
    }

    return { question, answers, quizdone, score, saveAnswer, cards, nextQuizDate }
}

export default useQuizLogic