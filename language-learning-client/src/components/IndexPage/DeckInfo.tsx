import { useDeckContext } from "@/contexts/DeckContext";
import { calculateCompletePercentage } from "@/utils/calculatePercentage";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useState } from "react";
import { getTimeStamp } from "@/utils/getTimestamp";
import { formatDistance } from "date-fns";
import { sortAndFilterDecks } from "@/utils/sortAndFilterDecks";
import { SortableSelect } from "../AllDeckPagesComponents/SortableSelect";

export const DeckInfo = ({ mockData, highlighted }: { mockData?: boolean; highlighted?: boolean }) => {
    const { decks } = useDeckContext();
    const [sortBy, setSortBy] = useState("Most cards");

    // Mock decks for onboarding
    const mockDecks = [
        {
            _id: "mock1",
            deckName: "Finnish Basics",
            deckTags: ["finnish"],
            cards: Array(47).fill({}),
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            _id: "mock2", 
            deckName: "Korean Essentials",
            deckTags: ["korean"],
            cards: Array(32).fill({}),
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    const calculateMockProgress = (cardCount: number) => {
        return cardCount === 47 ? 73 : 45;
    };

    const { allLanguages, displayedDecks } = mockData 
        ? { allLanguages: ['finnish', 'korean'], displayedDecks: mockDecks }
        : sortAndFilterDecks(decks, sortBy, true);

    if (!mockData && (!decks || decks.length === 0)) {
        return null;
    }
    return (
        <div className={`w-full max-w-md mx-auto px-4 transition-all duration-300 ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 rounded-lg p-4 shadow-lg' : ''}`}>
            {!mockData && (
                <div className="flex flex-col items-center my-4">
                    <SortableSelect sortBy={sortBy} setSortBy={setSortBy} allLanguages={allLanguages} />
                </div>
            )}
            <div className="space-y-4">
                {displayedDecks.map((deck: any, index: number) => (
                    <div 
                        key={deck._id} 
                        className={`bg-white border border-t-4 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70 ${deck.deckTags[0] === 'finnish' ? 'border-t-blue-600' : 'border-t-green-600'} ${
                            mockData ? 'animate-in fade-in slide-in-from-right-4' : ''
                        }`}
                        style={mockData ? { 
                            animationDelay: `${0.2 + (index * 0.2)}s`,
                            animationDuration: '0.6s',
                            animationFillMode: 'both'
                        } : {}}
                    >
                        <div className="p-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                {deck.deckName}
                            </h2>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Language</h3>
                                    <span className={`text-sm text-gray-800 dark:text-white px-3 py-1 rounded-full ${deck.deckTags[0] === 'finnish' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                        {deck.deckTags[0].charAt(0).toUpperCase() + deck.deckTags[0].slice(1)} {deck.deckTags[0] === 'finnish' ? '🇫🇮' : '🇰🇷'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Cards</h3>
                                    <span className="text-sm text-gray-800 dark:text-white bg-green-100 px-3 py-1 rounded-full">{deck.cards.length} flashcards</span>    
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Progress</h3>
                                    <span className="text-sm text-gray-800 dark:text-white bg-yellow-100 px-3 py-1 rounded-full">
                                        {mockData ? calculateMockProgress(deck.cards.length) : calculateCompletePercentage(deck.cards)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Created</h3>
                                    <span className="text-sm text-gray-800 dark:text-white">
                                        {mockData 
                                            ? formatDistance(new Date(deck.createdAt), new Date(), { addSuffix: true })
                                            : formatDistance(getTimeStamp(deck._id), new Date(), { addSuffix: true })
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <Button className={deck.deckTags[0] === 'finnish' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}>
                                    {mockData ? (
                                        <span>View Details</span>
                                    ) : (
                                        <Link to={`/view-decks/${deck._id}`} data-testid={`view-details-link-${deck._id}`}>
                                            View Details
                                        </Link>
                                    )}
                                </Button>
                            </div>
                        </div>  
                    </div>
                ))}
            </div>
            <div 
                className={`mt-6 flex justify-center ${
                    mockData ? 'animate-in fade-in slide-in-from-bottom-4' : ''
                }`}
                style={mockData ? { 
                    animationDelay: '0.8s',
                    animationDuration: '0.6s',
                    animationFillMode: 'both'
                } : {}}
            >
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-lg">
                    {mockData ? (
                        <span>View All Your Decks</span>
                    ) : (
                        <Link to={'/view-all-decks'}>View All Your Decks</Link>
                    )}
                </Button>
            </div>    
        </div>
    );
};
