import { useState } from 'react';
import { Card } from '@/types';

const useQuizOptions = (cards: Card[]) => {
    const [includeCompletedCards, setIncludeCompletedCards] = useState(false);
    const [cardsToLearn, setCardsToLearn] = useState(10);
    const [cardTypeToLearn, setCardTypeToLearn] = useState<'All' | 'Completed' | 'Not studied' | 'Learning'>('All');
    const [shuffleCards, setShuffleCards] = useState(false);

    const filterCards = (): Card[] => {
        let filteredCards = cards.filter((card) => {
            if (card.learning) return false
            if (!includeCompletedCards && card.cardScore >= 4) return false;
            if (cardTypeToLearn === 'Not studied' && card.cardScore !== 0) return false;
            if (cardTypeToLearn === 'Learning' && (card.cardScore < 1 || card.cardScore > 3)) return false;
            if (cardTypeToLearn === 'Completed' && (card.cardScore < 4 || card.cardScore > 5)) return false;
            return true;
        });

        filteredCards.sort((a, b) => a.cardScore - b.cardScore);

        if (shuffleCards) {
            filteredCards = filteredCards.sort(() => Math.random() - 0.5);
        }
        return filteredCards.slice(0, cardsToLearn);
    };

    return {
        includeCompletedCards,
        setIncludeCompletedCards,
        cardsToLearn,
        setCardsToLearn,
        cardTypeToLearn,
        setCardTypeToLearn,
        shuffleCards,
        setShuffleCards,
        filterCards,
    };
};

export default useQuizOptions;
