import useFetchDeck from "@/state/hooks/useFetchDeck";
import { Card } from "@/types";
import { useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import demoVideo from '../../assets/match_demo.gif';


interface GameCard extends Card {
    type: 'eng' | 'userLang'
}

const shakeAnimation = {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.3 }
}

export const MatchGame = () => {
    const { id } = useParams<{ id: string }>()
    const { cards } = useFetchDeck(id)
    const [gameCards, setGameCards] = useState<GameCard[]>([])
    const [selectedCards, setSelectedCards] = useState<string[]>([]) 
    const [matchedPairs, setMatchedPairs] = useState<string[]>([])
    const [incorrectPair, setIncorrectPair] = useState<string[]>([])
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [isGameCompleted, setIsGameCompleted] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [showPenalty, setShowPenalty] = useState(false)

    const TIME_PENALTY = 5000;


    useEffect(() => {
        if (cards) resetGame()
    }, [cards])

    useEffect(() => {
        const timer = setInterval(() => {
            if (!isGameCompleted) {
                setTimeElapsed(prev => prev + 10)
            }
        }, 10)
        return () => clearInterval(timer)
    }, [isGameCompleted])

    useEffect(() => {
        if (selectedCards.length === 2) {
            const [first, second] = selectedCards
            const firstCard = gameCards.find(card => card._id + '-' + card.type === first)
            const secondCard = gameCards.find(card => card._id + '-' + card.type === second)
            if (
                firstCard && secondCard && (
                    (firstCard.engCard === secondCard.engCard) ||
                    (firstCard.userLangCard === secondCard.userLangCard)
                )
            ) {
                setShowPenalty(false)
                const newMatchedPairs = [...matchedPairs, first, second]
                setMatchedPairs(newMatchedPairs)
                if (newMatchedPairs.length === gameCards.length) {
                    setIsGameCompleted(true)
                }
                setTimeout(() => setSelectedCards([]), 500)
            } else {
                setIncorrectPair([first, second])
                setTimeElapsed(prevTime => prevTime + TIME_PENALTY)
                setTimeout(() => {
                    setIncorrectPair([])
                    setSelectedCards([])
                    setShowPenalty(true)
                }, 800)
            }
        }
    }, [selectedCards, gameCards])

    const resetGame = () => {
        setSelectedCards([])
        setMatchedPairs([])
        setIncorrectPair([])
        setTimeElapsed(0)
        setIsGameCompleted(false)
        if (cards) {
            const filteredCards = cards.filter(card => card.cardScore < 3)
            const selected = filteredCards.slice(0, 6)

            const allCards = selected.flatMap(card => [
                { ...card, type: 'eng' as const },
                { ...card, type: 'userLang' as const }
            ])

            const shuffled = allCards.sort(() => 0.5 - Math.random())
            setGameCards(shuffled)
        }
    }

    const handleCardClick = (cardId: string) => {
        if (selectedCards.length < 2 && !selectedCards.includes(cardId) && !matchedPairs.includes(cardId)) {
            setSelectedCards(prev => [...prev, cardId])
        }
    }

    const renderCard = (card: GameCard) => {
        const cardId = card._id + '-' + card.type
        const isMatched = matchedPairs.includes(cardId)
        const isSelected = selectedCards.includes(cardId)
        const isIncorrect = incorrectPair.includes(cardId)

        return (
            <AnimatePresence>
                <motion.div
                    animate={isIncorrect ? shakeAnimation : {}}
                    className={`cursor-pointer w-full aspect-[4/3] rounded-lg shadow-md flex items-center justify-center p-4 text-center 
                        ${isSelected ? 'bg-blue-100 ' : 'bg-white '}
                        ${isIncorrect ? 'bg-red-100 ' : ' '}
                        ${isMatched ? 'opacity-0' : 'opacity-100'}`}
                    onClick={() => !isMatched && handleCardClick(cardId)}
                >
                    <span className="text-lg">
                        {card.type === 'eng' ? card.engCard : card.userLangCard}
                    </span>
                </motion.div>
            </AnimatePresence>
        )
    }

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 h-screen mt-8">
            {!gameStarted ? (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to play?</h2>
                    <p className="mb-4">
                        Match all the terms with their definitions as fast as you can. 
                        Avoid wrong matches, they add extra time!
                    </p>
                    <img src={demoVideo} alt="Game preview" className="mb-4" />
                    <Button onClick={() => setGameStarted(true)}>
                        Start Game
                    </Button>
                </div>
            ) : (
                <>
                    <div className="w-full flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <Button variant="ghost" className="mr-2">
                                <Shuffle className="w-4 h-4" />
                            </Button>
                            <h2 className="text-2xl font-semibold">Match</h2>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm mr-4">
                                {(timeElapsed / 1000).toFixed(1)}s
                                {showPenalty && (
                                    <span className="text-red-500 ml-2">
                                        +5s penalty!
                                    </span>
                                )}
                            </span>
                            <Button variant="ghost">Options</Button>
                            <Button variant="ghost">
                                Return to Deck Details
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 w-full">
                        {gameCards.map((card, _index) => (
                            <React.Fragment key={`${card._id}-${card.type}`}>
                                {renderCard(card)}
                            </React.Fragment>
                        ))}
                    </div>
                    {isGameCompleted && (
                        <div className="mt-4 text-lg font-semibold">
                            Time Taken: {(timeElapsed / 1000).toFixed(1)}s
                        </div>
                    )}                
                </>
            )}
        </div>
    )
};