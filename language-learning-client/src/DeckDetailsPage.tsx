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

export const DeckDetailsPage = () => {
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0); 
    const [deck, setDeck] = useState<any>({ cards: [] }); 
    const [autoPlay, setAutoPlay] = useState<boolean>(false);

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
                    setIsFlipped(true); // Flip the card
                    setTimeout(() => {
                        setIsFlipped(false); // Flip back the card
                        setCurrentCardIndex(currentCardIndex + 1); // Move to the next card
                    }, 2000);
                } else {
                    setAutoPlay(false); // Stop autoplay if at the last card
                }
            }, 1000); // Adjust the delay based on your preference
        }
        return () => { if (interval) clearInterval(interval); };
    }, [autoPlay, currentCardIndex, cards.length, isFlipped]);

    const handleMoveLeft = () => { moveLeft(currentCardIndex, setCurrentCardIndex)}
    const handleMoveRight = () => { moveRight(currentCardIndex, deck.cards.length, setCurrentCardIndex)}

    const hasCards = cards.length > 0;
    const hasMultipleCards = cards.length > 1;

    const aStyle = "text-2xl inline-block px-8 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 w-[200px] text-center";
    const moveLeftRightStyle = "border rounded-full hover:bg-gray-200 transition duration-300"

    useKeyboardNavigation(handleMoveLeft, handleMoveRight, currentCardIndex, cards.length)

    return (
        <div className="pt-[20px] ml-16 flex gap-8">
            <div>
            <h1 className="text-4xl font-bold mt-4">{deckName}</h1>
            <div className="pt-5 flex flex-row gap-[25px]">
                <a className={aStyle}>Flashcards</a>
                <a className={aStyle}>
                    {cards.length >= 4 ? (
                        <Link to={`/learn-decks/${id}`} data-testid="learn-link">Learn</Link>
                    ) : (
                        <TooltipProvider><Tooltip>
                            <TooltipTrigger><span data-testid="cannot-learn-link" className="opacity-50 cursor-not-allowed">Learn</span></TooltipTrigger>
                            <TooltipContent>Since "Learn" will create quizzes with options based on your flashcards, you need to have more than 4 flashcards</TooltipContent>
                        </Tooltip></TooltipProvider>
                    )}
                </a>
                <a className={aStyle}>Match</a>
                <a className={aStyle}>Test</a>
            </div>
            {hasCards ? (
                <>
                    <div className="w-[875px] border mt-5" data-testid="card-flip-container">
                        <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
                            <div key="front" onClick={() => setIsFlipped(!isFlipped)}>
                                <FrontCard word={cards[currentCardIndex]?.userLangCard} />
                            </div>
                            <div key="back" onClick={() => setIsFlipped(!isFlipped)}>
                                <BackCard word={cards[currentCardIndex]?.engCard} />
                            </div>
                        </ReactCardFlip>  
                    </div>    
                    <div className="pt-4 flex justify-between max-w-[875px]">
                        <div className="flex gap-4 items-center justify-center">
                            <ToolTip trigger={<Play />} content="Play" onClick={() => setAutoPlay(!autoPlay)} />
                            <ToolTip trigger={<Shuffle />} content="Shuffle" />
                        </div>
                        <div className="flex items-center justify-center gap-5">
                            <div data-testid="move-left"
                                className={`${moveLeftRightStyle} transform hover:-translate-x-1 ${currentCardIndex === 0 || !hasMultipleCards ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}
                                onClick={currentCardIndex !== 0 && hasMultipleCards ? handleMoveLeft : undefined}>
                                <MoveLeft size={45} />
                            </div>
                            <div data-testid="current-card-number" className="text-3xl">{currentCardIndex + 1} / {cards.length}</div>
                            <div data-testid="move-right"
                                 className={`${moveLeftRightStyle} transform hover:translate-x-1 ${currentCardIndex === cards.length - 1 || !hasMultipleCards ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}
                                 onClick={currentCardIndex !== cards.length - 1 && hasMultipleCards ? handleMoveRight : undefined}>
                                <MoveRight size={45} />
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <ToolTip trigger={<Settings />} content="Settings" />
                        </div>
                    </div>
                    <div data-testid="progress-bar" className="pt-2">
                        <Progress value={(currentCardIndex + 1) / cards.length * 100} className="max-w-[875px] max-h-1"  />
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
        </div>
    );
};
