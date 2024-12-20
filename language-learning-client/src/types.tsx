export interface Word {
    id: string;
    fi: string;
    en: string;
    type: string;
    original_word: string;
    pronunciation: string;
    comment: string;
}

export interface DockCardData {
    [x: string]: any;
    _id: string;
    deckName: string;
    deckPercentage: number;
    deckQuantity: number;
    deckTags: string[];
}

export interface FormData {
    name?: string;
    username: string;
    pin: string;
}

export interface Deck {
    _id: string;
    owner?: string;
    deckName: string;
    deckPercentage?: string;
    deckTags: string[];
    cards: Card[]
}

export interface Card {
    _id: string;
    engCard: string;
    userLangCard: string;
    cardScore: number;
    favorite?: boolean;
    learning?: boolean;
}

export interface QuizItem {
    userLangCard: string;
    options: string[];
    correctAnswer: string;
    correctIndex: number;
    cardId: string;
    cardScore: number;
}

export interface Answer {
    question: number;
    userAnswer: string;
    correctAnswer: string;
    correct: boolean;
    cardId: string;
    cardScore: number;
    timeTaken?: number;
} 

export interface QuizDetail {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    correct: boolean;
    cardId: string;
    cardScore: number;
    timeTaken: number;
    _id: string;
}

export interface Question {
    question: string;
    options?: string[];
    correct_answer: string;
}

export interface Statistics {
    totalScore: string;
    passageScore: string;
    synonymScore: string;
    scrambleScore: string;
    wrongAnswers: {
        passage: string[];
        synonym: string[];
        scramble: string[]
    }
}

export interface GameCard extends Card {
    type: 'eng' | 'userLang'
}

export interface GameOptions {
    showTimer: boolean;
    allowDeselect: boolean;
}

export type FormEvent = React.FormEvent<HTMLFormElement>
export type MouseEvent = React.MouseEvent<HTMLButtonElement>
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>