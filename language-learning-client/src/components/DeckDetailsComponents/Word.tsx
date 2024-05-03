import { Pencil, Speaker, Star } from "lucide-react"
import { ToolTip } from "../ToolTip"

export const Word = () => {
    return (
        <div className="max-w-[850px] border shadow-md border-r rounded-lg">
            <div className="flex p-5 items-center">
                <div className="min-w-[300px] text-2xl text-blue-500 relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 bg-gray-300"></div>
                    No varmasti!
                </div>
                <div className="min-w-[300px] text-2xl ml-5 relative">
                    For sure!!
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
