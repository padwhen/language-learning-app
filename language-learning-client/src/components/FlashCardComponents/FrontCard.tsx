import { Pencil } from "lucide-react"
import { ToolTip } from "../../composables/ToolTip"
import { Volume1 } from "lucide-react"
import { Star } from "lucide-react"

interface Props {
    word: string
}

export const FrontCard = ({ word }: Props) => {
    return (
        <div className="h-[350px] shadow-md">
            <header className="mt-2 ml-2 flex justify-between items-center">
                <div className="inline-flex flex-row gap-2 items-center justify-center ml-5">
                    <ToolTip trigger={<Pencil />} content="Edit the flashcard" />
                    <ToolTip trigger={<Volume1 />} content="Speak the word!" />
                    <ToolTip trigger={<Star />} content="Mark as favorite" />
                </div>
                <div className="inline-flex gap-1 justify-center items-center rounded border border-gray-300 p-2 mr-5 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>
                    Get a hint
                </div>
            </header>
            <div className="flex items-center justify-center h-[250px]">
                <h1 className="text-7xl">{word}</h1>
            </div>
        </div>
    )
}