import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CreatorBar } from "../components/DeckDetailsComponents/Creator";
import { useParams } from "react-router-dom";
import { organizeCardsByScore } from "../composables/SortCard";
import { NoCard } from "../components/FlashCardComponents/NoCard";
import { CardCategory } from "../components/DeckDetailsComponents/CardCategory";
import { moveLeft, moveRight } from "../utils/cardNavigation";
import { useKeyboardNavigation } from "../utils/useKeyboardNavigation";
import { LearningHistory } from "../components/DeckDetailsComponents/LearningHistory";
import { useUpdateFavorite } from "../state/hooks/useUpdateFavorite";
import useFetchDeck from "../state/hooks/useFetchDeck";
import { useHint } from "../state/hooks/useHint";
import { useAutoPlay } from "../state/hooks/useAutoPlay";
import { DeckControls, DeckLinks, DeckNavigation, FlashCard } from "../components/DeckDetailsComponents/DeckDetailsComponents";
import { AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/input";
import { useDebounce } from "@uidotdev/usehooks";
import { Card } from "../types";

export const DeckDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { deck, cards, deckName } = useFetchDeck(id);
    
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
    const [autoPlay, setAutoPlay] = useState<boolean>(false);

    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<Card[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const debouncedSearchTerm = useDebounce(searchTerm, 300)
    
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value)
    }

    useEffect(() => {
      const searchCards = async () => {
        setIsSearching(false)
        if (debouncedSearchTerm) {
          const searchResults = cards.filter(card => 
            card.engCard.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            card.userLangCard.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          )
          setResults(searchResults)
        } else {
          setResults([])
        }
        setIsSearching(false)
      }
      searchCards()
    }, [debouncedSearchTerm, cards])

    return (
      <div className="pt-5 px-4 md:px-8 lg:px-16 flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-3/4">
          <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-6">{deckName}</h1>
          <DeckLinks id={id!} cardsLength={cards.length} />
          {cards.length > 0 ? (
            <>
            <AnimatePresence>
              <FlashCard 
                card={cards[currentCardIndex]} 
                isFlipped={isFlipped} 
                onFlip={handleCardClick}
                hint={hint}
                onGenerateHint={handleGenerateHintClick}
                onToggleFavorite={handleToggleFavorite}
              />
            </AnimatePresence>
              <DeckControls 
                onPlay={() => setAutoPlay(!autoPlay)}
                onShuffle={() => {/* Implement shuffle */}}
                id={id}
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
                  <div className="flex items-center w-full">
                    <h1 className="text-3xl font-bold mr-2">Terms in this set ({cards.length})</h1>
                    <form className="relative flex-grow"> 
                      <Input  type="text" 
                              placeholder="Find any term/definition..." 
                              className="w-full pl-3 pr-10 py-2 rounded-full
                              border border-transparent
                              focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-500
                              transition-all duration-200 ease-in-out"
                              value={searchTerm}
                              onChange={handleSearchChange} />
                      <button disabled={isSearching} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isSearching ? (
                          "..."
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>                          
                        )}
                      </button>
                    </form>
                  </div>
                  {searchTerm ? (
                    <CardCategory categoryName="Search Results" cards={results} id={id!} />
                  ) : (
                    <>
                      <CardCategory categoryName="Still learning" cards={stillLearning} id={id!} />
                      <CardCategory categoryName="Not studied" cards={notStudied} id={id!} />
                      <CardCategory categoryName="Completed" cards={completed} id={id!} />
                    </>
                  )}
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