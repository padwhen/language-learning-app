import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shuffle, Check, X } from 'lucide-react';
import { RecentlyStudiedCard } from '@/state/hooks/useRecentlyStudiedCards';

interface TrueFalseGameProps {
    cards: RecentlyStudiedCard[];
    onGameComplete: (score: number, totalQuestions: number) => void;
    onBack: () => void;
}

interface Question {
    id: string;
    finnish: string;
    english: string;
    isCorrect: boolean;
    userAnswer: boolean | null;
    answered: boolean;
}

export const TrueFalseGame: React.FC<TrueFalseGameProps> = ({
    cards,
    onGameComplete,
    onBack
}) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [showResult, setShowResult] = useState(false);

    // Initialize game with questions
    useEffect(() => {
        const gameCards = [...cards].sort(() => Math.random() - 0.5).slice(0, 10);
        const gameQuestions: Question[] = [];

        gameCards.forEach(card => {
            // Add correct pair
            gameQuestions.push({
                id: `${card._id}-correct`,
                finnish: card.userLangCard,
                english: card.engCard,
                isCorrect: true,
                userAnswer: null,
                answered: false
            });

            // Add incorrect pair (random wrong translation)
            const wrongCards = cards.filter(c => c._id !== card._id);
            if (wrongCards.length > 0) {
                const wrongCard = wrongCards[Math.floor(Math.random() * wrongCards.length)];
                gameQuestions.push({
                    id: `${card._id}-incorrect`,
                    finnish: card.userLangCard,
                    english: wrongCard.engCard,
                    isCorrect: false,
                    userAnswer: null,
                    answered: false
                });
            }
        });

        // Shuffle questions
        setQuestions(gameQuestions.sort(() => Math.random() - 0.5).slice(0, 12));
    }, [cards]);

    const startGame = () => {
        setGameStarted(true);
    };

    const handleAnswer = (answer: boolean) => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = answer === currentQuestion.isCorrect;

        setQuestions(prev => prev.map((q, index) => 
            index === currentQuestionIndex 
                ? { ...q, userAnswer: answer, answered: true }
                : q
        ));

        if (isCorrect) {
            setScore(score + 1);
        }

        setShowResult(true);

        setTimeout(() => {
            if (currentQuestionIndex + 1 >= questions.length) {
                onGameComplete(isCorrect ? score + 1 : score, questions.length);
            } else {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setShowResult(false);
            }
        }, 1500);
    };

    const currentQuestion = questions[currentQuestionIndex];

    if (!gameStarted) {
        return (
            <div className="p-6 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shuffle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">True/False</h3>
                    <p className="text-gray-600">
                        Decide if the Finnish-English pairs are correct!
                    </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-purple-800 mb-2">How to Play:</h4>
                    <ul className="text-sm text-purple-700 text-left space-y-1">
                        <li>• You'll see a Finnish word and an English translation</li>
                        <li>• Decide if the translation is correct or incorrect</li>
                        <li>• Tap "True" if correct, "False" if incorrect</li>
                        <li>• Answer all questions to complete the game</li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <Button onClick={onBack} variant="outline" className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button onClick={startGame} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
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
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                        {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    <div className="text-sm text-gray-600">
                        Score: {score}
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center mb-6 min-h-[300px] flex flex-col justify-center">
                <div className="mb-8">
                    <div className="text-sm text-gray-500 mb-2">Is this translation correct?</div>
                </div>

                <div className="mb-8">
                    <div className="text-3xl font-bold text-gray-800 mb-4">
                        {currentQuestion.finnish}
                    </div>
                    <div className="text-xl text-gray-600 mb-2">means</div>
                    <div className="text-3xl font-bold text-blue-600">
                        {currentQuestion.english}
                    </div>
                </div>

                {showResult ? (
                    <div className={`p-4 rounded-lg ${
                        (currentQuestion.userAnswer === currentQuestion.isCorrect)
                            ? 'bg-green-100 border border-green-200' 
                            : 'bg-red-100 border border-red-200'
                    }`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            {(currentQuestion.userAnswer === currentQuestion.isCorrect) ? (
                                <Check className="w-6 h-6 text-green-600" />
                            ) : (
                                <X className="w-6 h-6 text-red-600" />
                            )}
                            <span className={`font-semibold ${
                                (currentQuestion.userAnswer === currentQuestion.isCorrect) ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {(currentQuestion.userAnswer === currentQuestion.isCorrect) ? 'Correct!' : 'Incorrect'}
                            </span>
                        </div>
                        <div className={`text-sm ${
                            (currentQuestion.userAnswer === currentQuestion.isCorrect) ? 'text-green-700' : 'text-red-700'
                        }`}>
                            The answer was: <strong>{currentQuestion.isCorrect ? 'True' : 'False'}</strong>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4 justify-center">
                        <Button
                            onClick={() => handleAnswer(true)}
                            className="flex-1 max-w-32 h-16 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold"
                        >
                            <Check className="w-6 h-6 mr-2" />
                            True
                        </Button>
                        <Button
                            onClick={() => handleAnswer(false)}
                            className="flex-1 max-w-32 h-16 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold"
                        >
                            <X className="w-6 h-6 mr-2" />
                            False
                        </Button>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
            </div>
        </div>
    );
};
