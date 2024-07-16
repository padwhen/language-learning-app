import axios from "axios";
import ReactCardFlip from "react-card-flip";
import { useEffect, useState } from "react";
import { FrontCard } from "./components/FlashCardComponents/FrontCard";
import { BackCard } from "./components/FlashCardComponents/BackCard";
import { MoveLeft, MoveRight, Play, Settings, Shuffle } from "lucide-react";
import { ToolTip } from "./composables/ToolTip";
import { Progress } from "@/components/ui/progress";
import { CreatorBar } from "./components/DeckDetailsComponents/Creator";
import { Link, useParams } from "react-router-dom";
import { organizeCardsByScore } from "./composables/SortCard";
import { NoCard } from "./components/FlashCardComponents/NoCard";
import { CardCategory } from "./components/DeckDetailsComponents/CardCategory";
import { moveLeft, moveRight } from "./utils/cardNavigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { useKeyboardNavigation } from "./utils/useKeyboardNavigation";
import { LearningHistory } from "./components/DeckDetailsComponents/LearningHistory";

export const DeckDetailsPage = () => {
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0); 
    const [deck, setDeck] = useState<any>({ cards: [] }); 
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const [hint, setHint] = useState<string>('')

    const { deckName, cards } = deck;
    const { stillLearning, notStudied, completed } = organizeCardsByScore(cards);
    const { id } = useParams();

    useEffect(() => {
        const fetchDeck = async () => {
            await axios.get(`/decks/${id}`).then((response) => setDeck(response.data));
        };
        fetchDeck();
    }, [id]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (autoPlay) {
            interval = setInterval(() => {
                if (currentCardIndex < cards.length - 1) {
                    if (!isFlipped) {
                        // If showing front, flip to back
                        setIsFlipped(true);
                    } else {
                        // If showing back, move to next card and show front
                        setIsFlipped(false);
                        setCurrentCardIndex(prevIndex => prevIndex + 1);
                    }
                } else if (currentCardIndex === cards.length - 1) {
                    if (!isFlipped) {
                        // If at last card and showing front, flip to back
                        setIsFlipped(true);
                    } else {
                        // If at last card and showing back, stop autoplay
                        setAutoPlay(false);
                    }
                }
            }, 2000); // Adjust timing as needed
        }
        return () => { if (interval) clearInterval(interval); };
    }, [autoPlay, currentCardIndex, cards.length, isFlipped]);

    const handleMoveLeft = () => { 
        moveLeft(currentCardIndex, setCurrentCardIndex)
        setHint('')
    }
    const handleMoveRight = () => { 
        moveRight(currentCardIndex, deck.cards.length, setCurrentCardIndex)
        setHint('')
    }

    const hasCards = cards.length > 0;
    const hasMultipleCards = cards.length > 1;

    const aStyle = "text xl md:text-2xl inline-block px-4 md:px-8 py-3 rounded-sm border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 w-full sm:w-[205px] text-center";
    const moveLeftRightStyle = "border rounded-full hover:bg-gray-200 transition duration-300"

    useKeyboardNavigation(handleMoveLeft, handleMoveRight, currentCardIndex, cards.length)

    const generateHint = () => {
        const word = cards[currentCardIndex]?.engCard
        if (!word) return
        if (word.length < 2) {
            setHint(word)
        } else {
            const hintArray = word.split('').map((char: string, index: number) => {
                if (index === 0 || index === word.length - 1) {
                    return char
                }
                return " _ "
            })
            setHint(hintArray.join(''))
        }
    }

    const handleCardClick = (event: React.MouseEvent) => {
        if (!(event.target as HTMLElement).closest('button')) {
            setIsFlipped(!isFlipped)
        }
    }

    const handleGenerateHint = () => {
        generateHint()
    }

    return (
        <div className="pt-5 px-4 md:px-8 lg:px-16 flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-3/4">
            <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-6">{deckName}</h1>
            <div className="flex flex-wrap gap-4 mb-6">
                <Link to={`/flashcards/${id}`} className={aStyle}>Flashcards</Link>
                <Link to={`/learn-decks/${id}`} data-testid="learn-link" className={aStyle}>
                    {cards.length >= 4 ? (
                        <a>Learn</a>
                    ) : (
                        <TooltipProvider><Tooltip>
                            <TooltipTrigger><span data-testid="cannot-learn-link" className="opacity-50 cursor-not-allowed">Learn</span></TooltipTrigger>
                            <TooltipContent>Since "Learn" will create quizzes with options based on your flashcards, you need to have more than 4 flashcards</TooltipContent>
                        </Tooltip></TooltipProvider>
                    )}
                </Link>
                <Link to={`/matchgame/${id}`} className={aStyle}>Match</Link>
                <a className={aStyle}>Test</a>
            </div>
            {hasCards ? (
                <>
                    <div className="w-full max-w-[875px] border mt-5" data-testid="card-flip-container">
                        <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
                            <div key="front" onClick={handleCardClick}>
                                <FrontCard word={cards[currentCardIndex]?.userLangCard} hint={hint} onGenerateHint={handleGenerateHint} />
                            </div>
                            <div key="back" onClick={() => setIsFlipped(!isFlipped)}>
                                <BackCard word={cards[currentCardIndex]?.engCard} />
                            </div>
                        </ReactCardFlip>  
                    </div>    
                    <div className="pt-4 flex flex-wrap justify-between max-w-[875px]">
                        <div className="flex gap-4 items-center justify-center mb-4 w-full sm:w-auto">
                            <ToolTip trigger={<Play />} content="Play" onClick={() => setAutoPlay(!autoPlay)} />
                            <ToolTip trigger={<Shuffle />} content="Shuffle" />
                        </div>
                        <div className="flex items-center justify-center gap-5 mb-4 w-full sm:w-auto">
                            <div data-testid="move-left"
                                className={`${moveLeftRightStyle} transform hover:-translate-x-1 ${currentCardIndex === 0 || !hasMultipleCards ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}
                                onClick={currentCardIndex !== 0 && hasMultipleCards ? handleMoveLeft : undefined}>
                                <MoveLeft className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-[45px] lg:h-[45px]" />                            </div>
                            <div data-testid="current-card-number" className="text-3xl">{currentCardIndex + 1} / {cards.length}</div>
                            <div data-testid="move-right"
                                 className={`${moveLeftRightStyle} transform hover:translate-x-1 ${currentCardIndex === cards.length - 1 || !hasMultipleCards ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}
                                 onClick={currentCardIndex !== cards.length - 1 && hasMultipleCards ? handleMoveRight : undefined}>
                                <MoveRight className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-[45px] lg:h-[45px]" />
                            </div>
                        </div>
                        <div className="flex items-center justify-center w-full sm:w-auto">
                            <ToolTip trigger={<Settings />} content="Settings" />
                        </div>
                    </div>
                    <div data-testid="progress-bar" className="pt-2">
                        <Progress value={(currentCardIndex + 1) / cards.length * 100} className="w-full max-w-[875px] max-h-1 mx-auto mt-4"  />
                    </div>
                    <div className="pt-[50px]">
                        <CreatorBar id={id as string} />
                    </div>
                    <div className="pt-6">
                        <h1 className="text-3xl font-bold">Terms in this set ({cards.length})</h1>
                        <CardCategory categoryName="Still learning" cards={stillLearning} id={id} />
                        <CardCategory categoryName="Not studied" cards={notStudied} id={id} />
                        <CardCategory categoryName="Completed" cards={completed} id={id} />
                    </div>
                </>
            ) : (
                <>
                <NoCard />
                <div className="pt-[50px]">
                    <CreatorBar id={id as string} />
                </div></>
            )}
            </div>
            <div className="w-full lg:w-1/4 pt-5 lg:ml-6">
                <LearningHistory deckId={id} />
            </div>
        </div>
    );
};
