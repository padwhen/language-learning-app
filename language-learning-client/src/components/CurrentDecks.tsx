import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DockCard } from "./DockCardSmall"
import { useEffect, useState } from "react"
import axios from "axios"
 
export const CurrentDecks:React.FC<{
    deckNames: { id: string; name: string; }[];  
    setDecksName: (deckNames: { id: string; name: string; }[]) => void; 
    setDisplayCurrentDecks: (arg: boolean) => void;
    setOpenNewDeck: (arg: boolean) => void;
    openNewDeck: boolean;
    onSelectDeck: (deckId: string) => void;
}> = ({deckNames, setDecksName, setDisplayCurrentDecks, setOpenNewDeck, openNewDeck, onSelectDeck}) => {

    const [decks, setDecks] = useState([])
    const language = localStorage.getItem("fromLanguage")

    const handleDeckSelect = (deck: { _id: string, deckName: string}) => {
        onSelectDeck(deck._id)
        setDecksName([...deckNames, { id: deck._id, name: deck.deckName }]);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get('/decks');
            const filteredDecks = response.data.filter((deck: any) => deck.deckTags[0].toLowerCase() === language?.toLowerCase())
            setDecks(filteredDecks)
        } catch (error) {
            console.error('Error fetching decks data')
        }
    }

    useEffect(() => {
        fetchData()
    }, [openNewDeck])

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
                ) : (
                    <>
                        <div className="flex flex-col gap-y-3 justify-center items-center mb-5">
                            {decks.map((deck, id) => (
                                <DockCard key={id} info={deck} onSelect={handleDeckSelect} />
                            ))}
                        </div>
                        <CardFooter className="flex justify-between">
                            <Button onClick={() => setOpenNewDeck(true)} variant="outline">Add a new deck</Button>
                            <Button onClick={() => setDisplayCurrentDecks(false)}>Choose this deck</Button>
                        </CardFooter>
                    </>
                )}
            </Card>    
        </div>            
    )
    
}