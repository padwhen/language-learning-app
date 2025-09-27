import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Check, X } from 'lucide-react';
import { RecentlyStudiedCard } from '@/state/hooks/useRecentlyStudiedCards';

interface CaseFillGameProps {
    cards: RecentlyStudiedCard[];
    onGameComplete: (score: number, totalQuestions: number) => void;
    onBack: () => void;
}

interface Question {
    id: string;
    word: string;
    hiddenWord: string;
    answer: string;
    userAnswer: string;
    isCorrect: boolean | null;
}

export const CaseFillGame: React.FC<CaseFillGameProps> = ({
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
        const gameCards = [...cards].sort(() => Math.random() - 0.5).slice(0, 8);
        const gameQuestions: Question[] = gameCards.map(card => {
            const word = card.userLangCard;
            const hiddenWord = hideRandomLetters(word);
            return {
                id: card._id,
                word: card.engCard,
                hiddenWord,
                answer: word,
                userAnswer: '',
                isCorrect: null
            };
        });
        setQuestions(gameQuestions);
    }, [cards]);

    const hideRandomLetters = (word: string): string => {
        if (word.length <= 3) return word;
        
        const numToHide = Math.min(Math.ceil(word.length * 0.4), word.length - 2);
        const indices = [];
        
        // Don't hide first and last letters
        for (let i = 1; i < word.length - 1; i++) {
            indices.push(i);
        }
        
        const shuffled = indices.sort(() => Math.random() - 0.5);
        const toHide = shuffled.slice(0, numToHide);
        
        return word.split('').map((char, index) => 
            toHide.includes(index) ? '_' : char
        ).join('');
    };

    const startGame = () => {
        setGameStarted(true);
    };

    const handleAnswerChange = (value: string) => {
        setQuestions(prev => prev.map((q, index) => 
            index === currentQuestionIndex 
                ? { ...q, userAnswer: value }
                : q
        ));
    };

    const submitAnswer = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = currentQuestion.userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase();
        
        setQuestions(prev => prev.map((q, index) => 
            index === currentQuestionIndex 
                ? { ...q, isCorrect }
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
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Case Fill</h3>
                    <p className="text-gray-600">
                        Fill in the missing letters to complete the Finnish words!
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-green-800 mb-2">How to Play:</h4>
                    <ul className="text-sm text-green-700 text-left space-y-1">
                        <li>• You'll see an English word and a Finnish word with missing letters</li>
                        <li>• Type the complete Finnish word</li>
                        <li>• Use the underscores as hints for missing letters</li>
                        <li>• Complete all words to finish the game</li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <Button onClick={onBack} variant="outline" className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button onClick={startGame} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
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
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center mb-6">
                <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">English Word</div>
                    <div className="text-2xl font-bold text-gray-800 mb-6">
                        {currentQuestion.word}
                    </div>
                </div>

                <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">Complete the Finnish Word</div>
                    <div className="text-3xl font-mono text-gray-600 mb-4 tracking-wider">
                        {currentQuestion.hiddenWord}
                    </div>
                </div>

                {showResult ? (
                    <div className={`p-4 rounded-lg ${
                        currentQuestion.isCorrect 
                            ? 'bg-green-100 border border-green-200' 
                            : 'bg-red-100 border border-red-200'
                    }`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            {currentQuestion.isCorrect ? (
                                <Check className="w-6 h-6 text-green-600" />
                            ) : (
                                <X className="w-6 h-6 text-red-600" />
                            )}
                            <span className={`font-semibold ${
                                currentQuestion.isCorrect ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {currentQuestion.isCorrect ? 'Correct!' : 'Incorrect'}
                            </span>
                        </div>
                        <div className={`text-sm ${
                            currentQuestion.isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                            Correct answer: <strong>{currentQuestion.answer}</strong>
                        </div>
                    </div>
                ) : (
                    <div>
                        <input
                            type="text"
                            value={currentQuestion.userAnswer}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            placeholder="Type the complete word..."
                            className="w-full p-3 text-lg text-center border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none mb-4"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && currentQuestion.userAnswer.trim()) {
                                    submitAnswer();
                                }
                            }}
                        />
                        <Button
                            onClick={submitAnswer}
                            disabled={!currentQuestion.userAnswer.trim()}
                            className="bg-green-500 hover:bg-green-600 text-white px-8"
                        >
                            Submit Answer
                        </Button>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
            </div>
        </div>
    );
};
