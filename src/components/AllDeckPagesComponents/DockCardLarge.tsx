import React from "react";
import { Progress } from "../ui/progress";
import { calculateCompletePercentage } from "@/utils/calculatePercentage";

export const DockCardLarge: React.FC<{
    deck: {
        _id: string;
        deckName: string;
        deckPercentage: string;
        deckTags: string[];
        cards: any[];
    };
}> = ({ deck }) => {
    const { deckName, deckTags, cards } = deck;

    const percentage = calculateCompletePercentage(cards)

    const tagsStyle = "px-2 py-1 bg-blue-500 text-white rounded-full inline-block min-w-[80px] text-sm flex items-center justify-center"

    return (
        <div 
            data-testid="deck-card-container"
            className="w-full max-w-[600px] h-auto min-h-[150px] border-2 md:border-4 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300 hover:border-b-2 hover:border-blue-500">
            <div className="p-3 md:p-4">
                <h1 className="text-xl md:text-2xl font-semibold">{deckName}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 mt-2">
                    <h3 className="text-base md:text-lg">{percentage} % completed</h3>
                    <Progress value={Number(percentage)} className="w-full sm:w-[200px] h-2 md:h-3" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    <div className={tagsStyle}>{cards.length} terms</div>
                    {deckTags.map((tag, index) => (
                        <div key={index} className={tagsStyle}>
                            {tag}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
