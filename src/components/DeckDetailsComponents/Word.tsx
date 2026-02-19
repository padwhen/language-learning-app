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
        <div className={`w-full max-w-[850px] shadow-md rounded-lg p-3 sm:p-4 ${isFavorite ? 'favorite-card' : 'border border-r'}`}>
            <div className="flex items-center gap-2 min-w-0">
                <div className="w-2/5 sm:w-[250px] md:w-[300px] flex-shrink-0 text-sm sm:text-xl md:text-2xl text-blue-500 font-medium break-words min-w-0">
                    {userLangCard}
                </div>
                <div className="flex-1 min-w-0 text-sm sm:text-xl md:text-2xl break-words">
                    {engCard}
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    <ToolTip trigger={
                        <Star className={`w-4 h-4 sm:w-6 sm:h-6 cursor-pointer ${isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`}
                        onClick={handleFavoriteToggle}
                        />
                    }
                        content={isFavorite ? "Remove from favorites" : "Mark as favorite"} />
                    <Dialog>
                        <DialogTrigger asChild>
                            <div>
                                <ToolTip trigger={<Pencil className="w-4 h-4 sm:w-6 sm:h-6" />} content="Edit this word" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
                            <EditCard deckId={deckId} cardId={cardId} engCard={engCard} userLangCard={userLangCard} />
                        </DialogContent>
                    </Dialog>
                    <ToolTip trigger={<Speaker className="w-4 h-4 sm:w-6 sm:h-6" />} content="Speak" />
                </div>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    )
}