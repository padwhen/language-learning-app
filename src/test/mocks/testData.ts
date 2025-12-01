import { vi } from 'vitest';

// Mock data for cards
export const mockCards = [
    { _id: "1", engCard: "Hello", userLangCard: "Xin chào", cardScore: 2, learning: true },
    { _id: "2", engCard: "Goodbye", userLangCard: "Tạm biệt", cardScore: 1, learning: true },
    { _id: "3", engCard: "Thank you", userLangCard: "Cảm ơn", cardScore: 3, learning: true },
    { _id: "4", engCard: "Please", userLangCard: "Làm ơn", cardScore: 0, learning: true },
];

// Mock data for deck
export const mockDeck = {
    _id: "deck1",
    name: "Test Deck",
    deckName: "Test Deck",
    tags: ["test"],
    deckTags: ["test"],
    userLang: "vi",
    cards: mockCards
};

// Mock data for quiz items
export const mockQuiz = [
    {
        userLangCard: "Xin chào",
        options: ["Hello", "Goodbye", "Thank you", "Please"],
        correctAnswer: "Hello",
        correctIndex: 0,
        cardId: "1",
        cardScore: 2
    },
    {
        userLangCard: "Tạm biệt",
        options: ["Hello", "Goodbye", "Thank you", "Please"],
        correctAnswer: "Goodbye",
        correctIndex: 1,
        cardId: "2",
        cardScore: 1
    }
];

// Mock data for learning history
export const mockHistory = [
    {
        id: "1",
        date: "2024-03-20",
        cardsStudied: 10,
        quizType: "learn" as const,
        correctAnswers: 8,
        randomName: "peach_jay"
    },
    {
        id: "2",
        date: "2024-03-21",
        cardsStudied: 10,
        quizType: "review" as const,
        correctAnswers: 9,
        randomName: "peach_jay_Review01"
    }
];

// Mock user data
export const mockUserId = "user123";

// Mock dates
export const mockNextQuizDate = new Date("2024-03-25");

// Mock quiz logic state
export const mockQuizLogicState = {
    question: 1,
    answers: [],
    quizdone: false,
    score: 0,
    saveAnswer: vi.fn(),
    cards: mockCards,
    nextQuizDate: null,
    loading: false
};

// Mock quiz options state
export const mockQuizOptionsState = {
    includeCompletedCards: false,
    setIncludeCompletedCards: vi.fn(),
    cardsToLearn: 4,
    setCardsToLearn: vi.fn(),
    cardTypeToLearn: 'All' as 'All' | 'Completed' | 'Not studied' | 'Learning',
    setCardTypeToLearn: vi.fn(),
    shuffleCards: false,
    setShuffleCards: vi.fn(),
    filterCards: vi.fn().mockReturnValue(mockCards)
};

// Mock fetch deck state
export const mockFetchDeckState = {
    deck: mockDeck,
    cards: mockCards,
    deckName: "Test Deck",
    deckTags: ["test"],
    userLang: "vi",
    setDeck: vi.fn(),
    setCards: vi.fn(),
    setDeckName: vi.fn(),
    setDeckTags: vi.fn(),
    setUserLang: vi.fn()
};

// Mock fetch next quiz date state
export const mockFetchNextQuizDateState = {
    nextQuizDate: null,
    fetchNextQuizDate: vi.fn(),
    error: null,
    loading: false
};

// Mock fetch history state
export const mockFetchHistoryState = {
    history: mockHistory,
    fetchHistory: vi.fn(),
    error: null
}; 