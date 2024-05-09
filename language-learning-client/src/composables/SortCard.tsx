interface Card {
    engCard: string;
    userLangCard: string;
    cardScore: number;
    _id: string
}

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
    stillLearning.sort((a, b) => a.cardScore - b.cardScore)
    return { stillLearning, notStudied, completed }
}