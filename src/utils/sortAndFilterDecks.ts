import { Deck } from "@/types";
import { getTimeStamp } from "./getTimestamp";
import { calculateCompletePercentage } from "./calculatePercentage";

interface SortAndFilterResult {
    allLanguages: string[];
    displayedDecks: Deck[] | any;
}

export const sortAndFilterDecks = (decks: Deck[], sortBy: string, doSlice: boolean): SortAndFilterResult => {
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
                return getTimeStamp(a._id).getTime() - getTimeStamp(b._id).getTime(); // Default to sorting by oldest
        }
    });

    const slice = doSlice ? sortedDecks.slice(0, 2) : sortedDecks

    const filterLanguageDecks = allLanguages.includes(sortBy.toLowerCase());

    const displayedDecks = filterLanguageDecks
        ? decks.filter(deck => deck.deckTags[0].toLowerCase() === sortBy.toLowerCase()).slice(0, 2)
        : slice

    return { allLanguages, displayedDecks };
};
