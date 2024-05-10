import React from "react";
import { Progress } from "./ui/progress"

export const DockCardLarge: React.FC<{
    deck: {
        _id: string;
        deckName: string;
        deckPercentage: string;
        deckTags: string[];
        cards: any[]
    }
}> = ({ deck }) => {
    const { deckName, deckPercentage, deckTags, cards } = deck;
    const calculateCompletePercentage = () => {
        const completeCards = cards.filter(card => card.cardScore === 5);
        return ((completeCards.length / cards.length) * 100).toFixed(0)
    }
    return (
        <div className="min-w-[400px] max-w-[600px] border-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300 hover:border-b-2 hover:border-blue-500">
            <div className="ml-4 pt-2">
                <h1 className="text-2xl font-semibold mt-2">{deckName}</h1>
                <div className="flex items-center gap-5 mt-2">
                    <h3 className="text-lg">{calculateCompletePercentage()} % completed</h3>
                    <Progress value={Number(calculateCompletePercentage())} className="w-[200px] h-3" />
                </div>
                <div className="mb-5 mt-3 flex gap-2">
                    <h1 className="px-4 py-1 bg-blue-500 text-white rounded-full inline-block">{cards.length} terms</h1>
                    {deckTags.map((tag, index) => (
                        <h1 key={index} className="px-4 py-1 bg-blue-500 text-white rounded-full inline-block">{tag}</h1>
                    ))}
                </div>
            </div>

        </div>
    )
}