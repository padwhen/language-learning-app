import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import React, { useState } from "react"

interface PassageSectionProps {
    passage: {
        text: string,
        translation: string,
        context: string,
        vocab_hints: Record<string, string>,
        blanks: Record<string, { options: string[], correct_answer: string }>
    },
    handleAnswer: (questionId: string, answer: string) => void
}

export const PassageSection: React.FC<PassageSectionProps> = ({ passage, handleAnswer }) => {
    const [showTranslation, setShowTranslation] = useState(false)
    const [showContext, setShowContext] = useState(false)

    const highlightVocab = (text: string) => {
        const parts = text.split(/(\s+)/) // Extract every single word in text
        return parts.map((part, index) => {
            const lowerPart = part.toLowerCase()
            const match = Object.entries(passage.vocab_hints).find(
                ([word]) => word.toLowerCase() === lowerPart
            )
            if (match) {
                const [word, translation] = match
                return (
                    <TooltipProvider key={index}>
                        <Tooltip>
                            <TooltipTrigger className="underline decoration-dotted decoration-blue-500 hover:text-blue-600 transition-colors">
                                {word}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{translation}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }
            return part
        })
    }

    return (
        <Card className="mb-4 max-w-4xl mx-auto">
            <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Fill in the blanks</h3>
                <div className="mb-4 space-x-2">
                    <Button onClick={() => setShowTranslation(!showTranslation)}
                            variant="outline"
                            size="sm"
                            className="mr-2">
                        {showTranslation ? 'Hide' : 'Show'} Translation
                    </Button>
                    <Button onClick={() => setShowContext(!showContext)}
                            variant="outline"
                            size="sm">
                        {showContext ? 'Hide' : 'Show'} Context
                    </Button>
                </div>
                {showContext && (
                    <div className="bg-gray-100 p-3 rounded-md mb-4">
                        <h1 className="text-sm font-bold mb-1">Context of this passage:</h1>
                        <p className="text-sm">{passage.context}</p>
                    </div>
                )}
                <div className="mb-4 text-lg">
                    {highlightVocab(passage.text)}
                </div>
                {showTranslation && (
                    <div className="bg-gray-100 p-3 rounded mb-4">
                        <h1 className="text-sm font-bold mb-1">Translation of this passage:</h1>
                        <p className="text-sm">{passage.translation}</p>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {Object.entries(passage.blanks).map(([id, blank]: [string, any], index) => (
                        <div key={id} id={`question_${index + 1}`}>
                            <Label className="font-semibold mb-2 block">Blank {id}</Label>
                            <RadioGroup onValueChange={(value) => handleAnswer(`passage_${id}`, value)}>
                                <div className="space-y-1">
                                    {blank.options.map((option: string) => (
                                        <div className="flex items-center space-x-2" key={option}>
                                            <RadioGroupItem value={option} id={`${id}_${option}`} />
                                            <Label htmlFor={`${id}_${option}`}>{option}</Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}