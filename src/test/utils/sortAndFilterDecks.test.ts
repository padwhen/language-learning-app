import { describe, it, expect } from "vitest";
import { sortAndFilterDecks } from "@/utils/sortAndFilterDecks";
import { Deck } from "@/types";

const sampleDecks: Deck[] = [
    {
        _id: "1",
        owner: "user1",
        deckName: "Deck 1",
        deckPercentage: "50",
        deckTags: ["english"],
        cards: [
            { _id: "c1", engCard: "Hello", userLangCard: "Hola", cardScore: 5 },
            { _id: "c2", engCard: "World", userLangCard: "Mundo", cardScore: 3 },
        ]
    },
    {
        _id: "2",
        owner: "user2",
        deckName: "Deck 2",
        deckPercentage: "75",
        deckTags: ["spanish"],
        cards: [
            { _id: "c3", engCard: "Cat", userLangCard: "Gato", cardScore: 4 },
            { _id: "c4", engCard: "Dog", userLangCard: "Perro", cardScore: 5 },
        ]
    },
    {
        _id: "3",
        owner: "user3",
        deckName: "Deck 3",
        deckPercentage: "20",
        deckTags: ["french"],
        cards: [
            { _id: "c5", engCard: "Bonjour", userLangCard: "Hello", cardScore: 2 },
            { _id: "c6", engCard: "Merci", userLangCard: "Thank you", cardScore: 1 },
        ]
    }
];

describe('sortAndFilterDecks', () => {
    it('should sort decks by most recent', () => {
        const { displayedDecks } = sortAndFilterDecks(sampleDecks, 'most recent', false);
        expect(displayedDecks[0]._id).toBe("3");
        expect(displayedDecks[1]._id).toBe("2");
        expect(displayedDecks[2]._id).toBe("1");
    });
    
    it('should sort decks by top progress', () => {
        const { displayedDecks } = sortAndFilterDecks(sampleDecks, "top progress", false);
        expect(displayedDecks[0]._id).toBe("2");
        expect(displayedDecks[1]._id).toBe("1");
        expect(displayedDecks[2]._id).toBe("3");
    });
    
    it('should sort decks by least progress', () => {
        const { displayedDecks } = sortAndFilterDecks(sampleDecks, "least progress", false);
        expect(displayedDecks[0]._id).toBe("3");
        expect(displayedDecks[1]._id).toBe("1");
        expect(displayedDecks[2]._id).toBe("2");
    });
    
    it('should sort decks by most cards', () => {
        const { displayedDecks } = sortAndFilterDecks(sampleDecks, "most cards", false);
        expect(displayedDecks[0]._id).toBe("1");
        expect(displayedDecks[1]._id).toBe("2");
        expect(displayedDecks[2]._id).toBe("3");
    });
    
    it("should filter decks by language", () => {
        const { displayedDecks } = sortAndFilterDecks(sampleDecks, "english", false);
        expect(displayedDecks.length).toBe(1);
        expect(displayedDecks[0]._id).toBe("1");
    });
    
    it("should slice decks if doSlice is true", () => {
        const { displayedDecks } = sortAndFilterDecks(sampleDecks, "most recent", true);
        expect(displayedDecks.length).toBe(2);
        expect(displayedDecks[0]._id).toBe("3");
        expect(displayedDecks[1]._id).toBe("2");
    });
    it("should return all languages", () => {
        const { allLanguages } = sortAndFilterDecks(sampleDecks, "most recent", false);
        expect(allLanguages).toEqual(["english", "spanish", "french"]);
    });
});
