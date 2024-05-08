import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DockCard } from "./DockCardSmall"
import exampleData from '../../dockcard.json'
import { useEffect, useState } from "react"
import axios from "axios"
 
export const CurrentDecks:React.FC<{
    deckNames: string[];  
    setDecksName: (deckNames: string[]) => void; 
    setDisplayCurrentDecks: (arg: boolean) => void;
    setOpenNewDeck: (arg: boolean) => void;
    openNewDeck: boolean;
}> = ({deckNames, setDecksName, setDisplayCurrentDecks, setOpenNewDeck, openNewDeck}) => {

    const [decks, setDecks] = useState([])

    const handleDeckSelect = (deckName: string) => {
        setDecksName([...deckNames, deckName]);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get('/decks');
            setDecks(response.data)
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
                    <CardTitle className="text-3xl">Current decks in Finnish</CardTitle>
                </CardHeader>
                <div className="flex flex-col gap-y-3 justify-center items-center mb-5">
                    {decks.map((deck, index) => (
                        <DockCard key={index} info={deck} onSelect={handleDeckSelect} />
                    ))}
                </div>
                <CardFooter className="flex justify-between">
                    <Button onClick={() => setOpenNewDeck(true)} variant="outline">Add a new deck</Button>
                    <Button onClick={() => setDisplayCurrentDecks(false)}>Choose this deck</Button>
                </CardFooter>
                </Card>    
            </div>            
    )
}