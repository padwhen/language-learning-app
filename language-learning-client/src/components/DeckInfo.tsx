import { useDeckContext } from "@/DeckContext";
import { calculateCompletePercentage } from "@/utils/calculatePercentage";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export const DeckInfo = () => {
    const { decks } = useDeckContext();
    const sortedDecks = [...decks].sort((a, b) => b.cards.length - a.cards.length);
    const displayedDecks = sortedDecks.slice(0, 2)
    return (<>
    {displayedDecks.map(deck => {
        return (
            <div key={deck._id} className="flex items-center justify-start mt-5"> 
                <div className="w-64 flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
                    <div className="p-4">
                        <h1 className="text-2xl gap-2 font-bold text-gray-800 dark:text-white">
                            {deck.deckName}
                        </h1>
                        <div className="mt-2">
                            <div className="flex justify-between items-center">
                                <h3 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white">Language</h3>
                                <span className="text-sm text-gray-800 dark:text-white">{deck.deckTags[0].charAt(0).toUpperCase() + deck.deckTags[0].slice(1)}</span>
                            </div>
                        </div>
                        <div className="mt-1">
                            <div className="flex justify-between items-center">
                                <h3 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white">Set</h3>
                                <span className="text-sm text-gray-800 dark:text-white">{deck.cards.length} flashcards</span>    
                            </div>
                        </div>
                        <div className="mt-1">
                            <div className="mb-1 flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Progress</h3>
                                <span className="text-sm text-gray-800 dark:text-white">
                                    {calculateCompletePercentage(deck.cards)}%
                                </span>
                            </div>
                        </div>
                        <div className={`mt-3 justify-center flex items-center gap-x-1 text-md font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400`}>
                            <Link to={`/view-decks/${deck._id}`}>View Details</Link>
                        </div>
                    </div>  
                </div>
            </div>                 
        );
    })}
        <div className="mt-4 flex justify-center mr-12">
            <Button><Link to={'/view-all-decks'}>View All Your Decks</Link></Button>
        </div>    
</>);
};
