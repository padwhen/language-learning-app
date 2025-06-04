import { toast } from "@/components/ui/use-toast";
import { Card } from "@/types";
import React, { useState } from "react";
import { LearningStep } from "../types";
import { CheckCircle, Lightbulb, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardTypeToLearn } from "../types";
import { Checkbox } from "@/components/ui/checkbox";

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
    const [isCardFadingOut, setIsCardFadingOut] = useState(false)

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

    const applyRecommendedSettings = () => {
        setIsCardFadingOut(true)

        setCardsToLearn(recommendCount)
        setCardTypeToLearn('Not studied')
        setIncludeCompletedCards(false)
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


    return (
        <div className={`space-y-8 p-8 animate-fadeIn ${animationClass}`}>
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-blue-500">Customize Your Session</h2>
                <p className="text-gray-600">Tailor your learning experience to maximize result</p>
            </div>
            {/* Recommendation Card -> Should there be an algorithm determining this? */}
            {showRecommendationCard && (
                <div className={`border-2 border-yellow-200 rounded-xl p-6 relative overflow-hidden transition-all duration-500 ease-out transform ${
                    isCardFadingOut
                    ? 'opacity-0 scale-95 -translate-y-4'
                    : 'opacity-100 scale-100 translate-y-0'
                }`}>
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
                        {/* Add sources for this */}
                        <p className="text-sm text-yellow-600 mb-4">
                            Why 8 cards? Research shows that 7±2 items is the optimal range for working memory, making 8 cards perfect for effective learning without cognitive overload.
                        </p>
                        <Button
                            onClick={applyRecommendedSettings}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg transform hover:scale-105 transition-all duration-200"
                        >
                            Apply Recommended Settings ✨
                        </Button>
                    </div>
                </div>                
            )}
            <div className="grid gap-6">
                <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-700">
                        Number of cards to learn
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getCardCountOptions().map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setCardsToLearn(option.value)}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 transform hover:scale-105 ${
                                    cardsToLearn === option.value
                                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-gray-800">{option.label}</div>
                                        <div className="font-sm text-gray-600">{option.duration}</div>
                                    </div>
                                    {cardsToLearn === option.value && (
                                        <CheckCircle className="w-6 h-6 text-blue-500" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                {/* Card Type Selection */}
                <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-700">Focus on</Label>
                    <Select
                        value={cardTypeToLearn}
                        onValueChange={(value: CardTypeToLearn) => setCardTypeToLearn(value)}
                    >
                        <SelectTrigger className="h-12 text-lg border-2 hover:border-gray-300 transition-colors">
                            <SelectValue placeholder='Select card type' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">🎯 All Cards</SelectItem>
                            <SelectItem value='Not studied'>🌟 Not Studied (New)</SelectItem>
                            <SelectItem value='Learning'>📚 Currently Learning</SelectItem>
                            <SelectItem value='Completed'>✅ Completed Cards</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Optional Settings */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Optional Settings
                    </h3>
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="includeCompleted"
                            checked={includeCompletedCards}
                            onCheckedChange={(checked) => setIncludeCompletedCards(checked as boolean)}
                        />
                        <Label htmlFor="includeCompleted" className="text-gray-700">
                            Include completed cards for review
                        </Label>
                    </div>
                </div>
            </div>
            <div className="flex justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={() => nextStep('intro')}
                    className="px-8 py-3 text-lg"
                >
                    ← Back
                </Button>
                <Button
                    onClick={() => nextStep('preview')}
                    className="px-8 py-3 text-lg"
                >
                    Preview Cards →
                </Button>
            </div>
        </div>
    )
}