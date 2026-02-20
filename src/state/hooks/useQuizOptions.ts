import { useState } from 'react';
import { Card } from '@/types';
import { CardTypeToLearn } from '@/components/LearningPage/types';

const useQuizOptions = (cards: Card[]) => {
    const [includeCompletedCards, setIncludeCompletedCards] = useState(false);
    const [cardsToLearn, setCardsToLearn] = useState(50);
    const [cardTypeToLearn, setCardTypeToLearn] = useState<CardTypeToLearn>('All');
    const [shuffleCards, setShuffleCards] = useState(false);

    const filterCards = (): Card[] => {
        const now = new Date();
        let filteredCards = cards.filter((card) => {
            if (!includeCompletedCards && card.cardScore >= 5) return false;
            if (cardTypeToLearn === 'Not studied' && card.cardScore !== 0) return false;
            if (cardTypeToLearn === 'Learning' && (card.cardScore < 1 || card.cardScore >= 5)) return false;
            if (cardTypeToLearn === 'Completed' && card.cardScore < 5) return false;
            if (cardTypeToLearn === 'Due for Review') {
                if (!card.nextReviewDate) return false;
                if (new Date(card.nextReviewDate) > now) return false;
            }
            return true;
        });

        // For "Due for Review", sort by most overdue first
        if (cardTypeToLearn === 'Due for Review') {
            filteredCards.sort((a, b) => {
                const aDate = a.nextReviewDate ? new Date(a.nextReviewDate).getTime() : Infinity;
                const bDate = b.nextReviewDate ? new Date(b.nextReviewDate).getTime() : Infinity;
                return aDate - bDate;
            });
        } else {
            filteredCards.sort((a, b) => {
                if (a.cardScore !== b.cardScore) return a.cardScore - b.cardScore;
                if (a.learning && !b.learning) return -1;
                if (!a.learning && b.learning) return 1;
                return 0;
            });
        }

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
