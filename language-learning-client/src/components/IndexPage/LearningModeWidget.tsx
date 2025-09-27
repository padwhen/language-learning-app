import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, Clock, Gamepad2, X, ChevronUp, ChevronDown, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MiniGameEngine, GameResult } from './MiniGames/MiniGameEngine';
import { awardMiniGameXp, showXpToast } from '@/utils/miniGameXp';

interface LearningModeWidgetProps {
    isVisible: boolean;
    currentStep: number;
    totalSteps: number;
    onClose?: () => void;
}

const steps = [
    {
        title: "Translating sentence",
        description: "Converting your text to English...",
        funFact: "Did you know Finnish has 15 grammatical cases?"
    },
    {
        title: "Analyzing grammar patterns",
        description: "Identifying word forms and structures...",
        funFact: "Finnish words can have over 2,000 different forms!"
    },
    {
        title: "Validating and finalizing",
        description: "Ensuring accuracy and consistency...",
        funFact: "Finnish is related to Estonian and Hungarian!"
    }
];

export const LearningModeWidget: React.FC<LearningModeWidgetProps> = ({
    isVisible,
    currentStep,
    totalSteps,
    onClose
}) => {
    const [progress, setProgress] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMiniGames, setShowMiniGames] = useState(false);

    const handleGameComplete = async (result: GameResult) => {
        console.log('Game completed:', result);
        
        // Award XP via API
        const success = await awardMiniGameXp(result);
        
        if (success) {
            // Show success toast with XP earned
            showXpToast(result.xpEarned, result.gameType);
        } else {
            // Show error toast if XP award failed
            console.warn('Failed to award XP, but showing local notification');
            showXpToast(result.xpEarned, result.gameType);
        }
        
        setShowMiniGames(false);
    };

    // Animate progress bar
    useEffect(() => {
        if (isVisible) {
            const targetProgress = ((currentStep + 1) / totalSteps) * 100;
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= targetProgress) {
                        clearInterval(interval);
                        return targetProgress;
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [currentStep, totalSteps, isVisible]);

    // Reset state when widget becomes invisible, but preserve expanded state
    useEffect(() => {
        if (!isVisible) {
            setShowMiniGames(false);
            setProgress(0);
            // Don't reset isExpanded to preserve user preference
        }
    }, [isVisible]);

    // Handle page visibility change to prevent widget from disappearing
    useEffect(() => {
        const handleVisibilityChange = () => {
            // Don't hide widget when tab becomes hidden
            // Widget should persist across tab switches
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    if (!isVisible) return null;

    const currentStepData = steps[currentStep] || steps[0];

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            {/* Collapsed State */}
            {!isExpanded && (
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 transition-all duration-300 hover:shadow-3xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center">
                                <Loader2 className="w-3 h-3 text-violet-600 animate-spin" />
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                                Learning Mode
                            </span>
                        </div>
                        {onClose && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">
                                Step {currentStep + 1} of {totalSteps}
                            </span>
                            <span className="text-xs text-gray-500">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                                className="bg-gradient-to-r from-violet-500 to-purple-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Current Step Info */}
                    <p className="text-xs text-gray-600 mb-3">
                        {currentStepData.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowMiniGames(true)}
                            className="flex-1 text-xs h-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
                        >
                            <Gamepad2 className="w-3 h-3 mr-1" />
                            Play Games
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(true)}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                            <ChevronUp className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Expanded State */}
            {isExpanded && (
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 max-h-96 w-80">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                </div>
                                <h3 className="text-sm font-semibold">Learning Mode</h3>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsExpanded(false)}
                                    className="h-6 w-6 p-0 hover:bg-white/20 text-white"
                                >
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                                {onClose && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClose}
                                        className="h-6 w-6 p-0 hover:bg-white/20 text-white"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <p className="text-violet-100 text-xs">
                            Creating your annotated translation with grammar insights
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-64 overflow-y-auto">
                        {/* Progress Section */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-gray-700">
                                    Step {currentStep + 1} of {totalSteps}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-3 mb-4">
                            {steps.map((step, index) => (
                                <div 
                                    key={index}
                                    className={`flex items-start gap-2 p-2 rounded-lg transition-all duration-300 ${
                                        index === currentStep 
                                            ? 'bg-violet-50 border border-violet-200' 
                                            : index < currentStep 
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-gray-50 border border-gray-200'
                                    }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {index < currentStep ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : index === currentStep ? (
                                            <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-medium text-xs ${
                                            index === currentStep 
                                                ? 'text-violet-700' 
                                                : index < currentStep 
                                                    ? 'text-green-700'
                                                    : 'text-gray-500'
                                        }`}>
                                            {step.title}
                                        </h4>
                                        <p className={`text-xs mt-1 ${
                                            index === currentStep 
                                                ? 'text-violet-600' 
                                                : index < currentStep 
                                                    ? 'text-green-600'
                                                    : 'text-gray-400'
                                        }`}>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Fun Fact */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                            <div className="flex items-start gap-2">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs">💡</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-blue-800 text-xs mb-1">
                                        Fun Fact
                                    </h4>
                                    <p className="text-blue-700 text-xs leading-relaxed">
                                        {currentStepData.funFact}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mini Games CTA */}
                        <Button
                            onClick={() => setShowMiniGames(true)}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs h-8"
                        >
                            <Gamepad2 className="w-3 h-3 mr-2" />
                            Play Mini Games While You Wait
                        </Button>

                        {/* Estimated Time */}
                        <div className="mt-3 text-center">
                            <p className="text-xs text-gray-500">
                                Usually takes 2-3 minutes 🙏
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Mini Games Modal Overlay */}
            {showMiniGames && (
                <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Mini Games</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMiniGames(false)}
                                    className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-blue-100 text-sm mt-1">
                                Practice with your recently studied words
                            </p>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <MiniGameEngine
                                onGameComplete={handleGameComplete}
                                onClose={() => setShowMiniGames(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
