import { useState } from 'react';
import axios from 'axios';
import { useToastManager } from '@/gamification/ToastManager';

interface MatchGameResult {
    deckId: string;
    cardIds: string[];
    timeElapsed: number;
    mistakes: number;
    completed: boolean;
}

interface Achievement {
    name: string;
    description: string;
    lottieFile?: string;
    tier?: string;
}

interface Badge {
    name: string;
    tier: string;
    count?: number;
}

interface MatchGameResponse {
    success: boolean;
    xp: number;
    level: number;
    xpGained: number;
    achievements: Achievement[];
    badges: Badge[];
    levelUpInfo?: {
        newLevel: number;
        xpGained: number;
    };
    matchGameStats: {
        gamesPlayed: number;
        uniqueCardsMatched: number;
        flawlessGames: number;
        gamesUnder60s: number;
        decksPlayed: number;
        midnightGames: number;
    };
}

export const useMatchGameGamification = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showXpToast, showAchievementToast, showBadgeToast, showErrorToast } = useToastManager();

    const submitMatchGameResult = async (result: MatchGameResult): Promise<MatchGameResponse | null> => {
        if (isSubmitting) return null;
        
        setIsSubmitting(true);
        
        try {
            console.log('Submitting match game result:', result);
            
            const response = await axios.post('/gamification/match-game-complete', result);
            const data: MatchGameResponse = response.data;
            
            console.log('Match game gamification response:', data);
            
            // Show XP toast if XP was gained
            if (data.xpGained > 0) {
                showXpToast(data.xpGained);
            }
            
            // Show achievement toasts
            if (data.achievements && data.achievements.length > 0) {
                data.achievements.forEach((achievement, index) => {
                    setTimeout(() => {
                        showAchievementToast(achievement);
                    }, index * 1000); // Stagger achievement toasts
                });
            }
            
            // Show badge toasts
            if (data.badges && data.badges.length > 0) {
                data.badges.forEach((badge, index) => {
                    setTimeout(() => {
                        showBadgeToast(badge);
                    }, (data.achievements?.length || 0) * 1000 + index * 1000); // Show after achievements
                });
            }
            
            // Level up toast (handled by existing system if needed)
            if (data.levelUpInfo) {
                setTimeout(() => {
                    showXpToast(data.levelUpInfo!.xpGained);
                }, ((data.achievements?.length || 0) + (data.badges?.length || 0)) * 1000);
            }
            
            return data;
            
        } catch (error: any) {
            console.error('Error submitting match game result:', error);
            showErrorToast(error.response?.data?.error || 'Failed to process match game result');
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        submitMatchGameResult,
        isSubmitting
    };
}; 