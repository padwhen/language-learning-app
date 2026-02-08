import { Answer, QuizItem, Card } from "@/types";
import axios from "axios";
import { useCallback, useState, useEffect, useRef } from "react";

interface UseQuizLogicReturn {
    question: number;
    answers: Answer[];
    quizdone: boolean;
    score: number;
    saveAnswer: (answerIndex: number, correct: boolean, cardId: string, userAnswerText?: string, isPartial?: boolean) => void;
    cards: Card[];
    nextQuizDate?: Date | null;
    loading: boolean;
}

const useQuizLogic = (quiz: QuizItem[], deckId: any, isReviewMode: boolean = false, _mapInput?: Record<string, number>, isResumeMode: boolean = false, resumeData?: { currentQuestion: number, answers: Answer[], score: number }, originalQuizItems?: QuizItem[], isQuizStarted: boolean = false): UseQuizLogicReturn => {
    const userId = localStorage.getItem('userId')
    const [question, setQuestion] = useState<number>(1) // Always start from 1 for current quiz
    const [answers, setAnswers] = useState<Answer[]>(resumeData?.answers || [])
    const [quizdone, setQuizDone] = useState<boolean>(false)
    const [score, setScore] = useState<number>(resumeData?.score || 0)
    const [cards, setCards] = useState<Card[]>([])
    const [nextQuizDate, setNextQuizDate] = useState<Date | null>(null)
    const [loading, setLoading] = useState(true)

    const startTimeRef = useRef<number>(0)
    const loadingRef = useRef(true)
    const [quizStartTime, setQuizStartTime] = useState<number>(0)

    useEffect(() => {
        if (isQuizStarted && quizStartTime === 0) {
            // Quiz just started - set the start time
            const now = Date.now()
            setQuizStartTime(now)
            startTimeRef.current = now
        } else if (isQuizStarted && quizStartTime > 0) {
            // Quiz is ongoing - update timer for new question
            startTimeRef.current = Date.now()
        }
    }, [question, isQuizStarted, quizStartTime])

    const fetchCards = async () => {
        try {
            const response = await axios.get(`/decks/${deckId}`);
            setCards(response.data.cards);
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setLoading(false)
            loadingRef.current = false
        }
    };

    useEffect(() => {
        fetchCards();            
    }, [deckId])

    const finishQuiz = useCallback(async (updatedCards: Card[], lastAnswer?: Answer) => {
        try {
            await axios.put(`/decks/update-card/${deckId}`, { cards: updatedCards });

            const allAnswers = lastAnswer ? [...answers, lastAnswer] : answers;
            const quizItemsToUse = isResumeMode && originalQuizItems ? originalQuizItems : quiz;
            
            const quizDetails = allAnswers.map(answer => {
                // Find the correct quiz item by cardId instead of question index
                const quizItem = quizItemsToUse.find(item => item.cardId === answer.cardId);
                return {
                    engCard: quizItem?.userLangCard || '',
                    userAnswer: answer.userAnswer,
                    correctAnswer: answer.correctAnswer,
                    correct: answer.correct,
                    _id: answer.cardId,
                    cardScore: updatedCards.find(card => card._id === answer.cardId)?.cardScore || 0,
                    timeTaken: answer.timeTaken
                }
            })
            
            const response = await axios.post(`/learning-history/save-quiz-result`, {
                userId: userId,
                deckId: deckId,
                cardsStudied: allAnswers.length, 
                correctAnswers: allAnswers.filter(a => a.correct).length,
                quizType: isReviewMode ? 'review' : 'learn',
                quizDetails: quizDetails
            })
            setNextQuizDate(new Date(response.data.nextQuizDate))
        } catch (error) {
            console.error('Error saving quiz result: ', error)
        }
    }, [userId, deckId, quiz, answers, isReviewMode, isResumeMode, originalQuizItems])

    const saveAnswer = async (
        userAnswerIndex: number,
        correct: boolean,
        cardId: string,
        userAnswerText?: string,
        isPartial?: boolean,
    ) => {
        if (loadingRef.current) return
        const currentQuestion = quiz[question - 1]
        const endTime = Date.now()
        const timeTaken = endTime - startTimeRef.current

        // Update card score
        const updatedCards = cards.map(card => {
            if (card._id === cardId) {
                let newScore = card.cardScore

                // Correct = +1 (max 5), Partial = +0.5 (max 5), Wrong = -1 (min 0)
                if (correct && isPartial) {
                    newScore = Math.min(card.cardScore + 0.5, 5)
                } else if (correct) {
                    newScore = Math.min(card.cardScore + 1, 5)
                } else {
                    newScore = Math.max(card.cardScore - 1, 0)
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
            // In resume mode, the question number is adjusted by adding the number of answers already provided.
            // This ensures the question numbering continues correctly from where the user left off.
            question: isResumeMode ? (answers.length + question) : question,
            userAnswer: userAnswerText ?? currentQuestion.options[userAnswerIndex] ?? '',
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
            await finishQuiz([...updatedCards], newAnswer)
            setQuizDone(true)
        }
    }

    return { question, answers, quizdone, score, saveAnswer, cards, nextQuizDate, loading }
}

export default useQuizLogic