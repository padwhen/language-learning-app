// Assuming this mock setup in your test file
import { render, screen } from "@testing-library/react";
import { DeckInfo } from '@/components/DeckInfo';
import { useDeckContext } from '@/DeckContext'; // Adjust import path as needed

const mockDecks = [
    {
        _id: '1',
        deckName: 'Deck 1',
        deckTags: ['english'],
        cards: [{}, {}], // Mock cards for testing
    },
    {
        _id: '2',
        deckName: 'Deck 2',
        deckTags: ['spanish'],
        cards: [{}, {}, {}], // Mock cards for testing
    },
];

// Mock useDeckContext hook
const mockUseDeckContext = () => ({
    decks: mockDecks,
});

// Mock useDeckContext in the component
useDeckContext.mock = mockUseDeckContext;

test('renders component', () => {
    render(<DeckInfo />);
    screen.debug(); // Print out the rendered component for debugging
});
