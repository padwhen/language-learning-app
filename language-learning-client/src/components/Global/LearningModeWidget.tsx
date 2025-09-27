import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, Clock, Gamepad2, X, ChevronUp, ChevronDown, Trophy, PartyPopper } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MiniGameEngine, GameResult } from '../IndexPage/MiniGames/MiniGameEngine';
import { awardMiniGameXp, showXpToast } from '@/utils/miniGameXp';

interface LearningModeWidgetProps {
    isVisible: boolean;
    currentStep: number;
    totalSteps: number;
    onClose?: () => void;
    onComplete?: () => void;
    isCompleted?: boolean;
    completedSentence?: string;
    estimatedTimeRemaining?: number;
}

// Utility function to format ETA
const formatETA = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

// Utility function to truncate sentence for notification
const truncateSentence = (sentence: string, maxLength: number = 30): string => {
    if (sentence.length <= maxLength) return sentence;
    return sentence.substring(0, maxLength).trim() + '...';
};

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
    onClose,
    onComplete,
    isCompleted = false,
    completedSentence = '',
    estimatedTimeRemaining = 0
}) => {
    const [progress, setProgress] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMiniGames, setShowMiniGames] = useState(false);
    const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
    const [estimatedCompletion, setEstimatedCompletion] = useState<number>(0);
    const [showCompletionNotification, setShowCompletionNotification] = useState(false);

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

    // Animate progress bar with completion handling
    useEffect(() => {
        if (isVisible) {
            let targetProgress;
            if (isCompleted) {
                targetProgress = 100;
            } else {
                // Cap at 99% for the final step to avoid showing 100% before completion
                const rawProgress = ((currentStep + 1) / totalSteps) * 100;
                targetProgress = currentStep === totalSteps - 1 ? Math.min(rawProgress, 99) : rawProgress;
            }
            
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
    }, [currentStep, totalSteps, isVisible, isCompleted]);

    // Track step timing for ETA calculation
    useEffect(() => {
        if (currentStep === 0) {
            setStepStartTime(Date.now());
        } else if (currentStep === 1) {
            const stepDuration = Date.now() - stepStartTime;
            // Estimate remaining time based on first step duration
            const estimatedTotal = stepDuration * totalSteps;
            const remaining = estimatedTotal - stepDuration;
            setEstimatedCompletion(remaining);
        }
    }, [currentStep, stepStartTime, totalSteps]);

    // Handle completion state
    useEffect(() => {
        if (isCompleted && !showCompletionNotification) {
            setShowCompletionNotification(true);
            // Auto-hide notification after 10 seconds
            const timer = setTimeout(() => {
                setShowCompletionNotification(false);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [isCompleted, showCompletionNotification]);

    // Handle completion notification click
    const handleCompletionClick = () => {
        setShowCompletionNotification(false);
        if (onComplete) {
            onComplete();
        }
    };

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

    // Show completion notification if completed
    if (showCompletionNotification && isCompleted) {
        return (
            <div className="fixed bottom-4 right-4 z-50 max-w-sm">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl border border-green-300 p-4 text-white animate-pulse">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <PartyPopper className="w-3 h-3" />
                            </div>
                            <span className="text-sm font-semibold">
                                Translation Complete!
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCompletionNotification(false)}
                            className="h-6 w-6 p-0 hover:bg-white/20 text-white"
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>

                    <p className="text-green-100 text-sm mb-4 leading-relaxed">
                        Your translation for "{truncateSentence(completedSentence)}" is completed!
                    </p>

                    <Button
                        onClick={handleCompletionClick}
                        className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 text-sm h-9 font-medium"
                    >
                        <Trophy className="w-4 h-4 mr-2" />
                        Check it out
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            {/* Collapsed State */}
            {!isExpanded && (
                <div className={`rounded-2xl shadow-2xl border p-4 transition-all duration-300 hover:shadow-3xl ${
                    isCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-300 text-white' 
                        : 'bg-white border-gray-200'
                }`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isCompleted 
                                    ? 'bg-white/20' 
                                    : 'bg-violet-100'
                            }`}>
                                {isCompleted ? (
                                    <CheckCircle className="w-3 h-3 text-white" />
                                ) : (
                                    <Loader2 className="w-3 h-3 text-violet-600 animate-spin" />
                                )}
                            </div>
                            <span className={`text-sm font-medium ${
                                isCompleted ? 'text-white' : 'text-gray-800'
                            }`}>
                                {isCompleted ? 'Complete!' : 'Learning Mode'}
                            </span>
                        </div>
                        {onClose && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className={`h-6 w-6 p-0 ${
                                    isCompleted 
                                        ? 'hover:bg-white/20 text-white' 
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs ${
                                isCompleted ? 'text-green-100' : 'text-gray-600'
                            }`}>
                                {isCompleted ? 'Translation Ready' : `Step ${currentStep + 1} of ${totalSteps}`}
                            </span>
                            <span className={`text-xs ${
                                isCompleted ? 'text-green-100' : 'text-gray-500'
                            }`}>
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className={`w-full rounded-full h-1.5 ${
                            isCompleted ? 'bg-white/20' : 'bg-gray-200'
                        }`}>
                            <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                                    isCompleted 
                                        ? 'bg-white' 
                                        : 'bg-gradient-to-r from-violet-500 to-purple-600'
                                }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Current Step Info or Completion Message */}
                    <p className={`text-xs mb-3 ${
                        isCompleted ? 'text-green-100' : 'text-gray-600'
                    }`}>
                        {isCompleted 
                            ? `Your translation for "${truncateSentence(completedSentence)}" is ready!`
                            : currentStepData.description
                        }
                    </p>

                    {/* ETA Display */}
                    {!isCompleted && estimatedCompletion > 0 && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-blue-500" />
                                <span className="text-xs text-blue-700">
                                    ETA: {formatETA(estimatedCompletion)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {isCompleted ? (
                            <Button
                                onClick={handleCompletionClick}
                                className="flex-1 text-xs h-8 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                            >
                                <Trophy className="w-3 h-3 mr-1" />
                                View Translation
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowMiniGames(true)}
                                className="flex-1 text-xs h-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
                            >
                                <Gamepad2 className="w-3 h-3 mr-1" />
                                Play Games
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(true)}
                            className={`h-8 w-8 p-0 ${
                                isCompleted 
                                    ? 'hover:bg-white/20 text-white' 
                                    : 'hover:bg-gray-100'
                            }`}
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
                    <div className={`p-4 text-white ${
                        isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-r from-violet-500 to-purple-600'
                    }`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    {isCompleted ? (
                                        <CheckCircle className="w-3 h-3" />
                                    ) : (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    )}
                                </div>
                                <h3 className="text-sm font-semibold">
                                    {isCompleted ? 'Translation Complete!' : 'Learning Mode'}
                                </h3>
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
                        <p className={`text-xs ${
                            isCompleted ? 'text-green-100' : 'text-violet-100'
                        }`}>
                            {isCompleted 
                                ? `Your annotated translation is ready to explore!`
                                : 'Creating your annotated translation with grammar insights'
                            }
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-64 overflow-y-auto">
                        {/* Progress Section */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-gray-700">
                                    {isCompleted ? 'Translation Ready' : `Step ${currentStep + 1} of ${totalSteps}`}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ease-out ${
                                        isCompleted 
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                            : 'bg-gradient-to-r from-violet-500 to-purple-600'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* ETA Section */}
                        {!isCompleted && estimatedCompletion > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-medium text-blue-800">
                                        Estimated Time Remaining
                                    </span>
                                </div>
                                <p className="text-sm text-blue-700 font-semibold">
                                    {formatETA(estimatedCompletion)}
                                </p>
                            </div>
                        )}

                        {/* Completion Message */}
                        {isCompleted && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-medium text-green-800">
                                        Ready to Explore!
                                    </span>
                                </div>
                                <p className="text-sm text-green-700 leading-relaxed">
                                    Your translation for "{truncateSentence(completedSentence, 40)}" is complete with grammar insights and annotations.
                                </p>
                            </div>
                        )}

                        {/* Steps */}
                        <div className="space-y-3 mb-4">
                            {steps.map((step, index) => (
                                <div 
                                    key={index}
                                    className={`flex items-start gap-2 p-2 rounded-lg transition-all duration-300 ${
                                        isCompleted || index < currentStep
                                            ? 'bg-green-50 border border-green-200'
                                            : index === currentStep 
                                                ? 'bg-violet-50 border border-violet-200' 
                                                : 'bg-gray-50 border border-gray-200'
                                    }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {isCompleted || index < currentStep ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : index === currentStep ? (
                                            <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-medium text-xs ${
                                            isCompleted || index < currentStep
                                                ? 'text-green-700'
                                                : index === currentStep 
                                                    ? 'text-violet-700' 
                                                    : 'text-gray-500'
                                        }`}>
                                            {step.title}
                                        </h4>
                                        <p className={`text-xs mt-1 ${
                                            isCompleted || index < currentStep
                                                ? 'text-green-600'
                                                : index === currentStep 
                                                    ? 'text-violet-600' 
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

                        {/* Action Buttons */}
                        {isCompleted ? (
                            <Button
                                onClick={handleCompletionClick}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm h-10 font-medium"
                            >
                                <Trophy className="w-4 h-4 mr-2" />
                                View Your Translation
                            </Button>
                        ) : (
                            <>
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
                                        {estimatedCompletion > 0 
                                            ? `ETA: ${formatETA(estimatedCompletion)}`
                                            : 'Usually takes 2-3 minutes 🙏'
                                        }
                                    </p>
                                </div>
                            </>
                        )}
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
