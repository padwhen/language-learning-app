import React from "react";
import { Progress } from "./ui/progress";
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

    const tagsStyle = "px-4 py-1 bg-blue-500 text-white rounded-full inline-block min-w-[100px] flex items-center justify-center"

    return (
        <div className="min-w-[400px] max-w-[600px] h-[190px] border-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300 hover:border-b-2 hover:border-blue-500">
            <div className="ml-4 pt-2">
                <h1 className="text-2xl font-semibold mt-2">{deckName}</h1>
                <div className="flex items-center gap-5 mt-2">
                    <h3 className="text-lg">{percentage} % completed</h3>
                    <Progress value={Number(percentage)} className="w-[200px] h-3" />
                </div>
                <div className="mb-5 mt-3 flex flex-wrap gap-2">
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
