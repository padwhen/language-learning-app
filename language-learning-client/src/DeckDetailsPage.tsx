import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CreatorBar } from "./components/DeckDetailsComponents/Creator";
import { useParams } from "react-router-dom";
import { organizeCardsByScore } from "./composables/SortCard";
import { NoCard } from "./components/FlashCardComponents/NoCard";
import { CardCategory } from "./components/DeckDetailsComponents/CardCategory";
import { moveLeft, moveRight } from "./utils/cardNavigation";
import { useKeyboardNavigation } from "./utils/useKeyboardNavigation";
import { LearningHistory } from "./components/DeckDetailsComponents/LearningHistory";
import { useUpdateFavorite } from "./state/hooks/useUpdateFavorite";
import useFetchDeck from "./state/hooks/useFetchDeck";
import { useHint } from "./state/hooks/useHint";
import { useAutoPlay } from "./state/hooks/useAutoPlay";
import { DeckControls, DeckLinks, DeckNavigation, FlashCard } from "./components/DeckDetailsComponents/DeckDetailsComponents";

export const DeckDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { deck, cards, deckName } = useFetchDeck(id);
    
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    
    const { hint, generateHint } = useHint();
    const { updateFavorite } = useUpdateFavorite();
  
    const { stillLearning, notStudied, completed } = organizeCardsByScore(cards);
  
    useAutoPlay(autoPlay, isFlipped, currentCardIndex, cards.length, setIsFlipped, setCurrentCardIndex, setAutoPlay);
  
    const handleMoveLeft = () => {
      moveLeft(currentCardIndex, setCurrentCardIndex);
    };
  
    const handleMoveRight = () => {
      moveRight(currentCardIndex, cards.length, setCurrentCardIndex);
    };

    useKeyboardNavigation(handleMoveLeft, handleMoveRight, currentCardIndex, cards.length);

  
    const handleToggleFavorite = async () => {
      if (!deck || cards.length === 0) return;
      const currentCard = cards[currentCardIndex];
      try {
        await updateFavorite(id!, currentCard._id, !currentCard.favorite);
      } catch (error) {
        console.error('Error updating favorite status: ', error);
      }
    };
  
    const handleCardClick = (event: React.MouseEvent) => {
      if (!(event.target as HTMLElement).closest('button')) {
        setIsFlipped(!isFlipped);
      }
    };
  
    const handleGenerateHintClick = () => {
      if (cards[currentCardIndex]) {
        generateHint(cards[currentCardIndex].engCard);
      }
    };
  
    return (
      <div className="pt-5 px-4 md:px-8 lg:px-16 flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-3/4">
          <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-6">{deckName}</h1>
          <DeckLinks id={id!} cardsLength={cards.length} />
          {cards.length > 0 ? (
            <>
              <FlashCard 
                card={cards[currentCardIndex]} 
                isFlipped={isFlipped} 
                onFlip={handleCardClick}
                hint={hint}
                onGenerateHint={handleGenerateHintClick}
                onToggleFavorite={handleToggleFavorite}
              />
              <DeckControls 
                onPlay={() => setAutoPlay(!autoPlay)}
                onShuffle={() => {/* Implement shuffle */}}
                onSettings={() => {/* Implement settings */}}
              />
              <DeckNavigation 
                currentCardIndex={currentCardIndex}
                cardsLength={cards.length}
                onMoveLeft={handleMoveLeft}
                onMoveRight={handleMoveRight}
              />
              <Progress value={(currentCardIndex + 1) / cards.length * 100} className="w-full max-w-[875px] max-h-1 mx-auto mt-4" />
              <CreatorBar id={id!} />
              <div className="pt-6">
                <h1 className="text-3xl font-bold">Terms in this set ({cards.length})</h1>
                <CardCategory categoryName="Still learning" cards={stillLearning} id={id!} />
                <CardCategory categoryName="Not studied" cards={notStudied} id={id!} />
                <CardCategory categoryName="Completed" cards={completed} id={id!} />
              </div>
            </>
          ) : (
            <>
              <NoCard />
              <CreatorBar id={id!} />
            </>
          )}
        </div>
        <div className="w-full lg:w-1/4 pt-5 lg:ml-6">
          <LearningHistory deckId={id!} />
        </div>
      </div>
    );
}