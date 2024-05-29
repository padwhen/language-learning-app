import { useDeckContext } from "@/DeckContext";
import { calculateCompletePercentage } from "@/utils/calculatePercentage";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { getTimeStamp } from "@/utils/getTimestamp";
import { formatDistance } from "date-fns";

export const DeckInfo = () => {
    const { decks } = useDeckContext();
    const [sortBy, setSortBy] = useState("Most cards");

    const allLanguages = Array.from(new Set(decks.map(deck => deck.deckTags[0])));

    const sortedDecks = [...decks].sort((a, b) => {
        switch (sortBy.toLowerCase()) {
            case "most recent":
                return getTimeStamp(b._id).getTime() - getTimeStamp(a._id).getTime();
            case "top progress":
                return calculateCompletePercentage(b.cards) - calculateCompletePercentage(a.cards);
            case "least progress":
                return calculateCompletePercentage(a.cards) - calculateCompletePercentage(b.cards);
            case "most cards":
                return b.cards.length - a.cards.length;
            case "most old":
            default:
                return getTimeStamp(a._id).getTime() - getTimeStamp(b._id).getTime(); // Assuming this sorts oldest to newest
        }
    });

    const filterLanguageDecks = allLanguages.includes(sortBy)
    
    const displayedDecks = filterLanguageDecks
    ? decks.filter(deck => deck.deckTags[0].toLowerCase() === sortBy.toLowerCase()).slice(0, 2)
    : sortedDecks.slice(0, 2);

    if (!decks || decks.length === 0) {
        return null;
    }
    return (<>
    <div className="flex justify-between w-64">
        <h1 className="text-2xl font-bold text-blue-500 ">Your decks</h1>
        <Select onValueChange={value => setSortBy(value)}>
            <SelectTrigger className="text-lg mt-1 border rounded-md bg-gray-200 text-gray-700 px-4">
                <SelectValue placeholder="Most cards" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="Most cards">Most cards</SelectItem>
                    <SelectItem value="Most recent">Most recent</SelectItem>
                    <SelectItem value="Most old">Most old</SelectItem>
                    <SelectItem value="Top Progress">Top Progress</SelectItem>
                    <SelectItem value="Least Progress">Least Progress</SelectItem>
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Language</SelectLabel>
                    {allLanguages.map(language => (
                        <SelectItem key={language} value={language}>{language.charAt(0).toUpperCase() + language.slice(1)}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    </div>
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
                        <div className="mt-1">
                            <div className="mb-1 flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Created</h3>
                                <span className="text-sm text-gray-800 dark:text-white">
                                    {formatDistance(getTimeStamp(deck._id), new Date(), { addSuffix: true })}
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
