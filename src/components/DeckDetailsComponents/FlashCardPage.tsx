import useFetchDeck from "@/state/hooks/useFetchDeck"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Progress } from "../ui/progress"
import { BackCard } from "../FlashCardComponents/BackCard"
import { FrontCard } from "../FlashCardComponents/FrontCard"
import { Button } from "../ui/button"
import { Check, Shuffle, X } from "lucide-react"
import ReactCardFlip from "react-card-flip"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/types"

export const FlashcardPage = () => {
    const { id } = useParams()
    const { deck, cards, setCards } = useFetchDeck(id)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [hint, setHint] = useState('')

    if (!deck || !cards) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    const currentCard = cards[currentCardIndex]

    const handleFlip = () => {
        setHint('')
        setIsFlipped(!isFlipped)
    }

    const handleGenerateHint = () => {
        const engWord = currentCard.engCard
        const words = engWord.split(' ')
        const hintWords = words.map(word => `${word[0]}${'_'.repeat(word.length - 2)}${word[word.length - 1]}`)
        setHint(hintWords.join(' '))
    }

    const handleAnswer = () => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % cards.length)
        setIsFlipped(false)
        setHint('')
    }

    const handleCardClick = (event: React.MouseEvent) => {
        if (!(event.target as HTMLElement).closest('button')) {
            setIsFlipped(!isFlipped)
        }
    }

    const shuffleArray = (array: Card[]) => {
        const shuffledArray = array.slice()
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray
    }

    const handleShuffle = () => {
        const shuffledCards = shuffleArray(cards)
        setCurrentCardIndex(0)
        setCards(shuffledCards)
    }


    return (
        <div className="flex flex-col items-center justify-center mt-4 sm:mt-16 w-full max-w-3xl mx-auto px-4 sm:px-0">
            <div className="w-full mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">{deck.deckName}</h2>
                    <span className="text-sm text-gray-500">
                        { currentCardIndex + 1 } / { cards.length }
                    </span>
                </div>
                <Progress value={((currentCardIndex + 1) / cards.length) * 100} className="w-full" /> 
            </div>

            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentCardIndex}
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 30 }}
                    className="w-full bg-white rounded-lg shadow-md overflow-hidden" onClick={handleFlip}
                >
                <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
                    <div key="front" onClick={handleCardClick}>
                        <FrontCard word={cards[currentCardIndex]?.userLangCard} hint={hint} onGenerateHint={handleGenerateHint} />
                    </div>
                    <div key="back" onClick={() => setIsFlipped(!isFlipped)}>
                        <BackCard word={cards[currentCardIndex]?.engCard} />
                    </div>
                </ReactCardFlip>  
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-center space-x-4 mt-4"> 
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
                    onClick={() => handleAnswer()}
                >
                    <X className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
                    onClick={() => handleAnswer()}
                >
                    <Check className="text-green-500 w-6 h-6 sm:w-8 sm:h-8" />
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between w-full mt-4 gap-2">
                <div className="flex justify-center sm:justify-start space-x-2">
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm" onClick={handleShuffle}>
                        <Shuffle className="w-4 h-4 mr-1" /> Shuffle
                    </Button>
                </div>
                <div className="flex justify-center sm:justify-end space-x-2">
                    <Link to={`/learn-decks/${id}`}>
                        <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                            Practice in Learn
                        </Button>
                    </Link>
                </div>
            </div>

        </div>
    )
}