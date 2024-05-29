import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

interface Deck {
    _id: string;
    deckName: string;
    deckPercentage: string;
    deckTags: string[];
    cards: any[]
}

interface DeckContextType {
    decks: Deck[]
    setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
}

export const DeckContext = createContext<DeckContextType>({
    decks: [],
    setDecks: () => {}
})

export const DeckContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [decks, setDecks] = useState<Deck[]>([])
    const { isAuthenticated } = useContext(UserContext)
    useEffect(() => {
        const fetchDecks = async () => {
            try {
                const response = await axios.get<Deck[]>('/decks')
                setDecks(response.data)
            } catch (error) {
                console.error('Error fetching decks: ', error)
            }
        }
        if (isAuthenticated) {
            fetchDecks()
        }
    }, [decks])
    return (
        <DeckContext.Provider value={{ decks, setDecks }}>
            {children}
        </DeckContext.Provider>
    )
}

export const useDeckContext = () => useContext(DeckContext)