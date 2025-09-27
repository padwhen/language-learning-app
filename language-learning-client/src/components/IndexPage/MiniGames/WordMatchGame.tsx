import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, CheckCircle } from 'lucide-react';
import { RecentlyStudiedCard } from '@/state/hooks/useRecentlyStudiedCards';

interface WordMatchGameProps {
    cards: RecentlyStudiedCard[];
    onGameComplete: (score: number, totalQuestions: number) => void;
    onBack: () => void;
}

interface MatchPair {
    id: string;
    finnish: string;
    english: string;
    matched: boolean;
}

export const WordMatchGame: React.FC<WordMatchGameProps> = ({
    cards,
    onGameComplete,
    onBack
}) => {
    const [matchPairs, setMatchPairs] = useState<MatchPair[]>([]);
    const [selectedFinnish, setSelectedFinnish] = useState<string | null>(null);
    const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [attempts, setAttempts] = useState(0);

    // Initialize game with shuffled pairs
    useEffect(() => {
        const gameCards = [...cards].sort(() => Math.random() - 0.5).slice(0, 6);
        const pairs: MatchPair[] = gameCards.map(card => ({
            id: card._id,
            finnish: card.userLangCard,
            english: card.engCard,
            matched: false
        }));
        setMatchPairs(pairs);
    }, [cards]);

    const startGame = () => {
        setGameStarted(true);
    };

    const handleFinnishSelect = (finnish: string) => {
        if (selectedFinnish === finnish) {
            setSelectedFinnish(null);
        } else {
            setSelectedFinnish(finnish);
            if (selectedEnglish) {
                checkMatch(finnish, selectedEnglish);
            }
        }
    };

    const handleEnglishSelect = (english: string) => {
        if (selectedEnglish === english) {
            setSelectedEnglish(null);
        } else {
            setSelectedEnglish(english);
            if (selectedFinnish) {
                checkMatch(selectedFinnish, english);
            }
        }
    };

    const checkMatch = (finnish: string, english: string) => {
        setAttempts(attempts + 1);
        
        const pair = matchPairs.find(p => p.finnish === finnish && p.english === english);
        
        if (pair) {
            // Correct match
            setScore(score + 1);
            setMatchPairs(prev => prev.map(p => 
                p.id === pair.id ? { ...p, matched: true } : p
            ));
            
            // Check if game is complete
            const updatedPairs = matchPairs.map(p => 
                p.id === pair.id ? { ...p, matched: true } : p
            );
            
            if (updatedPairs.every(p => p.matched)) {
                setTimeout(() => {
                    onGameComplete(score + 1, matchPairs.length);
                }, 500);
            }
        }
        
        // Reset selections
        setSelectedFinnish(null);
        setSelectedEnglish(null);
    };

    const shuffledFinnish = [...matchPairs].sort(() => Math.random() - 0.5);
    const shuffledEnglish = [...matchPairs].sort(() => Math.random() - 0.5);

    if (!gameStarted) {
        return (
            <div className="p-6 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Word Match</h3>
                    <p className="text-gray-600">
                        Match Finnish words with their English translations!
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">How to Play:</h4>
                    <ul className="text-sm text-blue-700 text-left space-y-1">
                        <li>• Select a Finnish word from the left column</li>
                        <li>• Select its English translation from the right</li>
                        <li>• Correct matches will disappear</li>
                        <li>• Match all pairs to complete the game</li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <Button onClick={onBack} variant="outline" className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button onClick={startGame} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                        Start Game
                    </Button>
                </div>
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
                        {score} / {matchPairs.length} Matched
                    </div>
                    <div className="text-sm text-gray-600">
                        {attempts} attempts
                    </div>
                </div>
            </div>

            {/* Game Board */}
            <div className="grid grid-cols-2 gap-4">
                {/* Finnish Words */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 text-center mb-3">
                        Finnish
                    </h4>
                    {shuffledFinnish.map((pair) => (
                        <button
                            key={`fi-${pair.id}`}
                            onClick={() => handleFinnishSelect(pair.finnish)}
                            disabled={pair.matched}
                            className={`w-full p-3 rounded-lg text-sm font-medium transition-all ${
                                pair.matched
                                    ? 'bg-green-100 text-green-700 opacity-50 cursor-not-allowed'
                                    : selectedFinnish === pair.finnish
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95'
                            }`}
                        >
                            {pair.matched && <CheckCircle className="w-4 h-4 inline mr-2" />}
                            {pair.finnish}
                        </button>
                    ))}
                </div>

                {/* English Words */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 text-center mb-3">
                        English
                    </h4>
                    {shuffledEnglish.map((pair) => (
                        <button
                            key={`en-${pair.id}`}
                            onClick={() => handleEnglishSelect(pair.english)}
                            disabled={pair.matched}
                            className={`w-full p-3 rounded-lg text-sm font-medium transition-all ${
                                pair.matched
                                    ? 'bg-green-100 text-green-700 opacity-50 cursor-not-allowed'
                                    : selectedEnglish === pair.english
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95'
                            }`}
                        >
                            {pair.matched && <CheckCircle className="w-4 h-4 inline mr-2" />}
                            {pair.english}
                        </button>
                    ))}
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    {selectedFinnish || selectedEnglish 
                        ? 'Select the matching word from the other column'
                        : 'Select a word from either column to start matching'
                    }
                </p>
            </div>
        </div>
    );
};
