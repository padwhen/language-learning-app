import { useEffect, useState } from "react";
import ReactCardFlip from "react-card-flip";
import { FrontCard } from "./components/FlashCardComponents/FrontCard";
import { BackCard } from "./components/FlashCardComponents/BackCard";
import { MoveLeft, MoveRight, Play, Settings, Shuffle } from "lucide-react";
import { ToolTip } from "./components/ToolTip";
import { Progress } from "@/components/ui/progress";
import { CreatorBar } from "./components/DeckDetailsComponents/Creator";
import { Word } from "./components/DeckDetailsComponents/Word";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { organizeCardsByScore } from "./composables/SortCard";

export const DeckDetailsPage = () => {
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0); 
    const [deck, setDeck] = useState<any>({ cards: [] }); 
    const [autoPlay, setAutoPlay] = useState<boolean>(false)

    const { deckName, deckPercentage, deckTags, owner, cards } = deck;
    const { stillLearning, notStudied, completed } = organizeCardsByScore(cards)
    const { id } = useParams();

    const fetchDeck = async () => {
        await axios.get(`/decks/${id}`).then((response) => setDeck(response.data));
    };

    useEffect(() => {
        fetchDeck();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (autoPlay) {
            interval = setInterval(() => {
                if (currentCardIndex < cards.length - 1) {
                    setIsFlipped(!isFlipped); // Flip the card
                    setTimeout(() => { // Wait for 1 second
                        setIsFlipped(!isFlipped); // Flip back the card
                        setCurrentCardIndex(currentCardIndex + 1); // Move to the next card
                    }, 2000);
                } else {
                    setAutoPlay(false); // Stop autoplay if at the last card
                }
            }, 1000); // Adjust the delay based on your preference
        }
    
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoPlay, currentCardIndex, cards.length]);
    

    const moveLeft = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
        }
    };
    const moveRight = () => {
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        }
    };


    return (
        <div className="pt-[50px] ml-16">
            <h1 className="text-4xl font-bold mt-4">{deckName}</h1>
            <div className="pt-5 flex flex-row gap-[25px]">
                <a className="text-2xl inline-block px-8 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 w-[200px] text-center">Flashcards</a>
                <a className="text-2xl inline-block px-8 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 w-[200px] text-center">
                    <Link to={`/learn-decks/${id}`}>Learn</Link>
                </a>
                <a className="text-2xl inline-block px-8 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 w-[200px] text-center">Match</a>
                <a className="text-2xl inline-block px-8 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 w-[200px] text-center">Test</a>
            </div>
            <div className="w-[875px] border mt-5">
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
                    <div className="border rounded-full hover:bg-gray-200 transition duration-300 transform hover:-translate-x-1" onClick={moveLeft}>
                        <MoveLeft size={45} />
                    </div>
                    <div className="text-3xl">{currentCardIndex + 1} / {cards.length}</div>
                    <div className="border rounded-full hover:bg-gray-200 transition duration-300 transform hover:translate-x-1" onClick={moveRight}>
                        <MoveRight size={45} />
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <ToolTip trigger={<Settings />} content="Settings" />
                </div>
            </div>
            <div className="pt-2">
                <Progress value={29} className="max-w-[875px] max-h-1"  />
            </div>
            <div className="pt-[50px]">
                <CreatorBar />
            </div>
            <div className="pt-6">
                <h1 className="text-3xl font-bold">Terms in this set ({cards.length})</h1>
                {stillLearning.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-pink-500 pt-3">Still learning ({stillLearning.length})</h2>
                        <h3 className="text-gray-500 text-lg">You've begun learning these terms. Keep up the good work!</h3>
                        <div className="flex flex-col gap-3 mt-2">
                            {stillLearning.map((card: any) => (
                                <Word key={card._id} engCard={card.engCard} userLangCard={card.userLangCard} />
                            ))}
                        </div>
                    </div>) : (
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-pink-500 pt-3">Still learning ({stillLearning.length})</h2>
                        <h3 className="text-gray-500 text-md">There are no cards in "Still learning".</h3>
                    </div>)}
                {notStudied.length > 0 ? (
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-pink-500 pt-3">Not studided ({notStudied.length})</h2>
                    <h3 className="text-gray-500 text-lg">You haven't studied these terms yet.</h3>
                    <div className="flex flex-col gap-3 mt-2">
                        {notStudied.map((card: any) => (
                            <Word key={card._id} engCard={card.engCard} userLangCard={card.userLangCard} />
                        ))}
                    </div>
                </div>) : (
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-pink-500 pt-3">Not studied ({stillLearning.length})</h2>
                    <h3 className="text-gray-500 text-md">There are no cards in "Not studied".</h3>
                </div>)}
                {completed.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-pink-500 pt-3">Completed ({completed.length})</h2>
                        <h3 className="text-gray-500 text-lg">Congratulations!</h3>
                        <div className="flex flex-col gap-3 mt-2">
                            {completed.map((card: any) => (
                                <Word key={card._id} engCard={card.engCard} userLangCard={card.userLangCard} />
                            ))}
                        </div>
                    </div>) : (
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-pink-500 pt-3">Still learning ({completed.length})</h2>
                        <h3 className="text-gray-500 text-md">There are no cards in "Completed".</h3>
                </div>)}
            </div>
        </div>
    );
};
