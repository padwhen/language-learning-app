import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { RecentlyStudiedCard } from '@/state/hooks/useRecentlyStudiedCards';

interface FlashRecallGameProps {
    cards: RecentlyStudiedCard[];
    onGameComplete: (score: number, totalQuestions: number) => void;
    onBack: () => void;
}

export const FlashRecallGame: React.FC<FlashRecallGameProps> = ({
    cards,
    onGameComplete,
    onBack
}) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [gameCards, setGameCards] = useState<RecentlyStudiedCard[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameStarted, setGameStarted] = useState(false);

    // Initialize game with shuffled cards
    useEffect(() => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, 10);
        setGameCards(shuffled);
    }, [cards]);

    // Timer
    useEffect(() => {
        if (gameStarted && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && gameStarted) {
            // When time runs out, count the current card if it was answered
            const finalScore = showAnswer ? score : score;
            const totalAttempted = showAnswer ? currentCardIndex + 1 : currentCardIndex;
            onGameComplete(finalScore, Math.max(totalAttempted, 1));
        }
    }, [timeLeft, gameStarted, score, currentCardIndex, showAnswer, onGameComplete]);

    const startGame = () => {
        setGameStarted(true);
    };

    const handleKnowIt = () => {
        setScore(score + 1);
        nextCard();
    };

    const handleDontKnow = () => {
        nextCard();
    };

    const nextCard = () => {
        const nextIndex = currentCardIndex + 1;
        if (nextIndex >= gameCards.length) {
            onGameComplete(score, gameCards.length);
        } else {
            setCurrentCardIndex(nextIndex);
            setShowAnswer(false);
        }
    };

    const currentCard = gameCards[currentCardIndex];

    if (!gameStarted) {
        return (
            <div className="p-6 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Flash Recall</h3>
                    <p className="text-gray-600">
                        You have 30 seconds to recall as many words as possible!
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-2">How to Play:</h4>
                    <ul className="text-sm text-yellow-700 text-left space-y-1">
                        <li>• You'll see a Finnish word</li>
                        <li>• Try to recall the English meaning</li>
                        <li>• Tap "Show Answer" to check</li>
                        <li>• Mark if you knew it or not</li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <Button onClick={onBack} variant="outline" className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button onClick={startGame} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                        Start Game
                    </Button>
                </div>
            </div>
        );
    }

    if (!currentCard) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button onClick={onBack} variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        {currentCardIndex + 1} / {gameCards.length}
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        timeLeft <= 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                        <Clock className="w-4 h-4" />
                        {timeLeft}s
                    </div>
                </div>
            </div>

            {/* Score */}
            <div className="text-center mb-6">
                <div className="text-2xl font-bold text-gray-800">
                    Score: {score} / {Math.max(currentCardIndex, 1)}
                </div>
            </div>

            {/* Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center mb-6 min-h-[200px] flex flex-col justify-center">
                <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">Finnish Word</div>
                    <div className="text-3xl font-bold text-gray-800 mb-4">
                        {currentCard.userLangCard}
                    </div>
                </div>

                {showAnswer ? (
                    <div className="border-t border-gray-200 pt-4">
                        <div className="text-sm text-gray-500 mb-2">English Translation</div>
                        <div className="text-2xl font-semibold text-blue-600">
                            {currentCard.engCard}
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={() => setShowAnswer(true)}
                        variant="outline"
                        className="mx-auto"
                    >
                        Show Answer
                    </Button>
                )}
            </div>

            {/* Action Buttons */}
            {showAnswer && (
                <div className="flex gap-3">
                    <Button
                        onClick={handleDontKnow}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Didn't Know
                    </Button>
                    <Button
                        onClick={handleKnowIt}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Knew It!
                    </Button>
                </div>
            )}
        </div>
    );
};
