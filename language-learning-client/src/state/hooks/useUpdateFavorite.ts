import { Deck } from "@/types"
import axios from "axios"
import { useState } from "react"

export const useUpdateFavorite = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateFavorite = async (deckId: any, cardId: string, favorite: boolean): Promise<void> => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await axios.put<Deck>(
                `/decks/${deckId}/cards/${cardId}/favorite`, 
                { favorite },
                { withCredentials: true }
            )
            console.log('Card favorite status updated:', response.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while updating favorite status');
        } finally {
            setIsLoading(false)
        }
    }

    return { updateFavorite, isLoading, error }
}