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
    refreshDecks: () => void;
}

export const DeckContext = createContext<DeckContextType>({
    decks: [],
    setDecks: () => {},
    refreshDecks: () => {}
})

export const DeckContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [decks, setDecks] = useState<Deck[]>([])
    const { isAuthenticated } = useContext(UserContext);
    const [refreshKey, setRefreshKey] = useState<number>(0)

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
    }, [isAuthenticated, refreshKey])

    const refreshDecks = () => {
        setRefreshKey(prevKey => prevKey + 1)
    }

    return (
        <DeckContext.Provider value={{ decks, setDecks, refreshDecks }}>
            {children}
        </DeckContext.Provider>
    )
}

export const useDeckContext = () => useContext(DeckContext)