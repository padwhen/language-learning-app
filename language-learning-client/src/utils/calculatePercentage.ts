import { Card } from "@/types";

export const calculateCompletePercentage = (cards: Card[]) => {
    const completeCards = cards.filter((card) => card.cardScore === 5);
    const percentage = ((completeCards.length / cards.length) * 100).toFixed(0)
    if (isNaN(Number(percentage))) {
        return '0';
    }
    return percentage
}