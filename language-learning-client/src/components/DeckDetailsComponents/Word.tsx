import { Pencil, Speaker, Star } from "lucide-react"
import { ToolTip } from "../../composables/ToolTip"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { EditCard } from "./EditCardModal";

interface Props {
    engCard: string;
    userLangCard: string;
    cardId: string;
    deckId: any;
}

export const Word = ({ engCard, userLangCard, cardId, deckId }: Props) => {
    return (
        <div className="w-full max-w-[850px] border shadow-md border-r rounded-lg p-4">
            <div className="flex items-center">
                <div className="w-[250px] sm:w-[300px] text-xl sm:text-2xl text-blue-500">
                    {userLangCard}
                </div>
                <div className="flex-grow text-xl sm:text-2xl">
                    {engCard}
                </div>
                <div className="flex items-center space-x-4">
                    <ToolTip trigger={<Star className="w-6 h-6" />} content="Mark as favorite" />
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
        </div>
    )
}