import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DockCard } from "./DockCard"
import exampleData from '../../dockcard.json'

 
export const CurrentDecks:React.FC<{deckNames: string[];  setDecksName: (deckNames: string[]) => void; setDisplayCurrentDecks: (arg: boolean) => void;}> = ({deckNames, setDecksName, setDisplayCurrentDecks}) => {
    const handleDeckSelect = (deckName: string) => {
        setDecksName([...deckNames, deckName]);
    };
    return (
        <Card className="w-[510px] h-[500px]">
        <CardHeader>
            <CardTitle className="text-3xl">Current decks in Finnish</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-y-3 justify-center items-center mb-5">
            {exampleData.decks.map((deck, index) => (
                <DockCard key={index} info={deck} onSelect={handleDeckSelect} />
            ))}
        </div>
        <CardFooter className="flex justify-between">
            <Button variant="outline">Add a new deck</Button>
            <Button onClick={() => setDisplayCurrentDecks(false)}>Choose this deck</Button>
        </CardFooter>
        </Card>
    )
}