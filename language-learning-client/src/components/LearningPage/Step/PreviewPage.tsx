import { Button } from "@/components/ui/button"
import { Card } from "@/types"
import { Star } from "lucide-react"
import { LearningStep } from "../types"

interface PreviewPageProps {
    animationClass: string
    filteredAndSortedCards: Card[]
    nextStep: (step: LearningStep) => void
    handleStartQuiz: () => void
}

export const PreviewPage: React.FC<PreviewPageProps> = ({
    animationClass,
    filteredAndSortedCards,
    handleStartQuiz,
    nextStep
}) => {
    return (
        <div className={`space-y-8 p-8 animate-fadeIn ${animationClass}`}>
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">Your Learning Sessions</h2>
                <p className="text-gray-600">Here's what you'll be practicing today</p>
            </div>
            <div className="">
                <div className="flex items-center justify-between mb-4"> 
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                            {filteredAndSortedCards.length}
                        </div>  
                        <div>
                            <h3 className="text-xl font-semibold text-green-800">Cards Ready</h3>
                            <p className="text-green-600">Estimated time: ~{Math.ceil(filteredAndSortedCards.length * 1.2)} minutes</p>
                        </div>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Preview (showing first 5 cards): </h3>
                <div className="grid gap-4">
                    {filteredAndSortedCards.slice(0, 5).map((card, index) => (
                        <div
                            key={card._id}
                            className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
                            style={{ animationDelay: `${index * 100}ms`}}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{card.userLangCard}</p>
                                    <p className="text-gray-600">{card.engCard}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredAndSortedCards.length > 5 && (
                        <div className="text-center py-4 text-gray-600 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <span className="text-lg">... and {filteredAndSortedCards.length - 5} more cards waiting for you! 🎉</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={() => nextStep('settings')}
                    className="px-8 py-3 text-lg"
                >
                    ← Back to Settings
                </Button>
                <Button
                    onClick={handleStartQuiz}
                    className="px-8 py-3 text-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
                >
                    Start Learning! 🚀
                </Button>
            </div>
        </div>
    )
}