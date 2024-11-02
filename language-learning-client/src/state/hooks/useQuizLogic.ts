import { Answer, QuizItem, Card } from "@/types";
import axios from "axios";
import { useCallback, useState, useEffect, useRef } from "react";

interface UseQuizLogicReturn {
    question: number;
    answers: Answer[];
    quizdone: boolean;
    score: number;
    saveAnswer: (answerIndex: number, correct: boolean, cardId: string) => void;
    cards: Card[];
    nextQuizDate?: Date | null;
}

const useQuizLogic = (quiz: QuizItem[], deckId: any, isReviewMode: boolean = false, mapInput?: Record<string, number>): UseQuizLogicReturn => {
    const userId = localStorage.getItem('userId')
    const [question, setQuestion] = useState<number>(1)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [quizdone, setQuizDone] = useState<boolean>(false)
    const [score, setScore] = useState<number>(0)
    const [cards, setCards] = useState<Card[]>([])
    const [nextQuizDate, setNextQuizDate] = useState<Date | null>(null)
    const map = useRef<Record<string, number>>(mapInput || {});

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
                quizType: isReviewMode ? 'review': 'learn',
                quizDetails: quizDetails
            })
            setNextQuizDate(new Date(response.data.nextQuizDate))
        } catch (error) {
            console.error('Error saving quiz result: ', error)
        }
    }, [userId, deckId, quiz, answers, isReviewMode])

    const saveAnswer = async (
        userAnswerIndex: number, 
        correct: boolean, 
        cardId: string,
    ) => {
        const currentQuestion = quiz[question - 1]
        const endTime = Date.now()
        const timeTaken = endTime - startTimeRef.current

        if (isReviewMode && correct && map.current[cardId] > 0) {
            map.current[cardId]--
        }        

        // Update card score
        const updatedCards = cards.map(card => {
            if (card._id === cardId) {
                let newScore = card.cardScore
                let scoreUpdated = false

                if (isReviewMode) {
                    // Review mode logic - only update score when map[cardId] reaches 0
                    const reviewStatus = map.current[cardId] || 0
                    if (reviewStatus === 0 && correct) {
                        newScore = Math.min(card.cardScore + 1, 5)
                        scoreUpdated = true
                    } else if (reviewStatus === 2 && !correct) {
                        newScore = Math.max(card.cardScore - 1, 0)
                        scoreUpdated = true
                    }
                    
                    // Remove card from map if score was updated
                    if (scoreUpdated) {
                        delete map.current[cardId]
                    }
                } else {
                    // Learn mode logic
                    if (correct) {
                        newScore = Math.min(card.cardScore + 1, 5)
                    } else {
                        newScore = 0
                    }
                }

                // Always set learning to true the first time the card is interacted with
                let learning = card.learning
                if (card.cardScore === 0 && !card.learning) {
                    learning = true
                }
                // Reset learning to false if card is fully learned (score reaches threshold)
                if (newScore >= 5) {
                    learning = false;
                }
                // Call the backend to update the learning property if changed
                if (learning !== card.learning) {
                    axios.put(`/decks/${deckId}/cards/${cardId}/learning`, { learning: learning })
                }
                
                return {...card, cardScore: newScore, learning: learning}                
            }
            return card
        })
        
        setCards(updatedCards);

        const newAnswer: Answer = {
            question: question,
            userAnswer: currentQuestion.options[userAnswerIndex],
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