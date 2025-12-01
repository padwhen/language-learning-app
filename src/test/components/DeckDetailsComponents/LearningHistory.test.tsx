import { render, screen, cleanup, within, act } from "@testing-library/react";
import { LearningHistory } from "@/components/DeckDetailsComponents/LearningHistory";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useFetchHistory, useFetchNextQuizDate } from "@/state/hooks/useLearningHistoryHooks";
import { MemoryRouter } from "react-router-dom";
import {
    mockHistory,
    mockUserId,
    mockNextQuizDate,
    mockFetchHistoryState,
    mockFetchNextQuizDateState
} from "@/test/mocks/testData";

// Mock the hooks
vi.mock("@/state/hooks/useLearningHistoryHooks", () => ({
    useFetchHistory: vi.fn(),
    useFetchNextQuizDate: vi.fn()
}));

const renderWithRouter = (component: React.ReactNode) => {
    return render(
        <MemoryRouter>
            {component}
        </MemoryRouter>
    );
};

describe('LearningHistory', () => {
    const mockDeckId = "deck123";

    beforeEach(() => {
        // Mock localStorage
        Storage.prototype.getItem = vi.fn(() => mockUserId);
        
        // Default mock implementations
        vi.mocked(useFetchHistory).mockReturnValue(mockFetchHistoryState);

        vi.mocked(useFetchNextQuizDate).mockReturnValue({
            ...mockFetchNextQuizDateState,
            nextQuizDate: mockNextQuizDate
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders history section with correct title', () => {
        renderWithRouter(<LearningHistory deckId={mockDeckId} />);
        expect(screen.getByText('History')).toBeInTheDocument();
    });

    it('displays learning sessions correctly', () => {
        renderWithRouter(<LearningHistory deckId={mockDeckId} />);
        
        // Check if the learning session is displayed
        expect(screen.getByText('peach_jay')).toBeInTheDocument();
        expect(screen.getByText('Started: 20.03.2024 • 10 cards')).toBeInTheDocument();
    });

    it('shows next quiz date when available', () => {
        renderWithRouter(<LearningHistory deckId={mockDeckId} />);
        
        // Check if the next quiz section is displayed
        expect(screen.getByText('Next Quiz')).toBeInTheDocument();
    });

    it('shows no upcoming quiz message when no date is available', () => {
        // Mock no next quiz date
        vi.mocked(useFetchNextQuizDate).mockReturnValue({
            nextQuizDate: null,
            fetchNextQuizDate: vi.fn(),
            error: null,
            loading: false
        });

        renderWithRouter(<LearningHistory deckId={mockDeckId} />);
        
        expect(screen.getByText('Next Quiz')).toBeInTheDocument();
        expect(screen.getByText("There's no upcoming quiz scheduled")).toBeInTheDocument();
        expect(screen.getByText("You can start a new quiz whenever you're ready.")).toBeInTheDocument();
    });

    it('handles empty history', () => {
        // Mock empty history
        vi.mocked(useFetchHistory).mockReturnValue({
            history: [],
            fetchHistory: vi.fn(),
            error: null
        });

        renderWithRouter(<LearningHistory deckId={mockDeckId} />);
        
        expect(screen.getByText('There is no learning history for this deck yet.')).toBeInTheDocument();
    });

    it('handles loading state', () => {
        // Mock loading state
        vi.mocked(useFetchHistory).mockReturnValue({
            history: [],
            fetchHistory: vi.fn(),
            error: null
        });
        renderWithRouter(<LearningHistory deckId={mockDeckId} />);
    });

    it('handles error state', () => {
        // Mock error state
        vi.mocked(useFetchHistory).mockReturnValue({
            history: [],
            fetchHistory: vi.fn(),
            error: 'Failed to fetch history'
        });

        renderWithRouter(<LearningHistory deckId={mockDeckId} />);
        
        // You might want to add error handling to your component
        // and test for it here
    });

    it('fetches data on mount', () => {
        const mockFetchHistory = vi.fn();
        const mockFetchNextQuizDate = vi.fn();

        vi.mocked(useFetchHistory).mockReturnValue({
            history: mockHistory,
            fetchHistory: mockFetchHistory,
            error: null
        });

        vi.mocked(useFetchNextQuizDate).mockReturnValue({
            nextQuizDate: new Date("2024-03-25"),
            fetchNextQuizDate: mockFetchNextQuizDate,
            error: null,
            loading: false
        });

        renderWithRouter(<LearningHistory deckId={mockDeckId} />);
        
        expect(mockFetchHistory).toHaveBeenCalled();
        expect(mockFetchNextQuizDate).toHaveBeenCalled();
    });

    it('expands and collapses review sessions', async () => {
        renderWithRouter(<LearningHistory deckId={mockDeckId} />);
        expect(screen.queryByText(/Review01/)).toBeNull();
        const learningSessionItem = screen.getByText('peach_jay').closest('li');
        const expandButton = within(learningSessionItem!).getByRole('button');
        
        await act(async () => {
            expandButton.click();
        });
        
        expect(screen.getByText(/Review01/)).toBeInTheDocument();
        await act(async () => {
            expandButton.click();
        });
        expect(screen.queryByText(/Review01/)).toBeNull();
    });
}); 