import { Pencil } from "lucide-react"
import { ToolTip } from "../../composables/ToolTip"
import { Volume1 } from "lucide-react"
import { Star } from "lucide-react"

interface Props {
    word: string
}

export const BackCard = ({ word }: Props) => {
    return (
        <div className="min-h-[250px] md:h-[350px] bg-white rounded-lg shadow-md border border-gray-200">
            <header className="mt-2 ml-2 flex justify-start items-center">
                <div className="inline-flex flex-row gap-2 items-center justify-center sm:ml-5 ml-2 mt-2">
                    <ToolTip trigger={<Pencil />} content="Edit the flashcard" />
                    <ToolTip trigger={<Volume1 />} content="Speak the word!" />
                    <ToolTip trigger={<Star />} content="Mark as favorite" />
                </div>
            </header>
            <div className="flex items-center justify-center h-[150px] sm:h-[250px]">
                <h1 className="text-4xl sm:text-5xl md:text-7xl text-center px-4">{word}</h1>
            </div>
        </div>
    )
}