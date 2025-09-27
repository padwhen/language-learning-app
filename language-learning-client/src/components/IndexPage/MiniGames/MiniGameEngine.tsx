import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, Star, Clock, Zap, Target, Brain, Shuffle } from 'lucide-react';
import useRecentlyStudiedCards, { RecentlyStudiedCard } from '@/state/hooks/useRecentlyStudiedCards';
import { FlashRecallGame } from './FlashRecallGame';
import { WordMatchGame } from './WordMatchGame';
import { CaseFillGame } from './CaseFillGame';
import { TrueFalseGame } from './TrueFalseGame';
import { SpeedTapGame } from './SpeedTapGame';

export interface GameResult {
    gameType: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    xpEarned: number;
}

interface MiniGameEngineProps {
    onGameComplete: (result: GameResult) => void;
    onClose: () => void;
}

const gameTypes = [
    {
        id: 'flash-recall',
        name: 'Flash Recall',
        description: 'Quick memory test with your vocabulary',
        icon: Zap,
        color: 'from-yellow-500 to-orange-500',
        difficulty: 'Easy'
    },
    {
        id: 'word-match',
        name: 'Word Match',
        description: 'Match Finnish words with English translations',
        icon: Target,
        color: 'from-blue-500 to-indigo-500',
        difficulty: 'Medium'
    },
    {
        id: 'case-fill',
        name: 'Case Fill',
        description: 'Fill in the missing letters',
        icon: Brain,
        color: 'from-green-500 to-emerald-500',
        difficulty: 'Medium'
    },
    {
        id: 'true-false',
        name: 'True/False',
        description: 'Quick true or false questions',
        icon: Shuffle,
        color: 'from-purple-500 to-pink-500',
        difficulty: 'Easy'
    },
    {
        id: 'speed-tap',
        name: 'Speed Tap',
        description: 'Fast-paced word recognition',
        icon: Clock,
        color: 'from-red-500 to-rose-500',
        difficulty: 'Hard'
    }
];

export const MiniGameEngine: React.FC<MiniGameEngineProps> = ({
    onGameComplete,
    onClose
}) => {
    const { cards, loading, error } = useRecentlyStudiedCards();
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [gameStartTime, setGameStartTime] = useState<number>(0);

    const handleGameSelect = (gameId: string) => {
        setSelectedGame(gameId);
        setGameStartTime(Date.now());
    };

    const handleGameFinish = (score: number, totalQuestions: number) => {
        const timeSpent = Math.round((Date.now() - gameStartTime) / 1000);
        const xpEarned = calculateXP(score, totalQuestions, selectedGame!);
        
        const result: GameResult = {
            gameType: selectedGame!,
            score,
            totalQuestions,
            timeSpent,
            xpEarned
        };

        onGameComplete(result);
    };

    const calculateXP = (score: number, total: number, gameType: string): number => {
        // Base XP: 1-3 points based on game difficulty
        const baseXP = gameType === 'speed-tap' ? 3 : gameType === 'case-fill' || gameType === 'word-match' ? 2 : 1;
        
        // Accuracy bonus: 0-2 points based on performance
        const accuracy = score / total;
        const accuracyBonus = accuracy >= 0.9 ? 2 : accuracy >= 0.7 ? 1 : 0;
        
        // Total XP capped at 5 maximum
        const totalXP = Math.min(baseXP + accuracyBonus, 5);
        
        return Math.max(1, totalXP); // Minimum 1 XP
    };

    const renderGameComponent = () => {
        if (!selectedGame || cards.length === 0) return null;

        const commonProps = {
            cards,
            onGameComplete: handleGameFinish,
            onBack: () => setSelectedGame(null)
        };

        switch (selectedGame) {
            case 'flash-recall':
                return <FlashRecallGame {...commonProps} />;
            case 'word-match':
                return <WordMatchGame {...commonProps} />;
            case 'case-fill':
                return <CaseFillGame {...commonProps} />;
            case 'true-false':
                return <TrueFalseGame {...commonProps} />;
            case 'speed-tap':
                return <SpeedTapGame {...commonProps} />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your vocabulary...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 mb-4">Failed to load vocabulary cards</p>
                <Button onClick={onClose} variant="outline">
                    Close
                </Button>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No Recent Study Cards
                </h3>
                <p className="text-gray-600 mb-4">
                    Study some vocabulary cards first to unlock mini-games!
                </p>
                <Button onClick={onClose} variant="outline">
                    Close
                </Button>
            </div>
        );
    }

    if (selectedGame) {
        return renderGameComponent();
    }

    return (
        <div className="p-4">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Choose Your Mini Game
                </h3>
                <p className="text-gray-600 text-sm">
                    Practice with {cards.length} recently studied words
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {gameTypes.map((game) => {
                    const IconComponent = game.icon;
                    return (
                        <button
                            key={game.id}
                            onClick={() => handleGameSelect(game.id)}
                            className="group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                            <div className="relative flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${game.color} flex items-center justify-center text-white shadow-lg`}>
                                    <IconComponent className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-800">
                                            {game.name}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            game.difficulty === 'Easy' 
                                                ? 'bg-green-100 text-green-700'
                                                : game.difficulty === 'Medium'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                        }`}>
                                            {game.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {game.description}
                                    </p>
                                </div>
                                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>Earn XP for each game</span>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="sm">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};
