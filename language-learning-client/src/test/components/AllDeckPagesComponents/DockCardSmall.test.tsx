import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DockCard } from "@/components/AllDeckPagesComponents/DockCardSmall";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mockDecks } from "@/test/__mocks__/data/mockDecks";

type DockCardProps = {
    info: {
        _id: string;
        deckName: string;
        deckTags: string[];
        cards: any[];
    };
    onSelect: (deckName: { _id: string; deckName: string }) => void;
}

const mockDeck = {
    info: mockDecks[0],
    onSelect: vi.fn()
} as DockCardProps;

describe('DockCardSmall', () => {

    beforeEach(() => {
        render(<DockCard {...mockDeck} onSelect={mockDeck.onSelect} info={{
            ...mockDeck.info,
            deckPercentage: 0,
            deckQuantity: mockDeck.info.cards.length
        }} />)
    })

    afterEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    it('renders deck name correctly', () => {
        expect(screen.getByText('French Basics')).toBeInTheDocument()
    })
    it('displays correct number of flashcards', () => {
        expect(screen.getByText('2 flashcards')).toBeInTheDocument()
    })
    it('renders all deck tags', () => {
        expect(screen.getByText('French')).toBeInTheDocument()
    })
    it('shows correct completion percentage', () => {
        expect(screen.getByText('0 % complete')).toBeInTheDocument()
    })
    it('handles click events correctly', () => {
        const card = screen.getByTestId('deck-card')
        // Initial state - no ring
        expect(card).not.toHaveClass('ring-2 ring-blue-500')
        fireEvent.click(card)
        expect(mockDeck.onSelect).toHaveBeenCalledWith({
            _id: mockDeck.info._id,
            deckName: mockDeck.info.deckName
        })
        expect(card).toHaveClass('ring-2 ring-blue-500')
    })
    describe('special cases', () => {
        beforeEach(() => {
            cleanup()
        })
        it('handles empty deck', () => {
            const emptyDeck = {
                ...mockDeck,
                info: {
                    ...mockDeck.info,
                    cards: []
                }
            }
            render(<DockCard {...emptyDeck} onSelect={emptyDeck.onSelect} info={{
                ...emptyDeck.info,
                deckPercentage: 0,
                deckQuantity: 0
            }} />)
            expect(screen.getByText('0 flashcards')).toBeInTheDocument()
            expect(screen.queryByText('French')).not.toBeInTheDocument()
        })
    })
})