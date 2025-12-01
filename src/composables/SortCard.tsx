import { Card } from "@/types";

interface OrganizedCard {
    stillLearning: Card[]
    notStudied: Card[]
    completed: Card[]
}

export const organizeCardsByScore = (cards: Card[]): OrganizedCard => {
    const stillLearning: Card[] = [];
    const notStudied: Card[] = []
    const completed: Card[] = []

    cards.forEach((card) => {
        const { cardScore } = card
        if (cardScore >= 1 && cardScore <= 3) {
            stillLearning.push(card);
        } else if (cardScore === 0) {
            notStudied.push(card);
        } else if (cardScore >= 4 && cardScore <= 5) {
            completed.push(card);
        }
    })
    const sortWithFavoritesAtTop = (a: Card, b: Card) => {
        if (a.favorite === b.favorite) {
            return a.cardScore - b.cardScore
        }
        return a.favorite ? -1 : 1
    }
    stillLearning.sort(sortWithFavoritesAtTop)
    notStudied.sort(sortWithFavoritesAtTop)
    completed.sort(sortWithFavoritesAtTop)
    
    return { stillLearning, notStudied, completed }
}