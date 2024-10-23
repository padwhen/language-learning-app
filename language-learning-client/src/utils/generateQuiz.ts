import { Card, QuizItem } from "@/types";

export const generateQuiz = (cards: Card[] | any[]): QuizItem[] => {
    return cards.map((card, index) => {
        // Filter out the current card and create array of indices
        const otherIndices = Array.from(
            { length: cards.length },
            (_, i) => i
        ).filter(i => i != index)

        // Shuffle and take 3 random indices
        const wrongOptionIndices = otherIndices
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
        
        // Add the correct answer index and shuffle
        const allOptionsIndices = [...wrongOptionIndices, index].sort(() => Math.random() - 0.5)

        // Get the correct answer's position in the options array
        const correctIndex = allOptionsIndices.indexOf(index)

        return {
            userLangCard: card.userLangCard,
            options: allOptionsIndices.map(i => cards[i].engCard),
            correctAnswer: card.engCard,
            correctIndex: correctIndex,
            cardId: card._id,
            cardScore: card.cardScore
        }
    })
}