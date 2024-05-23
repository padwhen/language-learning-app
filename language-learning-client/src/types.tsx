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

export function simplifyFraction(numerator: number, denominator: number): string {
    const gcd = (a: number, b: number): number => {
        return b === 0 ? a : gcd(b, a % b);
    };
    const commonDivisor: number = gcd(numerator, denominator);
    const simplifiedNumerator: number = numerator / commonDivisor;
    const simplifiedDenominator: number = denominator / commonDivisor;
    return `${simplifiedNumerator}/${simplifiedDenominator}`;
}

export interface Deck {
    _id: string;
    owner: string;
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
