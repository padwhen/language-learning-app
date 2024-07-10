import { Answer, QuizItem } from "@/types";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

interface UseQuizLogicReturn {
    question: number;
    answers: Answer[];
    quizdone: boolean;
    score: number;
    saveAnswer: (answer: string, correct: boolean, cardId: string) => void;
}

const useQuizLogic = (quiz: QuizItem[], deckId: any): UseQuizLogicReturn => {
    const userId = localStorage.getItem('userId')
    const [question, setQuestion] = useState<number>(1)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [quizdone, setQuizDone] = useState<boolean>(false)
    const [score, setScore] = useState<number>(0)

    const saveAnswer = async (userAnswer: string, correct: boolean, cardId: string) => {
        const currentQuestion = quiz[question - 1]
        const newAnswer: Answer = {
            question: question,
            userAnswer: userAnswer,
            correctAnswer: currentQuestion.correctAnswer,
            correct: correct,
            cardId: cardId
        }
        setAnswers(prev => [...prev, newAnswer])

        if (correct) {
            setScore(prevScore => prevScore + 1)
        }

        if (question < quiz.length) {
            setQuestion(prevQuestion => prevQuestion + 1)
        } else {
            await finishQuiz()
            setQuizDone(true)
        }
    }

    const finishQuiz = useCallback(async () => {
        try {
            const quizDetails = answers.map(answer => ({
                engCard: quiz[answer.question - 1].userLangCard,
                userAnswer: answer.userAnswer,
                correctAnswer: quiz[answer.question - 1].correctAnswer,
                correct: answer.correct,
                _id: answer.cardId
            }))
            await axios.post(`/learning-history/save-quiz-result`, {
                userId: userId,
                deckId: deckId,
                cardsStudied: quiz.length, 
                correctAnswers: score,
                quizType: 'learn',
                quizDetails: quizDetails
            })
        } catch (error) {
            console.error('Error saving quiz result: ', error)
        }
    }, [userId, deckId, quiz.length, score, answers, quiz])

    useEffect(() => {
        if (quizdone) {
            finishQuiz()
        }
    }, [quizdone, finishQuiz])

    return { question, answers, quizdone, score, saveAnswer }
}

export default useQuizLogic