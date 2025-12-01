import { Card } from "@/types";

export const calculateCompletePercentage = (cards: Card[]): number => {
    if (cards.length === 0) {
        return 0;
    }
    const completeCards = cards.filter((card) => card.cardScore === 5 || card.cardScore === 4);
    const percentage = (completeCards.length / cards.length) * 100;
    return isNaN(percentage) ? 0 : parseFloat(percentage.toFixed(0));
}
