import { useState } from "react";
import axios from "axios";

interface HistoryItem {
    correctAnswers?: number;
    date: string;
    cardsStudied: number;
    quizType: 'learn' | 'review'
}

export const useFetchHistory = (userId: string | null, deckId: any) => {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [error, setError] = useState<string | null>(null)

    const fetchHistory = async () => {
        try {
            if (userId && deckId) {
                const response = await axios.get(`/learning-history/${userId}/${deckId}`)
                setHistory(response.data.history)
            }
        } catch (error) {
            console.error('Error fetching learning history: ', error)
            setError('Error fetching learning history')
        }
    }
    return { history, error, fetchHistory }
}

export const useFetchNextQuizDate = (userId: string | null, deckId: any) => {
    const [nextQuizDate, setNextQuizDate] = useState<Date | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const fetchNextQuizDate = async () => {
        setLoading(true)
        try {
            if (userId && deckId) {
                const response = await axios.get(`/learning-history/next-quiz-date/${userId}/${deckId}`)
                setNextQuizDate(new Date(response.data.nextQuizDate))
            }
        } catch (error) {
            console.error('Error fetching next quiz date', error)
            setError('Error fetching next quiz date')
        } finally {
            setLoading(false)
        }
    }
    return { nextQuizDate, loading, error, fetchNextQuizDate }
}