import { render, screen, cleanup } from "@testing-library/react";
import { DockCardLarge } from "@/components/AllDeckPagesComponents/DockCardLarge";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mockDecks } from "@/test/__mocks__/data/mockDecks";

type DockCardProps = {
    _id: string;
    deckName: string;
    deckPercentage: string;
    deckTags: string[];
    cards: any[];
};

const mockDeck = mockDecks[0] as DockCardProps;

describe('DockCardLarge', () => {
    beforeEach(() => {
        render(<DockCardLarge deck={mockDeck} />);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders deck name correctly', () => {
        expect(screen.getByText('French Basics')).toBeInTheDocument();
    });

    it('displays correct number of terms', () => {
        expect(screen.getByText('2 terms')).toBeInTheDocument();
    });

    it('renders all deck tags', () => {
        expect(screen.getByText('French')).toBeInTheDocument();
    });

    it('shows correct completion percentage', () => {
        expect(screen.getByText('0 % completed')).toBeInTheDocument();
    });

    it('renders progress bar with correct value', () => {
        const progressBar = screen.getByRole('progressbar');
        const indicator = progressBar.firstElementChild;
        expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    describe('special cases', () => {
        beforeEach(() => {
            cleanup(); 
        });

        it('handles empty deck', () => {
            const emptyDeck = {
                ...mockDeck,
                cards: []
            };
            render(<DockCardLarge deck={emptyDeck} />);
            expect(screen.getByText('0 terms')).toBeInTheDocument();
            expect(screen.getByText('0 % completed')).toBeInTheDocument();
        });

        it('handles deck with no tags', () => {
            const deckWithoutTags = {
                ...mockDeck,
                deckTags: []
            };
            render(<DockCardLarge deck={deckWithoutTags} />);
            expect(screen.getByText('2 terms')).toBeInTheDocument();
            expect(screen.queryByText('French')).not.toBeInTheDocument();
        });
    });

    it('applies correct styling classes', () => {
        const container = screen.getByTestId('deck-card-container');
        expect(container).toHaveClass('w-full', 'max-w-[600px]', 'border-2', 'rounded-xl');
    });
});