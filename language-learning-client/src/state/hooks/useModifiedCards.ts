import { useState, useEffect } from "react";
import useFetchDeck from "./useFetchDeck";
import { Card as CardType } from "@/types";
import { extractExplanation } from "@/utils/extractExplanation";
import { getDictionarySuggestion } from "@/utils/getDictionarySuggestion";
import { vocabulariesTailor } from "@/chatcompletion/ChatCompletion";

interface ExtendedCard extends CardType {
  chosen?: boolean;
  aiEngCard?: string;
  explanation?: {
    text: string,
    link: string
  };
  dictionarySuggestion?: string;
  explanation_string?: string;
}

const useModifiedCards = (id: string) => {
    const { cards } = useFetchDeck(id);
    const [items, setItems] = useState<ExtendedCard[]>([]);
    const length = cards.length;
  
  useEffect(() => {
    const fetchModifiedCards = async () => {
      if (cards && cards.length > 0) {
        try {
          const cardsString = JSON.stringify(cards);
          const modifiedCardsData = await vocabulariesTailor(cardsString);
          const modifiedCards = JSON.parse(modifiedCardsData);
          const modifiedCardsPromises = modifiedCards.filter((card: ExtendedCard) =>
            cards.some(originalCard => originalCard._id === card._id)
          ).map(async (card: ExtendedCard) => {
            const originalCard = cards.find(originalCard => originalCard._id === card._id);
            const explanation = extractExplanation(card.explanation_string|| '');
            const dictionarySuggestion = await getDictionarySuggestion(originalCard ? originalCard.userLangCard : '');
            return {
              ...originalCard,
              aiEngCard: card.engCard,
              explanation: explanation,
              chosen: false,
              dictionarySuggestion,
            };
          });
          const resolvedCards = await Promise.all(modifiedCardsPromises);
          setItems(resolvedCards);
        } catch (error) {
          console.error("Error fetching modified cards:", error);
        }
      }
    };

    fetchModifiedCards();
  }, []);

  return { items, setItems, length };
};

export default useModifiedCards;
