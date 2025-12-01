import { render, screen, fireEvent, act } from "@testing-library/react";
import { ReviewPage } from "@/components/ReviewPage/ReviewPage";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import useQuizLogic from "@/state/hooks/useQuizLogic";
import { useFetchNextQuizDate } from "@/state/hooks/useLearningHistoryHooks";
import { generateQuiz } from "@/utils/generateQuiz";
import {
    mockCards,
    mockQuiz,
    mockUserId,
    mockQuizLogicState,
    mockFetchNextQuizDateState
} from "@/test/mocks/testData";

// Mock the hooks and utilities
vi.mock("@/state/hooks/useQuizLogic");
vi.mock("@/state/hooks/useLearningHistoryHooks");
vi.mock("@/utils/generateQuiz");
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useLocation: vi.fn()
    };
});

const renderWithRouter = (component: React.ReactNode, locationState = { shuffledArray: mockCards }) => {
    // Mock useLocation to return the provided state
    vi.mocked(useLocation).mockReturnValue({
        pathname: "/review-decks/123",
        search: "",
        hash: "",
        state: locationState
    } as any);

    return render(
        <MemoryRouter initialEntries={["/review-decks/123"]}>
            <Routes>
                <Route path="/review-decks/:id" element={component} />
            </Routes>
        </MemoryRouter>
    );
};

describe('ReviewPage', () => {
    beforeEach(() => {
        // Mock localStorage
        Storage.prototype.getItem = vi.fn(() => mockUserId);
        
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

    it('renders loading state when no quiz is available', () => {
        vi.mocked(generateQuiz).mockReturnValue([]);
        renderWithRouter(<ReviewPage />, { shuffledArray: [] });
        expect(screen.getByText('Loading....')).toBeInTheDocument();
    });

    it('displays quiz progress and questions', () => {
        renderWithRouter(<ReviewPage />);
        
        // Check progress and question number - using h3 instead of h2
        const questionHeader = screen.getByRole('heading', { level: 3 });
        expect(questionHeader).toHaveTextContent('Question 1/2');
        
        // Check if first question is displayed
        const questionText = screen.getByText('Xin chào');
        expect(questionText).toBeInTheDocument();
        
        // Check if instruction text is displayed
        const instructionText = screen.getByText('Choose matching term');
        expect(instructionText).toBeInTheDocument();
        
        // Check if options are displayed
        mockQuiz[0].options.forEach(option => {
            const optionButton = screen.getByRole('button', {
                name: new RegExp(`\\d+\\.\\s*${option}`)
            });
            expect(optionButton).toBeInTheDocument();
        });
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

        renderWithRouter(<ReviewPage />);
        
        // Find the correct answer button
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

    it('handles quiz completion', async () => {
        // Mock generateQuiz to return the quiz immediately
        vi.mocked(generateQuiz).mockReturnValue(mockQuiz);

        // Initial state with quiz not done
        vi.mocked(useQuizLogic).mockReturnValue({
            question: 1,
            answers: [],
            quizdone: false,
            score: 0,
            saveAnswer: vi.fn(),
            cards: mockCards,
            nextQuizDate: null,
            loading: false
        });

        // First render with quiz in progress
        const { rerender } = renderWithRouter(<ReviewPage />, { shuffledArray: mockCards });

        // Wait for initial render and quiz state setup
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Now update to quiz completion state
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

        // Re-render with quiz completion state, ensuring Router context is maintained
        await act(async () => {
            rerender(
                <MemoryRouter initialEntries={["/review-decks/123"]}>
                    <Routes>
                        <Route path="/review-decks/:id" element={<ReviewPage />} />
                    </Routes>
                </MemoryRouter>
            );
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Check completion message using a more flexible matcher
        const completionText = screen.getByText((content) => 
            content.includes('1/2 Questions are correct')
        );
        expect(completionText).toBeInTheDocument();

        const noQuizText = screen.getByText((content) => 
            content.includes('No upcoming quiz scheduled')
        );
        expect(noQuizText).toBeInTheDocument();

        const backButton = screen.getByRole('link', { name: /back to home/i });
        expect(backButton).toBeInTheDocument();
    });

    it('displays next quiz date when available', async () => {
        const nextQuizDate = new Date('2024-03-25');
        
        // Mock generateQuiz to return the quiz immediately
        vi.mocked(generateQuiz).mockReturnValue(mockQuiz);

        // Initial state with quiz not done
        vi.mocked(useQuizLogic).mockReturnValue({
            question: 1,
            answers: [],
            quizdone: false,
            score: 0,
            saveAnswer: vi.fn(),
            cards: mockCards,
            nextQuizDate: null,
            loading: false
        });

        // First render with quiz in progress
        const { rerender } = renderWithRouter(<ReviewPage />, { shuffledArray: mockCards });

        // Wait for initial render and quiz state setup
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Now update to quiz completion state with next quiz date
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

        // Re-render with quiz completion state, ensuring Router context is maintained
        await act(async () => {
            rerender(
                <MemoryRouter initialEntries={["/review-decks/123"]}>
                    <Routes>
                        <Route path="/review-decks/:id" element={<ReviewPage />} />
                    </Routes>
                </MemoryRouter>
            );
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Check next quiz date using a more specific selector
        const dateContainer = screen.getByTestId('next-quiz-date');
        expect(dateContainer).toHaveTextContent('Next quiz scheduled for:');
        expect(dateContainer).toHaveTextContent(nextQuizDate.toLocaleDateString());
    });

    it('fetches next quiz date on mount and quiz completion', () => {
        const mockFetchNextQuizDate = vi.fn();
        vi.mocked(useFetchNextQuizDate).mockReturnValue({
            nextQuizDate: null,
            fetchNextQuizDate: mockFetchNextQuizDate,
            error: null,
            loading: false
        });

        renderWithRouter(<ReviewPage />);
        
        // Check if fetchNextQuizDate was called on mount
        expect(mockFetchNextQuizDate).toHaveBeenCalled();

        // Mock quiz completion and re-render
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

        renderWithRouter(<ReviewPage />);
        
        // Check if fetchNextQuizDate was called again after quiz completion
        expect(mockFetchNextQuizDate).toHaveBeenCalledTimes(2);
    });
}); 