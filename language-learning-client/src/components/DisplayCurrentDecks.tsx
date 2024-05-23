import axios from "axios"
import { useEffect, useState } from "react"
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { DockCard } from "./DockCard";
import { Button } from "./ui/button";
import { NewDeckCard } from "./NewDeckCard";
import { Deck } from "@/types";

export const DisplayCurrentDecks: React.FC<{onSelectDeck: (deckId: string) => void;}> = ({onSelectDeck}) => {
    const [decks, setDecks] = useState<Deck[]>([])
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
    const [openNewDeck, setOpenNewDeck] = useState<boolean>(false)
    const language = localStorage.getItem("fromLanguage")

    const handleDeckSelect = (deckId: string) => {
        setSelectedDeck(deckId)
    }

    const fetchData = async () => {
        try {
            const response = await axios.get('/decks');
            const filteredDecks = response.data.filter((deck: any) => deck.deckTags[0].toLowerCase() === language?.toLowerCase())
            setDecks(filteredDecks)
        } catch (error) {
            console.error('Error fetching deck datas')
        }
    }

    useEffect(() => {
        fetchData()
    }, [openNewDeck])

    const handleChooseDeck = () => {
        if (selectedDeck) {
            onSelectDeck(selectedDeck)
        }
    }

    return (
        <div className="flex items-start">
            <Card className="w-[510px] h-[500px]">
                <CardHeader>
                    <CardTitle className="text-3xl">Current decks in {language}</CardTitle>
                </CardHeader>
                {decks.length === 0 ? (
                    <div className="flex flex-col gap-5 items-center justify-center text-lg">
                        🙅‍♀️ No deck yet. Create one below 🙅‍♂️
                        <Button onClick={() => setOpenNewDeck(true)} variant="default">Add a new deck</Button>
                    </div>
                ): (
                    <>
                        <div className="flex flex-col gap-y-3 justify-center items-center mb-5">
                            {decks.map((deck) => (
                                <DockCard 
                                    key={deck._id} 
                                    info={deck}
                                    isSelected={selectedDeck === deck._id}
                                    onClick={() => handleDeckSelect(deck._id)} />
                            ))}
                        </div>
                        <CardFooter className="flex justify-between">
                            <Button onClick={() => setOpenNewDeck(true)} variant="outline">Add a new deck</Button>
                            <Button onClick={handleChooseDeck} disabled={!selectedDeck}>Choose this deck</Button>
                        </CardFooter>
                    </>
                )}
            </Card>
            {openNewDeck && <NewDeckCard setOpenNewDeck={setOpenNewDeck} />}
        </div>
    )
}