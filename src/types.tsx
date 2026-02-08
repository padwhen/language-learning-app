export interface Word {
    id: string;
    fi: string;
    en: string;
    type: string;
    original_word: string;
    en_base?: string;
    pronunciation: string;
    comment: string;
    sentenceText?: string; // The part of the English sentence that corresponds to this word (e.g., "on Friday evening")
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
    nextReviewDate?: string | null;
    lastReviewDate?: string | null;
    reviewInterval?: number;
    easeFactor?: number;
}

export type QuestionType =
    | 'multiple-choice'
    | 'reverse-mc'
    | 'word-scramble'
    | 'type-answer'
    | 'reverse-type'
    | 'listening';

export interface QuizItem {
    userLangCard: string;
    options: string[];
    correctAnswer: string;
    correctIndex: number;
    cardId: string;
    cardScore: number;
    questionType: QuestionType;
    audioLang?: string;
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