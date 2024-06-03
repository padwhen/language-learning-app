import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import axios from "axios";
import { useToast } from "../ui/use-toast"

interface Props {
    engCard: string;
    userLangCard: string;
    cardId: string;
    deckId: any;
}

export const EditCard = ({ engCard, userLangCard, cardId, deckId }: Props) => {
    const [term, setTerm] = useState(userLangCard)
    const [definition, setDefinition] = useState(engCard)
    const [_error, setError] = useState('')
    
    const { toast } = useToast()

    const handleSubmit = async (event: React.FormEvent) => {
        console.log('clicked')
        event.preventDefault()
        try {
            await axios.put(`/decks/update-card/${deckId}/${cardId}`, {
                engCard: definition,
                userLangCard: term
            })
            toast({
                variant: "default",
                title: 'Update successfully',
                description: `${term} now is ${definition}`
            })
            setTimeout(() => { window.location.reload() }, 1000)
        } catch (error) {
            setError('Failed to update the card. Please try again later')
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Edit "{userLangCard}" 🔗</h1>
            <form className="mt-2" onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="term" className="text-lg">Term</Label>
                        <Input id="term" value={term} placeholder={userLangCard}
                               onChange={(e) => setTerm(e?.target?.value)}
                        />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="definition" className="text-lg">Definition</Label>
                        <Input id="definition" value={definition} placeholder={engCard} 
                               onChange={(e) => setDefinition(e?.target?.value)}
                        /> 
                    </div>
                </div>
            </form>
            <div className="flex justify-end mt-3">
                <Button variant="default" className="text-lg" onClick={handleSubmit}>Edit</Button>
            </div>
        </div>
    )
}