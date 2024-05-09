import { Pencil, Speaker, Star } from "lucide-react"
import { ToolTip } from "../ToolTip"

interface Props {
    engCard: String;
    userLangCard: String;
}

export const Word = ({ engCard, userLangCard }: Props) => {
    return (
        <div className="max-w-[850px] border shadow-md border-r rounded-lg">
            <div className="flex p-5 items-center">
                <div className="min-w-[300px] text-2xl text-blue-500 relative">
                    {userLangCard}
                </div>
                <div className="min-w-[300px] text-2xl ml-5 relative">
                    {engCard}
                </div>
                <div className="mt-1 ml-12">
                    <ToolTip trigger={<Star />} content="Mark as favorite" />                    
                    <ToolTip trigger={<Pencil />} content="Edit this word" />                    
                    <ToolTip trigger={<Speaker />} content="Speak" />                    
                </div>
            </div>
        </div>
    )
}
