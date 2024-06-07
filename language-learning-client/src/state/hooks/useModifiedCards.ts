import { useState, useEffect } from "react";
import useFetchDeck from "./useFetchDeck";
import { Card as CardType } from "@/types";
import jsonData from '../../components/DeckDetailsComponents/mockData.json'
import { extractExplanation } from "@/utils/extractExplanation";
import { getDictionarySuggestion } from "@/utils/getDictionarySuggestion";

interface ExtendedCard extends CardType {
    chosen?: boolean;
    aiEngCard?: string;
    explanation?: {
      text: string;
      link: string;
    };
    dictionarySuggestion?: string;
  }
  
  const useModifiedCards = (id: string) => {
    const { cards } = useFetchDeck(id);
    const [items, setItems] = useState<ExtendedCard[]>([]);
  
    useEffect(() => {
      if (cards && cards.length > 0) {
        const modifiedCards = cards.filter(card =>
          jsonData.some(modifiedCard => modifiedCard._id === card._id)
        ).map(async (card) => {
          const modifiedCard = jsonData.find(modifiedCard => modifiedCard._id === card._id);
          const explanation = extractExplanation(modifiedCard?.explanation || '');
          const dictionarySuggestion = await getDictionarySuggestion(card.userLangCard);
          return {
            ...card,
            aiEngCard: modifiedCard ? modifiedCard.engCard : card.engCard,
            explanation: explanation,
            chosen: false,
            dictionarySuggestion,
          };
        });
        Promise.all(modifiedCards).then(resolvedCards => setItems(resolvedCards));
      }
    }, [cards]);
  
    return {items, setItems};
  };
  
  export default useModifiedCards;