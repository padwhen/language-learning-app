import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Zap } from 'lucide-react';
import { RecentlyStudiedCard } from '@/state/hooks/useRecentlyStudiedCards';

interface SpeedTapGameProps {
    cards: RecentlyStudiedCard[];
    onGameComplete: (score: number, totalQuestions: number) => void;
    onBack: () => void;
}

interface Question {
    id: string;
    targetWord: string;
    options: string[];
    correctAnswer: string;
    answered: boolean;
}

export const SpeedTapGame: React.FC<SpeedTapGameProps> = ({
    cards,
    onGameComplete,
    onBack
}) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(45);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);

    // Initialize game with questions
    useEffect(() => {
        const gameCards = [...cards].sort(() => Math.random() - 0.5);
        const gameQuestions: Question[] = gameCards.map(card => {
            // Create wrong options from other cards
            const wrongOptions = cards
                .filter(c => c._id !== card._id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(c => c.engCard);

            const allOptions = [card.engCard, ...wrongOptions].sort(() => Math.random() - 0.5);

            return {
                id: card._id,
                targetWord: card.userLangCard,
                options: allOptions,
                correctAnswer: card.engCard,
                answered: false
            };
        });

        setQuestions(gameQuestions);
    }, [cards]);

    // Timer
    useEffect(() => {
        if (gameStarted && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            onGameComplete(score, currentQuestionIndex);
        }
    }, [timeLeft, gameStarted, score, currentQuestionIndex, onGameComplete]);

    const startGame = () => {
        setGameStarted(true);
    };

    const handleAnswer = (selectedAnswer: string) => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        if (isCorrect) {
            setScore(score + 1);
            setStreak(streak + 1);
            setMaxStreak(Math.max(maxStreak, streak + 1));
        } else {
            setStreak(0);
        }

        // Move to next question or end game
        if (currentQuestionIndex + 1 >= questions.length) {
            onGameComplete(isCorrect ? score + 1 : score, questions.length);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

    if (!gameStarted) {
        return (
            <div className="p-6 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Speed Tap</h3>
                    <p className="text-gray-600">
                        Fast-paced word recognition! How many can you get in 45 seconds?
                    </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-red-800 mb-2">How to Play:</h4>
                    <ul className="text-sm text-red-700 text-left space-y-1">
                        <li>• You have 45 seconds to answer as many as possible</li>
                        <li>• See a Finnish word, tap the correct English translation</li>
                        <li>• Build streaks for bonus points</li>
                        <li>• Speed matters - think fast!</li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <Button onClick={onBack} variant="outline" className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button onClick={startGame} className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
                        Start Game
                    </Button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
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
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">
                            Score: {score}
                        </div>
                        <div className="text-xs text-gray-600">
                            Question {currentQuestionIndex + 1}
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        timeLeft <= 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                        <Clock className="w-4 h-4" />
                        {timeLeft}s
                    </div>
                </div>
            </div>

            {/* Streak Display */}
            {streak > 0 && (
                <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        <Zap className="w-4 h-4" />
                        {streak} streak!
                    </div>
                </div>
            )}

            {/* Question */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center mb-6">
                <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">Finnish Word</div>
                    <div className="text-4xl font-bold text-gray-800">
                        {currentQuestion.targetWord}
                    </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                    Tap the correct English translation:
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(option)}
                            className="p-4 bg-gray-100 hover:bg-blue-100 active:bg-blue-200 rounded-lg text-lg font-medium text-gray-800 transition-all duration-150 hover:scale-105 active:scale-95"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                    Max Streak: {maxStreak}
                </div>
                <div>
                    Accuracy: {currentQuestionIndex > 0 ? Math.round((score / currentQuestionIndex) * 100) : 0}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                    className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((45 - timeLeft) / 45) * 100}%` }}
                />
            </div>
        </div>
    );
};
