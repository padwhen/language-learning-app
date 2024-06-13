import { Pencil } from "lucide-react"
import { ToolTip } from "../../composables/ToolTip"
import { Volume1 } from "lucide-react"
import { Star } from "lucide-react"

interface Props {
    word: string
}

export const BackCard = ({ word }: Props) => {
    return (
        <div className="h-[350px] shadow-md">
            <header className="mt-2 ml-2 flex justify-between items-center">
                <div className="inline-flex flex-row gap-2 items-center justify-center ml-5 mt-2">
                    <ToolTip trigger={<Pencil />} content="Edit the flashcard" />
                    <ToolTip trigger={<Volume1 />} content="Speak the word!" />
                    <ToolTip trigger={<Star />} content="Mark as favorite" />
                </div>
            </header>
            <div className="flex items-center justify-center h-[250px]">
                <h1 className="text-7xl">{word}</h1>
            </div>
        </div>
    )
}