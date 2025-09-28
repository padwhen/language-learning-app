import { BookOpen, Target, Zap, Brain, Info } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LearningStep } from "../types";
import { AlgorithmVisualizationDialog } from "./AlgorithmVisualizationDialog";

interface IntroStepProps {
    deckName: string;
    animationClass?: string;
    showIntroAgain: boolean;
    setShowIntroAgain: (value: boolean) => void
    nextStep: (step: LearningStep) => void
}

export const IntroStep: React.FC<IntroStepProps> = ({
    deckName,
    animationClass = '',
    showIntroAgain,
    setShowIntroAgain,
    nextStep
}) => {
    const [showAlgorithmDialog, setShowAlgorithmDialog] = useState(false);

    return (
        <div className={`max-w-4xl mx-auto p-2 sm:p-4 lg:p-8 space-y-6 sm:space-y-8 lg:space-y-10 ${animationClass}`}>
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
                    Let's make learning fun and effective!
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-4 sm:gap-y-6 sm:gap-x-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-black mb-1 sm:mb-2">
                        Personalized Learning
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Customize your session based on your progress and goals
                    </p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-black mb-1 sm:mb-2">
                        Smart Progress
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Auto-save every 5 minutes so you never lose progress
                    </p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                        <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-black mb-1 sm:mb-2">
                        Spaced Repetition
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Smart scheduling that adapts to your memory
                    </p>
                </div>
            </div>
            {/* Checkbox section */}
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
            {/* Algorithm Explanation Section */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-200">
                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">How Spaced Repetition Works</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Each time you answer correctly, we'll wait a little longer before showing the word again. 
                        If you forget, we'll bring it back sooner. This way, you'll remember with fewer reviews over time.
                    </p>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 bg-white hover:bg-gray-50 border-purple-300 text-purple-700"
                        onClick={() => setShowAlgorithmDialog(true)}
                    >
                        <Info className="w-4 h-4 mr-2" />
                        Show me how
                    </Button>
                </div>
            </div>

            <div className="flex justify-center pt-2">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => nextStep('settings')}>
                    Continue
                </Button>
            </div>

            {/* Algorithm Visualization Dialog */}
            <AlgorithmVisualizationDialog 
                isOpen={showAlgorithmDialog}
                onClose={() => setShowAlgorithmDialog(false)}
            />
        </div>
    );
}