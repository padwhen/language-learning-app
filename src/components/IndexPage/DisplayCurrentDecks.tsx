import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { DockCard } from "./DockCard";
import { Button } from "../ui/button";
import { NewDeckCard } from "./NewDeckCard";
import { Deck } from "@/types";

export const DisplayCurrentDecks: React.FC<{ onSelectDeck: (deckId: string) => void }> = ({ onSelectDeck }) => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
    const [openNewDeck, setOpenNewDeck] = useState<boolean>(false);
    const language = localStorage.getItem("fromLanguage");

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
        <div className="flex flex-col md:flex-row items-start">
            <Card className="w-full md:w-[510px] flex-1 overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">Current decks in {language}</CardTitle>
                </CardHeader>
                <div className="overflow-y-auto max-h-[450px]" data-testid="current-decks">
                    {decks.length === 0 ? (
                        <div className="flex flex-col gap-5 items-center justify-center text-lg">
                            🙅‍♀️ No deck yet. Create one below 🙅‍♂️
                            <Button onClick={() => setOpenNewDeck(true)} variant="default">Add a new deck</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 p-4 max-h-[300px] md:max-h-[450px] overflow-y-auto">
                        {decks.map((deck) => (
                            <div key={deck._id} className="w-full">
                            <DockCard 
                                info={deck}
                                isSelected={selectedDeck === deck._id}
                                onClick={() => handleDeckSelect(deck._id)} 
                            />
                            </div>
                        ))}
                        </div>
                    )}
                </div>
                <CardFooter className="flex flex-col md:flex-row justify-between mt-2 gap-2 md:gap-0">
                    <Button onClick={() => setOpenNewDeck(true)} variant="outline" className="w-full md:w-auto">Add a new deck</Button>
                    <Button onClick={handleChooseDeck} disabled={!selectedDeck} className="w-full md:w-auto">Choose this deck</Button>
                </CardFooter>
            </Card>
            {openNewDeck && (
                <div className="mt-4 md:mt-0 md:ml-4 w-full md:w-auto">
                    <NewDeckCard setOpenNewDeck={setOpenNewDeck} /> 
                </div>  
            )}
        </div>
    );
};
