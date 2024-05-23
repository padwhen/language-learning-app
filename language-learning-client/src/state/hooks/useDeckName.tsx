import { useEffect, useState } from "react";    
import axios from "axios";

export const useDeckName = (deckId: string): string | null => {
    const [deckName, setDeckName] = useState<string | null>(null);
    useEffect(() => {
        const fetchDeckName = async () => {
            try {
                const response = await axios.get(`/decks/${deckId}`)
                if (response.data.deckName) {
                    setDeckName(response.data.deckName)
                } else {
                    throw new Error("Deck name not found in response data")
                }
            } catch (error) {
                console.error(`Error fetching deck name for deckId ${deckId} `, error)
                setDeckName(null)
            }
        }
        fetchDeckName()
    }, [deckId])
    return deckName
}