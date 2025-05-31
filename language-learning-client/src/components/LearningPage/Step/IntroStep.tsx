import { BookOpen, Target, TrendingUp, Zap } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

interface IntroStepProps {
    deckName: string;
    onContinue: () => void;
    animationClass: string;
    showIntroAgain: boolean;
    setShowIntroAgain: (value: boolean) => void;
}

export const IntroStep: React.FC<IntroStepProps> = ({
    deckName,
    onContinue,
    animationClass,
    showIntroAgain,
    setShowIntroAgain,
}) => {
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
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-black mb-1 sm:mb-2">
                        Adaptive Learning
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Focus on cards that need the most attention
                    </p>
                </div>
            </div>
            {/* Checkbox section */}
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl">
                <input
                    type="checkbox"
                    id="showIntroAgain"
                    checked={!showIntroAgain}
                    onChange={(e) => setShowIntroAgain(!e)}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-0 rounded border-gray-300 text-black focus:ring-black focus:ring-2 flex-shrink-0"
                />
                <label htmlFor="showIntroAgain" className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
                    Don't show this intro again for this account
                </label>
            </div>
            <div className="flex justify-center pt-2">
                <Button size="lg" className="w-full sm:w-auto" onClick={onContinue}>
                    Continue
                </Button>
            </div>
        </div>
    );
}