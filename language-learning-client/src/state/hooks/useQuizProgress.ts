import { CardTypeToLearn } from "@/components/LearningPage/types";
import { QuizItem } from "@/types";
import axios from "axios";
import { useCallback, useState } from "react";

interface QuizProgressData {
    currentQuestion: number;
    answers: any[];
    score: number;
    quizItems: QuizItem[];
    settings: {
        includeCompletedCards: boolean;
        cardsToLearn: number;
        cardTypeToLearn: CardTypeToLearn;
        shuffleCards: boolean;
    }
}

interface UseQuizProgressReturn {
    savedProgress: QuizProgressData | null;
    saveProgress: (progressData: QuizProgressData) => Promise<void>
    loadProgress: () => Promise<void>
    deleteProgress: () => Promise<void>
    isLoading: boolean;
    error: string | null;
}

export const useQuizProgress = (userId: string | null, deckId: string | undefined): UseQuizProgressReturn => {
    const [savedProgress, setSavedProgress] = useState<QuizProgressData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const saveProgress = useCallback(async (progressData: QuizProgressData) => {
        if (!userId || !deckId) return

        setIsLoading(true)
        setError(null)

        try {
            await axios.post(`/save-quiz-progress/${userId}/${deckId}`, progressData)
            setSavedProgress(progressData)

        } catch (err: any) {
            if (err.response?.status !== 404) {
                const errorMessage = 'Failed to load saved progress'
                setError(errorMessage)
                console.error('Error loading quiz progress: ', err)
            }
            setSavedProgress(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const loadProgress = useCallback(async () => {
        if (!userId || !deckId) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await axios.get(`/save-quiz-progress/${userId}/${deckId}`)
            setSavedProgress(response.data)
        } catch (err: any) {
            if (err.response?.status !== 404) {
                const errorMessage = 'Failed to load saved progress';
                setError(errorMessage);
                console.error('Error loading quiz progress:', err);
            }
            setSavedProgress(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const deleteProgress = useCallback(async () => {
        if (!userId || !deckId) return

        setIsLoading(true)
        setError(null)

        try {
            await axios.delete(`/save-quiz-progress/${userId}/${deckId}`)
            setSavedProgress(null)
        } catch (err) {
            console.error('Error deleting quiz progress: ', err)
            setError('Failed to delete saved progress')
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        savedProgress,
        saveProgress,
        loadProgress,
        deleteProgress,
        isLoading,
        error
    }
}