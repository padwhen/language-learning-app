import { BookOpen, Settings, MessageSquare, CalendarClock, Check, X } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LearningStep } from "../types";

interface IntroStepProps {
    deckName: string;
    animationClass?: string;
    showIntroAgain: boolean;
    setShowIntroAgain: (value: boolean) => void
    nextStep: (step: LearningStep) => void
}

const steps = [
    {
        icon: Settings,
        title: "Choose your cards",
        description: "Pick how many cards and which type — new, in progress, or due for review."
    },
    {
        icon: MessageSquare,
        title: "Answer questions",
        description: "Multiple choice for new words, type your answer as you improve. Wrong answers lower your score, right answers raise it."
    },
    {
        icon: CalendarClock,
        title: "Come back & review",
        description: "Cards you get right appear less often. Cards you get wrong come back sooner. That's spaced repetition."
    }
];

const scoreSteps = [0, 1, 2, 3, 4, 5];

export const IntroStep: React.FC<IntroStepProps> = ({
    deckName,
    animationClass = '',
    showIntroAgain,
    setShowIntroAgain,
    nextStep
}) => {
    return (
        <div className={`max-w-4xl mx-auto p-2 sm:p-4 lg:p-8 space-y-6 sm:space-y-8 lg:space-y-10 ${animationClass}`}>
            {/* Header */}
            <div className="text-center space-y-3 sm:space-y-4">
                <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-300 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-500 tracking-tight px-2 sm:px-4">
                    Ready to learn {deckName}?
                </h1>
                <p className="text-base sm:text-lg text-gray-600 font-medium px-2 sm:px-4">
                    Here's how it works
                </p>
            </div>

            {/* How it works — 3 steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {steps.map((step, index) => (
                    <div key={index} className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                            </div>
                            <step.icon className="w-5 h-5 text-gray-500" />
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-black mb-1 sm:mb-2">
                            {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Inline SRS score visual */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                <p className="text-sm font-semibold text-gray-700 mb-4 text-center">Each card has a score from 0 to 5</p>
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                    {scoreSteps.map((score) => (
                        <div key={score} className="flex flex-col items-center gap-1">
                            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold ${
                                score === 0 ? 'bg-gray-200 text-gray-500' :
                                score <= 2 ? 'bg-orange-100 text-orange-600' :
                                score <= 4 ? 'bg-blue-100 text-blue-600' :
                                'bg-green-100 text-green-700'
                            }`}>
                                {score}
                            </div>
                            {score === 0 && <span className="text-[10px] sm:text-xs text-gray-400">New</span>}
                            {score === 5 && <span className="text-[10px] sm:text-xs text-green-600 font-medium">Done</span>}
                            {score > 0 && score < 5 && <span className="text-[10px] sm:text-xs text-transparent">-</span>}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-500" /> Right = score goes up
                    </span>
                    <span className="flex items-center gap-1">
                        <X className="w-3.5 h-3.5 text-red-400" /> Wrong = score goes down
                    </span>
                </div>
            </div>

            {/* Don't show again */}
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl">
                <Checkbox
                    id="showIntroAgain"
                    checked={showIntroAgain}
                    onCheckedChange={(checked) => setShowIntroAgain(checked as boolean)}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-0 rounded border-gray-300 text-black focus:ring-black focus:ring-2 flex-shrink-0"
                />
                <label htmlFor="showIntroAgain" className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
                    Don't show this intro again for this account
                </label>
            </div>

            <div className="flex justify-center pt-2">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => nextStep('settings')}>
                    Continue
                </Button>
            </div>
        </div>
    );
}
