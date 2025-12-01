import { useState, useEffect, useCallback } from 'react';
import { Card, Deck } from '@/types';

interface DuplicateInfo {
  deckName: string;
  isDuplicateTerm: boolean;
  definition: string;
  cardId: string;
}

export const useFindDuplicates = (cards: Card[], decks: Deck[], deckName: string, userLang: string) => {
  const [duplicates, setDuplicates] = useState<{[key: string]: DuplicateInfo[]}>({});
  const [localDecks, setLocalDecks] = useState<Deck[]>([]);

  useEffect(() => {
    setLocalDecks(JSON.parse(JSON.stringify(decks)));
  }, [decks]);

  const findDuplicatesForCard = useCallback((card: Card) => {
    const duplicatesFound: DuplicateInfo[] = [];
    for (const deck of localDecks) {
      if (deck.deckTags[0].toLowerCase() !== userLang.toLowerCase()) continue;
      const duplicateCards = deck.cards.filter((c) => 
        (c.userLangCard === card.userLangCard) && (c._id !== card._id)
      );
      duplicateCards.forEach(duplicateCard => {
        duplicatesFound.push({
          deckName: deck.deckName === deckName ? 'This current deck' : `"${deck.deckName}"`,
          isDuplicateTerm: duplicateCard.userLangCard === card.userLangCard,
          definition: duplicateCard.engCard,
          cardId: duplicateCard._id
        });
      });
    }
    return duplicatesFound;
  }, [localDecks, deckName, userLang]);

  useEffect(() => {
    const newDuplicates: {[key: string]: DuplicateInfo[]} = {};
    cards.forEach(card => {
      const duplicatesFound = findDuplicatesForCard(card);
      if (duplicatesFound.length > 0) {
        newDuplicates[card._id] = duplicatesFound;
      }
    });
    setDuplicates(newDuplicates);
  }, [cards, findDuplicatesForCard]);

  const updateLocalDecks = (updatedDecks: Deck[]) => {
    setLocalDecks(updatedDecks);
  };

  return { duplicates, setDuplicates, localDecks, updateLocalDecks };
};