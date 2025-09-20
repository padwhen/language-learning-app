import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CreatorBar } from "../components/DeckDetailsComponents/Creator";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
import CoachMark from "../components/DeckDetailsComponents/CoachMark";

export const DeckDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { deck, cards, deckName } = useFetchDeck(id);
    const location = useLocation();
    const navigate = useNavigate();
    
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
    const [autoPlay, setAutoPlay] = useState<boolean>(false);

    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<Card[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    // Tour state management
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
    const totalSteps = 6;
    const isTourActive = new URLSearchParams(location.search).get('tour') === 'true';

    // Tour step data
    const tourSteps = [
      {
        title: "Study Mode Navigation 🎯",
        content: "Welcome to your deck! These navigation buttons let you switch between different study modes like flashcards, learn, match, and test. Each mode offers a unique way to master your vocabulary!",
        position: "bottom" as const,
        highlight: "deck-navigation"
      },
      {
        title: "Interactive Flashcard Area 📱",
        content: "This is your main flashcard area. Click the card to flip it and see the translation. Use the hint button if you need help, star your favorites, and hear pronunciations!",
        position: "bottom" as const,
        highlight: "flashcard-area"
      },
      {
        title: "Study Controls 🎮",
        content: "Use these controls to play through cards automatically, shuffle the deck, or access advanced settings for your study session. Perfect for hands-free learning!",
        position: "bottom" as const,
        highlight: "deck-controls"
      },
      {
        title: "Card Navigation 🔄",
        content: "Navigate between cards using these arrows and see your progress. You can also use your keyboard arrow keys for quick navigation. The progress bar shows how far you've come!",
        position: "bottom" as const,
        highlight: "card-navigation"
      },
      {
        title: "Vocabulary Browser 📖",
        content: "Browse all terms in your deck organized by learning progress. Use the search bar to quickly find specific cards you want to review. Cards are categorized by your mastery level!",
        position: "top" as const,
        highlight: "terms-section"
      },
      {
        title: "Learning Analytics 📊",
        content: "Track your learning progress and history in this sidebar. See your recent activity, upcoming quiz schedules, and detailed analytics about your study patterns!",
        position: "left" as const,
        highlight: "learning-history"
      }
    ];
    
    const { hint, generateHint, clearHint } = useHint();
    const { updateFavorite } = useUpdateFavorite();
  
    const { stillLearning, notStudied, completed } = organizeCardsByScore(cards);
  
    useAutoPlay(autoPlay, isFlipped, currentCardIndex, cards.length, setIsFlipped, setCurrentCardIndex, setAutoPlay);

    // Reset hint whenever the current card changes
    useEffect(() => {
      clearHint();
      setIsFlipped(false);
    }, [currentCardIndex]);

    // Tour step highlights
    useEffect(() => {
      if (isTourActive) {
        const stepHighlights = [
          'deck-navigation', 'flashcard-area', 'deck-controls', 'card-navigation', 'terms-section', 'learning-history'
        ];
        setHighlightedElement(stepHighlights[currentStep]);
        
        // Auto-scroll to highlighted element
        setTimeout(() => {
          const element = document.querySelector(`[data-tour-id="${stepHighlights[currentStep]}"]`);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest' 
            });
          }
        }, 100);
      } else {
        setHighlightedElement(null);
      }
    }, [currentStep, isTourActive]);

    const handleNext = () => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    };

    const handlePrev = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    const handleSkip = () => {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('tour');
      navigate(newUrl.pathname);
      setCurrentStep(0);
      setHighlightedElement(null);
    };

    const handleFinish = () => {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('tour');
      navigate(newUrl.pathname);
      setCurrentStep(0);
      setHighlightedElement(null);
    };
  
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
        clearHint();
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
      <div className="min-h-screen">
        {/* Main container with proper max width and centering */}
        <div className="max-w-7xl mx-auto pt-5 px-4 md:px-6 lg:px-8">
          <div className="flex flex-col xl:flex-row gap-12 xl:gap-24">
            {/* Main content area */}
            <div className="flex-1 xl:max-w-[70%] -ml-8">
              <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-6">{deckName}</h1>
              
              {/* Deck Navigation Links */}
              <div className={`transition-all duration-300 ${
                highlightedElement === 'deck-navigation' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg rounded-lg p-2' : ''
              }`} data-tour-id="deck-navigation">
                <DeckLinks id={id!} cardsLength={cards.length} />
              </div>
              
              {cards.length > 0 ? (
                <>
                  {/* FlashCard section with consistent centering */}
                  <div className={`flex flex-col items-center w-full mb-8 transition-all duration-300 ${
                    highlightedElement === 'flashcard-area' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg rounded-lg p-4' : ''
                  }`} data-tour-id="flashcard-area">
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
                    
                    {/* Controls centered with card */}
                    <div className="w-full max-w-[875px] mx-auto mt-6">
                      <div className={`transition-all duration-300 ${
                        highlightedElement === 'deck-controls' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg rounded-lg p-2' : ''
                      }`} data-tour-id="deck-controls">
                        <DeckControls 
                          onPlay={() => setAutoPlay(!autoPlay)}
                          onShuffle={() => {/* Implement shuffle */}}
                          id={id}
                        />
                      </div>
                      
                      <div className={`mt-6 transition-all duration-300 ${
                        highlightedElement === 'card-navigation' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg rounded-lg p-2' : ''
                      }`} data-tour-id="card-navigation">
                        <DeckNavigation 
                          currentCardIndex={currentCardIndex}
                          cardsLength={cards.length}
                          onMoveLeft={handleMoveLeft}
                          onMoveRight={handleMoveRight}
                        />
                      </div>
                      <Progress value={(currentCardIndex + 1) / cards.length * 100} className="w-full max-h-1 mt-6" />
                    </div>
                  </div>

                  <div className="mb-8">
                    <CreatorBar id={id!} />
                  </div>
                  
                  {/* Terms section */}
                  <div className={`pt-8 transition-all duration-300 ${
                    highlightedElement === 'terms-section' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg rounded-lg p-4' : ''
                  }`} data-tour-id="terms-section">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 w-full mb-8">
                      <h1 className="text-3xl font-bold flex-shrink-0">Terms in this set ({cards.length})</h1>
                      <form className="relative flex-1 max-w-lg"> 
                        <Input  
                          type="text" 
                          placeholder="Find any term/definition..." 
                          className="w-full pl-3 pr-10 py-2 rounded-full
                          border border-transparent
                          focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-500
                          transition-all duration-200 ease-in-out"
                          value={searchTerm}
                          onChange={handleSearchChange} 
                        />
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
                    
                    <div className="space-y-6">
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
                  </div>
                </>
              ) : (
                <>
                  <NoCard />
                  <CreatorBar id={id!} />
                </>
              )}
            </div>
            
            {/* Sidebar for learning history */}
            <div className={`w-full -mr-8 xl:w-[350px] xl:flex-shrink-0 transition-all duration-300 ${
              highlightedElement === 'learning-history' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg rounded-lg p-2' : ''
            }`} data-tour-id="learning-history">
              <div className="xl:sticky xl:top-5">
                <LearningHistory deckId={id!} />
              </div>
            </div>
          </div>
        </div>

        {/* Beautiful Coach Mark Component */}
        {isTourActive && (
          <CoachMark
            step={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
            onFinish={handleFinish}
            title={tourSteps[currentStep].title}
            content={tourSteps[currentStep].content}
            position={tourSteps[currentStep].position}
          />
        )}
      </div>
    );
}