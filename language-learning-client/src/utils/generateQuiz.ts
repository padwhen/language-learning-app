import { Card, QuizItem } from "@/types";

export const generateQuiz = (cards: Card[]): QuizItem[] => {
    return cards.map((card, index) => {
        // Filter out the current card and shuffle the rest of the engCard properties
        const shuffledEngCards = cards
            .filter((_, i) => i !== index)
            .map(c => c.engCard)
            .sort(() => Math.random() - 0.5)
        // Take the first 3 elements from the shuffled array and add the correct answer
        const options = shuffledEngCards.slice(0, 3).concat(card.engCard).sort(() => Math.random() - 0.5)
        return {
            text: card.userLangCard,
            options: options,
            answer: card.engCard
        }
    })
}