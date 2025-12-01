import axios from "axios";
import React, { useEffect, useState } from "react";

import { DockCard } from "./DockCard";
import { Button } from "../ui/button";
import { NewDeckCard } from "./NewDeckCard";
import { Deck } from "@/types";

export const DisplayCurrentDecks: React.FC<{ 
    onSelectDeck: (deckId: string) => void;
    onNewDeckStateChange?: (isOpen: boolean) => void;
}> = ({ onSelectDeck, onNewDeckStateChange }) => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
    const [openNewDeck, setOpenNewDeck] = useState<boolean>(false);
    const language = localStorage.getItem("fromLanguage");

    // Notify parent when new deck state changes
    const handleNewDeckToggle = (isOpen: boolean) => {
        setOpenNewDeck(isOpen);
        onNewDeckStateChange?.(isOpen);
    };

    const handleDeckSelect = (deckId: string) => {
        setSelectedDeck(deckId);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get('/decks');
            const filteredDecks = response.data.filter((deck: any) => deck.deckTags[0].toLowerCase() === language?.toLowerCase());
            setDecks(filteredDecks);
        } catch (error) {
            console.error('Error fetching deck data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [openNewDeck]);

    const handleChooseDeck = () => {
        if (selectedDeck) {
            onSelectDeck(selectedDeck);
            setSelectedDeck(null);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            {!openNewDeck ? (
                <>
                    <div className="flex-1 overflow-y-auto pr-2 min-h-0" data-testid="current-decks">
                        {decks.length === 0 ? (
                            <div className="flex flex-col gap-4 items-center justify-center text-sm py-8">
                                <p className="text-gray-500">No deck yet. Create one below</p>
                                <Button onClick={() => handleNewDeckToggle(true)} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">Add a new deck</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {decks.map((deck) => (
                                    <DockCard 
                                        key={deck._id}
                                        info={deck}
                                        isSelected={selectedDeck === deck._id}
                                        onClick={() => handleDeckSelect(deck._id)} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-200 flex-shrink-0">
                        <Button 
                            onClick={() => handleNewDeckToggle(true)} 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                        >
                            Add a new deck
                        </Button>
                        <Button 
                            onClick={handleChooseDeck} 
                            disabled={!selectedDeck} 
                            size="sm" 
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Choose this deck
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                        <h4 className="text-base font-semibold text-gray-900">New Deck</h4>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleNewDeckToggle(false)}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ← Back
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <NewDeckCard setOpenNewDeck={handleNewDeckToggle} />
                    </div>
                </div>
            )}
        </div>
    );
};
