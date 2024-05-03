import { useState } from "react"
import ReactCardFlip from "react-card-flip"
import { FrontCard } from "./components/FlashCardComponents/FrontCard"
import { BackCard } from "./components/FlashCardComponents/BackCard"
import { MoveLeft, MoveRight, Play, Settings, Shuffle } from "lucide-react"
import { ToolTip } from "./components/ToolTip"
import { Progress } from "@/components/ui/progress"
import { CreatorBar } from "./components/DeckDetailsComponents/Creator"
import { Word } from "./components/DeckDetailsComponents/Word"

export const DeckDetailsPage = () => {
    const [isFlipped, setIsFlipped] = useState<boolean>(false)
    const handleFlip = () => {
        setIsFlipped(!isFlipped)
    }
    return (
        <div className="pt-[50px] ml-16">
            <h1 className="text-4xl font-bold mt-4">Hello</h1>
            <div className="pt-5 flex flex-row gap-[25px]">
                <a className="text-2xl inline-block px-8 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 w-[200px] text-center">Flashcards</a>
                <a className="text-2xl inline-block px-8 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 w-[200px] text-center">Learn</a>
                <a className="text-2xl inline-block px-8 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 w-[200px] text-center">Match</a>
                <a className="text-2xl inline-block px-8 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 w-[200px] text-center">Test</a>
            </div>
            <div className="w-[875px] border mt-5">
                <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
                    <div key="front" onClick={handleFlip}>
                        <FrontCard />
                    </div>
                    <div key="back" onClick={handleFlip}>
                        <BackCard />
                    </div>
                </ReactCardFlip>
            </div>
            <div className="pt-4 flex justify-between max-w-[875px]">
                <div className="flex gap-4 items-center justify-center">
                    <ToolTip trigger={<Play />} content="Play" />
                    <ToolTip trigger={<Shuffle />} content="Shuffle" />
                </div>
                <div className="flex items-center justify-center gap-5">
                    <div className="border rounded-full hover:bg-gray-200"><MoveLeft size={45} /></div>
                    <div className="text-3xl"> 5 / 17</div>
                    <div className="border rounded-full hover:bg-gray-200"><MoveRight size={45} /></div>
                </div>
                <div className="flex items-center justify-center">
                    <ToolTip trigger={<Settings />} content="Settings" />
                </div>
            </div>
            <div className="pt-2">
                <Progress value={29} className="max-w-[875px] max-h-1"  />
            </div>
            <div className="pt-[50px]">
                <CreatorBar />
            </div>
            <div className="pt-6">
                <h1 className="text-3xl font-bold">Terms in this set (17)</h1>
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-pink-500 pt-3">Still learning (4)</h2>
                    <h3 className="text-gray-500 text-lg">You've begun learning these terms. Keep up the good work!</h3>
                    <div className="flex flex-col gap-3 mt-2">
                        <Word />
                        <Word />
                        <Word />    
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-pink-500 pt-3">Not studied (12)</h2>
                    <h3 className="text-gray-500 text-lg">You haven't studied these terms yet.</h3>
                    <div className="flex flex-col gap-3 mt-2">
                        <Word />  
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-pink-500 pt-3">Completed (1)</h2>
                    <h3 className="text-gray-500 text-lg">Congratulations!</h3>
                    <div className="flex flex-col gap-3 mt-2">
                        <Word />  
                    </div>
                </div>
            </div>
        </div>
    )
}