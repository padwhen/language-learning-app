import { Pencil, Speaker, Star } from "lucide-react"
import { ToolTip } from "../../composables/ToolTip"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { EditCard } from "./EditCardModal";
import { useUpdateFavorite } from "@/state/hooks/useUpdateFavorite";
import { useState } from "react";
import './Word.css'

interface Props {
    engCard: string;
    userLangCard: string;
    cardId: string;
    deckId: any;
    favorite: boolean;
}

export const Word = ({ engCard, userLangCard, cardId, deckId, favorite }: Props) => {
    const { updateFavorite, error } = useUpdateFavorite()
    const [isFavorite, setIsFavorite] = useState(favorite)

    const handleFavoriteToggle = async () => {
        try {
            await updateFavorite(deckId, cardId, !isFavorite)
            setIsFavorite(!isFavorite)
        } catch (err) {
            console.error('Error updating favorite status: ', err)
        }
    }


    return (
        <div className={`w-full max-w-[850px] shadow-md rounded-lg p-4 ${isFavorite ? 'favorite-card' : 'border border-r'}`}>
            <div className="flex items-center">
                <div className="w-[250px] sm:w-[300px] text-xl sm:text-2xl text-blue-500">
                    {userLangCard}
                </div>
                <div className="flex-grow text-xl sm:text-2xl">
                    {engCard}
                </div>
                <div className="flex items-center space-x-4">
                    <ToolTip trigger={
                        <Star className={`w-6 h-6 cursor-pointer ${isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`}
                        onClick={handleFavoriteToggle}
                        />
                    } 
                        content={isFavorite ? "Remove from favorites" : "Mark as favorite"} />
                    <Dialog>
                        <DialogTrigger asChild>
                            <div>
                                <ToolTip trigger={<Pencil className="w-6 h-6" />} content="Edit this word" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-[425px]">
                            <EditCard deckId={deckId} cardId={cardId} engCard={engCard} userLangCard={userLangCard} />
                        </DialogContent>
                    </Dialog>                    
                    <ToolTip trigger={<Speaker className="w-6 h-6" />} content="Speak" />                    
                </div>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    )
}