import { useEffect, useState } from "react";
import axios from "axios";
import { Deck } from "@/types";

export const useFetchDeck = (deckId: string | any): Deck => {
    const [deck, setDeck] = useState<Deck>({ cards: [], deckName: '', deckTags: [], _id: '', deckPercentage: '' });

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const response = await axios.get(`/decks/${deckId}`);
                if (response.data) {
                    setDeck(response.data as Deck);
                } else {
                    throw new Error("Deck data not found in response");
                }
            } catch (error) {
                console.error(`Error fetching deck for deckId ${deckId}`, error);
            }
        };

        if (deckId) {
            fetchDeck();
        }
    }, [deckId]);

    return deck;
};
