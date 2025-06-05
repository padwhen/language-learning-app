import { toast } from "@/components/ui/use-toast";
import { Card } from "@/types";
import React, { useState } from "react";
import { LearningStep } from "../types";
import { CheckCircle, Lightbulb, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardTypeToLearn } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsIntroPageProps {
    animationClass: string;
    cards: Card[];
    cardsToLearn: number
    setCardsToLearn: (count: number) => void;
    cardTypeToLearn: CardTypeToLearn
    setCardTypeToLearn: (type: CardTypeToLearn) => void
    includeCompletedCards: boolean;
    setIncludeCompletedCards: (include: boolean) => void
    triggerAnimation: (animationClass: string) => void
    nextStep: (step: LearningStep) => void
}

export const SettingsIntroPage: React.FC<SettingsIntroPageProps> = ({
    animationClass,
    cards,
    cardsToLearn,
    setCardsToLearn,
    cardTypeToLearn,
    setCardTypeToLearn,
    includeCompletedCards,
    setIncludeCompletedCards,
    triggerAnimation,
    nextStep
}) => {
    const [showRecommendationCard, setShowRecommendationCard] = useState(true)
    const [_isCardFadingOut, setIsCardFadingOut] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    const notStudiedCards = cards.filter(card => !card.learning && card.cardScore !== 5).length
    const recommendCount = Math.min(8, Math.max(4, notStudiedCards))

    const getCardCountOptions = () => {
        const maxCards = Math.min(cards.length, 20)
        const options = []

        options.push({ value: 4, label: '4 cards (Quick)', duration: '~5min' })
        options.push({ value: 8, label: '8 cards (Recommended)', duration: '~10min' })
        options.push({ value: 12, label: '12 cards (Extended)', duration: '~15min' })

        if (maxCards >= 16) { options.push({ value: 16, label: '16 cards (Intensive)', duration: '~20min' }) }
        if (maxCards >= 20) { options.push({ value: 20, label: '20 cards (Marathon)', duration: '~25min' })}

        return options.filter(option => option.value <= maxCards)
    }

    const validateSettings = () => {
        const errors: string[] = []
        
        // Check if cards to learn is selected
        if (!cardsToLearn || cardsToLearn <= 0) {
            errors.push("Please select the number of cards to learn")
        }
        
        // Check if card type is selected
        if (!cardTypeToLearn) {
            errors.push("Please select which type of cards to focus on")
        }
        
        // Check if there are enough cards available
        const availableCards = getAvailableCardsCount()
        if (cardsToLearn > availableCards) {
            errors.push(`Only ${availableCards} cards available for the selected type`)
        }
        
        // Check if any cards exist
        if (cards.length === 0) {
            errors.push("No cards available to learn")
        }
        
        setValidationErrors(errors)
        return errors.length === 0
    }

    const getAvailableCardsCount = () => {
        switch (cardTypeToLearn) {
            case 'Not studied':
                return cards.filter(card => !card.learning && card.cardScore !== 5).length
            case 'Learning':
                return cards.filter(card => card.learning && card.cardScore !== 5).length
            case 'Completed':
                return cards.filter(card => card.cardScore === 5).length
            case 'All':
            default:
                return cards.length
        }
    }

    const applyRecommendedSettings = () => {
        setIsCardFadingOut(true)

        setCardsToLearn(recommendCount)
        setCardTypeToLearn('Not studied')
        setIncludeCompletedCards(false)
        setValidationErrors([]) // Clear any existing validation errors
        triggerAnimation('animate-pulse')
        toast({
            title: "Settings applied! ✨",
            description: `Ready to learn ${recommendCount} new cards`, 
            duration: 2000
        })

        setTimeout(() => {
            setShowRecommendationCard(false)
        }, 500)
    }

    const handleNextStep = () => {
        if (validateSettings()) {
            nextStep('preview')
        } else {
            toast({
                title: "Please fix the following issues:",
                description: validationErrors[0],
                variant: "destructive",
                duration: 3000
            })
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3 }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: -20,
            transition: { duration: 0.3 }
        }
    }

    return (
        <motion.div 
            className={`space-y-8 p-8 ${animationClass}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="text-center space-y-2" variants={itemVariants}>
                <h2 className="text-3xl font-bold text-blue-500">Customize Your Session</h2>
                <p className="text-gray-600">Tailor your learning experience to maximize results</p>
            </motion.div>

            {/* Validation Errors */}
            <AnimatePresence>
                {validationErrors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-red-800 mb-2">Please fix the following:</h4>
                                <ul className="space-y-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index} className="text-red-700 text-sm">• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recommendation Card */}
            <AnimatePresence>
                {showRecommendationCard && (
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="border-2 border-yellow-200 rounded-xl p-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-200 rounded-full -translate-y-10 translate-x-10 opacity-30"></div>
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-3">
                                <Lightbulb className="w-6 h-6 text-yellow-600" />
                                <h3 className="text-lg font-semibold text-yellow-800">Smart Recommendation</h3>
                            </div>
                            <p className="text-yellow-700 mb-4">
                                We recommend learning <strong>{recommendCount} "Not Studied"</strong> cards for this session.
                                This gives you the perfect balance of challenge and achievement!
                            </p>
                            <p className="text-sm text-yellow-600 mb-4">
                                Why 8 cards? Research shows that 7±2 items is the optimal range for working memory, making 8 cards perfect for effective learning without cognitive overload.
                            </p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={applyRecommendedSettings}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg"
                                >
                                    Apply Recommended Settings ✨
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>                
                )}
            </AnimatePresence>

            <motion.div className="grid gap-6" variants={itemVariants}>
                {/* Number of cards selection */}
                <div className="space-y-3">
                    <Label className={`text-lg font-semibold ${validationErrors.some(e => e.includes('cards to learn')) ? 'text-red-600' : 'text-gray-700'}`}>
                        Number of cards to learn *
                    </Label>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                        variants={containerVariants}
                    >
                        {getCardCountOptions().map((option, _index) => (
                            <motion.button
                                key={option.value}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setCardsToLearn(option.value)
                                    setValidationErrors(prev => prev.filter(e => !e.includes('cards to learn')))
                                }}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                                    cardsToLearn === option.value
                                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-gray-800">{option.label}</div>
                                        <div className="text-sm text-gray-600">{option.duration}</div>
                                    </div>
                                    <AnimatePresence>
                                        {cardsToLearn === option.value && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            >
                                                <CheckCircle className="w-6 h-6 text-blue-500" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                </div>

                {/* Card Type Selection */}
                <motion.div className="space-y-3" variants={itemVariants}>
                    <Label className={`text-lg font-semibold ${validationErrors.some(e => e.includes('type of cards')) ? 'text-red-600' : 'text-gray-700'}`}>
                        Focus on *
                    </Label>
                    <Select
                        value={cardTypeToLearn}
                        onValueChange={(value: CardTypeToLearn) => {
                            setCardTypeToLearn(value)
                            setValidationErrors(prev => prev.filter(e => !e.includes('type of cards')))
                        }}
                    >
                        <SelectTrigger className={`h-12 text-lg border-2 hover:border-gray-300 transition-colors ${
                            validationErrors.some(e => e.includes('type of cards')) ? 'border-red-300' : ''
                        }`}>
                            <SelectValue placeholder='Select card type' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">🎯 All Cards</SelectItem>
                            <SelectItem value='Not studied'>🌟 Not Studied (New)</SelectItem>
                            <SelectItem value='Learning'>📚 Currently Learning</SelectItem>
                            <SelectItem value='Completed'>✅ Completed Cards</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>

                {/* Optional Settings */}
                <motion.div 
                    className="space-y-4 p-4 bg-gray-50 rounded-lg"
                    variants={itemVariants}
                    whileHover={{ backgroundColor: "rgb(249 250 251)" }}
                >
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Optional Settings
                    </h3>
                    <motion.div 
                        className="flex items-center space-x-3"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <Checkbox
                            id="includeCompleted"
                            checked={includeCompletedCards}
                            onCheckedChange={(checked) => setIncludeCompletedCards(checked as boolean)}
                        />
                        <Label htmlFor="includeCompleted" className="text-gray-700 cursor-pointer">
                            Include completed cards for review
                        </Label>
                    </motion.div>
                </motion.div>
            </motion.div>

            <motion.div 
                className="flex justify-between pt-4"
                variants={itemVariants}
            >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="outline"
                        onClick={() => nextStep('intro')}
                        className="px-8 py-3 text-lg"
                    >
                        ← Back
                    </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={handleNextStep}
                        className="px-8 py-3 text-lg"
                        disabled={validationErrors.length > 0}
                    >
                        Preview Cards →
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}