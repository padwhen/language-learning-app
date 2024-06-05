import { useState, useEffect } from 'react';
import axios from 'axios';
import { Deck, Card } from '@/types';

const useFetchDeck = (id: string | undefined) => {
    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [deckName, setDeckName] = useState<string>('');
    const [deckTags, setDeckTags] = useState<string[]>([]);
    const [userLang, setUserLang] = useState<string>('');
    
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const response = await axios.get<Deck>(`/decks/${id}`);
                if (response.data) {
                    setDeck(response.data);
                    setCards(response.data.cards);
                    setDeckName(response.data.deckName);
                    setDeckTags(response.data.deckTags);
                    setUserLang(response.data.deckTags[0]);
                } else {
                    throw new Error("Deck data not found in response");
                }
            } catch (error) {
                console.error(`Error fetching deck for deckId ${id}`, error);
            }
        };
        fetchData();
    }, [id]);

    return { deck, cards, deckName, deckTags, userLang, setDeck, setCards, setDeckName, setDeckTags, setUserLang };
};

export default useFetchDeck;
