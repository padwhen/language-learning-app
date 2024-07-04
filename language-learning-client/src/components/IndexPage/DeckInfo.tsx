import { useDeckContext } from "@/DeckContext";
import { calculateCompletePercentage } from "@/utils/calculatePercentage";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useState } from "react";
import { getTimeStamp } from "@/utils/getTimestamp";
import { formatDistance } from "date-fns";
import { sortAndFilterDecks } from "@/utils/sortAndFilterDecks";
import { Deck } from "@/types";
import SortableSelect from "../SortableSelect";

export const DeckInfo = () => {
    const { decks } = useDeckContext();
    const [sortBy, setSortBy] = useState("Most cards");

    const { allLanguages, displayedDecks } = sortAndFilterDecks(decks, sortBy, true)

    if (!decks || decks.length === 0) {
        return null;
    }
    return (
        <div className="w-full max-w-md mx-auto px-4">
            <div className="flex flex-col items-center mb-4">
                <h1 className="text-2xl font-bold text-blue-500 mb-2">Your decks</h1>
                <SortableSelect sortBy={sortBy} setSortBy={setSortBy} allLanguages={allLanguages} />
            </div>
            <div className="space-y-4">
                {displayedDecks.map((deck: Deck) => (
                    <div key={deck._id} className="bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
                        <div className="p-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                {deck.deckName}
                            </h2>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Language</h3>
                                    <span className="text-sm text-gray-800 dark:text-white">{deck.deckTags[0].charAt(0).toUpperCase() + deck.deckTags[0].slice(1)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Set</h3>
                                    <span className="text-sm text-gray-800 dark:text-white">{deck.cards.length} flashcards</span>    
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Progress</h3>
                                    <span className="text-sm text-gray-800 dark:text-white">
                                        {calculateCompletePercentage(deck.cards)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Created</h3>
                                    <span className="text-sm text-gray-800 dark:text-white">
                                        {formatDistance(getTimeStamp(deck._id), new Date(), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <Button>
                                    <Link to={`/view-decks/${deck._id}`} data-testid={`view-details-link-${deck._id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </div>
                        </div>  
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-center">
                <Button><Link to={'/view-all-decks'}>View All Your Decks</Link></Button>
            </div>    
        </div>
    );
};
