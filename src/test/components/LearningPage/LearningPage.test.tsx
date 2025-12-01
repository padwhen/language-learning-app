import { render, screen, fireEvent, act } from "@testing-library/react";
import { LearningPage } from "@/components/LearningPage/LearningPage";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import useFetchDeck from "@/state/hooks/useFetchDeck";
import useQuizLogic from "@/state/hooks/useQuizLogic";
import useQuizOptions from "@/state/hooks/useQuizOptions";
import { useFetchNextQuizDate } from "@/state/hooks/useLearningHistoryHooks";
import { generateQuiz } from "@/utils/generateQuiz";
import {
    mockCards,
    mockQuiz,
    mockUserId,
    mockQuizLogicState,
    mockQuizOptionsState,
    mockFetchDeckState,
    mockFetchNextQuizDateState
} from "@/test/mocks/testData";

// Mock the hooks and utilities
vi.mock("@/state/hooks/useFetchDeck");
vi.mock("@/state/hooks/useQuizLogic");
vi.mock("@/state/hooks/useQuizOptions");
vi.mock("@/state/hooks/useLearningHistoryHooks");
vi.mock("@/utils/generateQuiz");

const renderWithRouter = (component: React.ReactNode) => {
    return render(
        <MemoryRouter initialEntries={["/learn-decks/123"]}>
            <Routes>
                <Route path="/learn-decks/:id" element={component} />
            </Routes>
        </MemoryRouter>
    );
};

describe('LearningPage', () => {
    beforeEach(() => {
        // Mock localStorage
        Storage.prototype.getItem = vi.fn(() => mockUserId);
        
        // Mock useFetchDeck
        vi.mocked(useFetchDeck).mockReturnValue(mockFetchDeckState);

        // Mock useQuizOptions
        vi.mocked(useQuizOptions).mockReturnValue(mockQuizOptionsState);

        // Mock useQuizLogic
        vi.mocked(useQuizLogic).mockReturnValue(mockQuizLogicState);

        // Mock useFetchNextQuizDate
        vi.mocked(useFetchNextQuizDate).mockReturnValue(mockFetchNextQuizDateState);

        // Mock generateQuiz
        vi.mocked(generateQuiz).mockReturnValue(mockQuiz);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders quiz options dialog', async () => {
        renderWithRouter(<LearningPage />);
        
        // Open options dialog
        const optionsButton = screen.getByTestId('options-dialog');
        await act(async () => {
            fireEvent.click(optionsButton);
        });

        // Check if dialog content is rendered
        expect(screen.getByText('Options')).toBeInTheDocument();
        expect(screen.getByTestId('include-completed-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('shuffle-cards-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('cards-to-learn-input')).toBeInTheDocument();
        expect(screen.getByTestId('card-type-select')).toBeInTheDocument();
    });
    it('displays quiz progress and questions', () => {
        renderWithRouter(<LearningPage />);
        
        // Check progress and question number - using a more specific query
        const questionHeader = screen.getByRole('heading', { level: 3 });
        expect(questionHeader).toHaveTextContent('Question 1/2');
        
        // Check if first question is displayed - using getByText since it's not a form label
        const questionText = screen.getByText('Xin chào');
        expect(questionText).toBeInTheDocument();
        
        // Check if instruction text is displayed - using getByText since it's not a form label
        const instructionText = screen.getByText('Choose matching term');
        expect(instructionText).toBeInTheDocument();
        
        // Check if options are displayed - they're in buttons with spans
        mockQuiz[0].options.forEach(option => {
            const optionButton = screen.getByRole('button', {
                name: new RegExp(`\\d+\\.\\s*${option}`)
            });
            expect(optionButton).toBeInTheDocument();
        });
    });

    it('handles quiz completion', async () => {
        // Mock quiz completion state
        vi.mocked(useQuizLogic).mockReturnValue({
            question: 2,
            answers: [],
            quizdone: true,
            score: 1,
            saveAnswer: vi.fn(),
            cards: mockCards,
            nextQuizDate: null,
            loading: false
        });

        renderWithRouter(<LearningPage />);
        
        // Check completion message
        expect(screen.getByText('Quiz Result')).toBeInTheDocument();
        expect(screen.getByText('1/2 Questions are correct!')).toBeInTheDocument();
        expect(screen.getByText('No upcoming quiz scheduled. You can start a new quiz whenever you\'re ready!')).toBeInTheDocument();
        expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    it('displays next quiz date when available', () => {
        const nextQuizDate = new Date('2024-03-25');
        
        // Mock next quiz date
        vi.mocked(useQuizLogic).mockReturnValue({
            question: 2,
            answers: [],
            quizdone: true,
            score: 1,
            saveAnswer: vi.fn(),
            cards: mockCards,
            nextQuizDate,
            loading: false
        });

        renderWithRouter(<LearningPage />);
        
        // Use a more specific query with test ID
        const nextQuizDateElement = screen.getByTestId('next-quiz-date');
        expect(nextQuizDateElement).toHaveTextContent('Next quiz scheduled for:');
        expect(nextQuizDateElement).toHaveTextContent(nextQuizDate.toLocaleDateString());
    });

    it('shows empty state when no cards are available', () => {
        // Mock empty cards
        vi.mocked(useQuizOptions).mockReturnValue({
            includeCompletedCards: false,
            setIncludeCompletedCards: vi.fn(),
            cardsToLearn: 4,
            setCardsToLearn: vi.fn(),
            cardTypeToLearn: 'All',
            setCardTypeToLearn: vi.fn(),
            shuffleCards: false,
            setShuffleCards: vi.fn(),
            filterCards: vi.fn().mockReturnValue([])
        });

        renderWithRouter(<LearningPage />);
        
        expect(screen.getByText('No Cards Available')).toBeInTheDocument();
        expect(screen.getByText(/All cards in this deck are currently being learned or have been completed/)).toBeInTheDocument();
    });

    it('handles answer submission', async () => {
        const mockSaveAnswer = vi.fn();
        vi.mocked(useQuizLogic).mockReturnValue({
            question: 1,
            answers: [],
            quizdone: false,
            score: 0,
            saveAnswer: mockSaveAnswer,
            cards: mockCards,
            nextQuizDate: null,
            loading: false
        });

        renderWithRouter(<LearningPage />);
        
        // Find the correct answer button by looking for the exact text pattern
        const answerButtons = screen.getAllByTestId('answer-test');
        const correctAnswerButton = answerButtons.find(button => 
            button.textContent?.trim() === '1. Hello'
        );
        
        if (!correctAnswerButton) {
            throw new Error('Could not find the correct answer button');
        }

        // Click the answer button
        await act(async () => {
            fireEvent.click(correctAnswerButton);
        });

        // Wait for the setTimeout in the Question component
        await new Promise(resolve => setTimeout(resolve, 1100));

        // Check if saveAnswer was called with correct parameters
        expect(mockSaveAnswer).toHaveBeenCalledWith(0, true, "1");
    });
}); 