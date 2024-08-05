import { useCallback, useEffect, useState } from "react"
import useFetchDeck from "./useFetchDeck"
import { GameCard, GameOptions } from "@/types"


const shuffleArray = <T>(array: T[]): T[] => {
    return [...array].sort(() => 0.5 - Math.random())
}

export const useMatchGame = (deckId: string) => {
    const { cards } = useFetchDeck(deckId)
    const [gameCards, setGameCards] = useState<GameCard[]>([])
    const [selectedCards, setSelectedCards] = useState<string[]>([])
    const [matchedPairs, setMatchedPairs] = useState<string[]>([])
    const [incorrectPair, setIncorrectPair] = useState<string[]>([])
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [isGameCompleted, setIsGameCompleted] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [showPenalty, setShowPenalty] = useState(false)
    const [gameOptions, setGameOptions] = useState<GameOptions>({
        showTimer: true,
        allowDeselect: false
    })
    const TIME_PENALTY = 5000

    useEffect(() => {
        if (cards) resetGame()
    }, [cards])

    useEffect(() => {
        let timer: number
        if (gameStarted && !isGameCompleted) {
            timer = window.setInterval(() => {
                setTimeElapsed(prev => prev + 10)
            }, 10)
        }
        return () => {
            if (timer) clearInterval(timer)
        }
    }, [gameStarted, isGameCompleted])

    useEffect(() => {
        checkForMatch()
    }, [selectedCards])

    const startGame = useCallback(() => {
        setGameStarted(true)
        setTimeElapsed(0)
    }, [])

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

    const shuffleCards = () => {
        setGameCards(shuffleArray([...gameCards]))
    }

    const handleCardClick = (cardId: string) => {
        // Card deselection
        if (selectedCards.includes(cardId) && gameOptions.allowDeselect) {
            setSelectedCards(prev => prev.filter(id => id !== cardId))
        } else if (selectedCards.length < 2 && !selectedCards.includes(cardId) && !matchedPairs.includes(cardId)) {
            setSelectedCards(prev => [...prev, cardId])
        }
    }

    const checkForMatch = () => {
        if (selectedCards.length === 2) {
            const [first, second] = selectedCards
            const firstCard = gameCards.find(card => card._id + '-' + card.type === first)
            const secondCard = gameCards.find(card => card._id + '-' + card.type === second)

            if (
                firstCard && secondCard && (
                    (firstCard.engCard === secondCard.engCard) || 
                    (firstCard.userLangCard === secondCard.engCard)
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
                    setShowPenalty(false)
                }, 800)
            }
        }
    }

    return {
        gameCards, 
        selectedCards,
        matchedPairs,
        incorrectPair,
        timeElapsed,
        isGameCompleted,
        gameStarted,
        showPenalty,
        gameOptions,
        shuffleCards,
        handleCardClick,
        startGame,
        resetGame,
        setGameOptions
    }
}