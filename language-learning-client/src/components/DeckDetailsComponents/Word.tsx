import { Pencil, Speaker, Star } from "lucide-react"
import { ToolTip } from "../ToolTip"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { EditCard } from "./EditCard";

interface Props {
    engCard: string;
    userLangCard: string;
    cardId: string;
    deckId: any;
}

export const Word = ({ engCard, userLangCard, cardId, deckId }: Props) => {
    return (
        <div className="max-w-[850px] border shadow-md border-r rounded-lg">
            <div className="flex p-5 items-center">
                <div className="min-w-[300px] text-2xl text-blue-500 relative">
                    {userLangCard}
                </div>
                <div className="min-w-[300px] text-2xl ml-5 relative">
                    {engCard}
                </div>
                <div className="mt-1 ml-12 cursor-pointer">
                    <ToolTip trigger={<Star />} content="Mark as favorite" />
                    <Dialog>
                        <DialogTrigger asChild>
                            <ToolTip trigger={<Pencil />} content="Edit this word" />                             
                        </DialogTrigger>
                        <DialogContent className="max-w-[425px]">
                            <EditCard deckId={deckId} cardId={cardId} engCard={engCard} userLangCard={userLangCard} />
                        </DialogContent>
                    </Dialog>                    
                    <ToolTip trigger={<Speaker />} content="Speak" />                    
                </div>
            </div>
        </div>
    )
}
