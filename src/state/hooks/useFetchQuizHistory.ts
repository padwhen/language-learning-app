import { QuizDetail } from "@/types";
import axios from "axios"
import { useEffect, useState } from "react"

interface QuizData {
    _id: string;
    userId: string;
    deckId: string;
    cardsStudied: number;
    correctAnswers: number;
    quizType: string;
    nextQuizDate: string;
    randomName: string;
    quizDetails: QuizDetail[];
    date: string;
}

export const useFetchQuizHistory = (id: string | undefined) => {
    const [quizData, setQuizData] = useState<QuizData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!id) {
            setLoading(false)
            return
        }

        const fetchDeck = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await axios.get<QuizData>(`/learning-history/${id}`)
                if (response.data) {    
                    setQuizData(response.data)
                } else {
                    throw new Error("Learning history data not found in response")
                }
            } catch (error) {
                console.error(`Error fetching learning history: ${id}`)
                setError(error instanceof Error ? error : new Error('An unknown error occurred'))
            } finally {
                setLoading(false)
            }
        }
        fetchDeck()
    }, [id])

    const averageTime = quizData
        ? (quizData.quizDetails.reduce((sum, quiz) => sum + quiz.timeTaken, 0) / quizData.quizDetails.length / 1000).toFixed(2)
        : '0'

    const filteredQuizDetails = quizData ? quizData.quizDetails : []

    return {
        quizData, averageTime, filteredQuizDetails, loading, error
    }
}