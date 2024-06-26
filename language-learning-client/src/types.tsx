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
    deckPercentage: string;
    deckTags: string[];
    cards: Card[]
}

export interface Card {
    _id: string;
    engCard: string;
    userLangCard: string;
    cardScore: number;
}

export interface QuizItem {
    text: string;
    options: string[];
    answer: string;
}

export interface Answer {
    question: number;
    answer: string;
} 

export type FormEvent = React.FormEvent<HTMLFormElement>
export type MouseEvent = React.MouseEvent<HTMLButtonElement>
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>