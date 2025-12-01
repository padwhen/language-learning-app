import { useState } from "react";
import axios from "axios";

const useUpdateCard = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const updateCard = async (deckId: string, cardId: string, engCard: string, userLangCard: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.put(`/decks/update-card/${deckId}/${cardId}`, {
                engCard, userLangCard
            }, {
                withCredentials: true
            })
            return response.data
        } catch (error) {
            setError('Error updating card')
            throw error;
        } finally {
            setLoading(false)
        }
    }
    return { updateCard, loading, error}
}

export default useUpdateCard