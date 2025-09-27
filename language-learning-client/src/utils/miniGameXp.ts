import { GameResult } from '@/components/IndexPage/MiniGames/MiniGameEngine';
import axios from 'axios';

export interface XpAwardRequest {
    gameType: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    xpEarned: number;
}

export const awardMiniGameXp = async (gameResult: GameResult): Promise<boolean> => {
    try {
        await axios.post('/gamification/award-xp', {
            xpAmount: gameResult.xpEarned,
            activity: `mini_game_${gameResult.gameType}`
        })
        return true;
    } catch (error) {
        console.error('Error awarding XP:', error);
        return false;
    }
};

export const showXpToast = (xpEarned: number, gameType: string) => {
    // Create an enhanced toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-[9999] transform transition-all duration-500 translate-x-full border border-green-400';
    
    // Format game type for display
    const formattedGameType = gameType.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <span class="text-xl">🎉</span>
            </div>
            <div>
                <div class="font-bold text-lg">+${xpEarned} XP Earned!</div>
                <div class="text-sm opacity-90">${formattedGameType} completed</div>
                <div class="text-xs opacity-75 mt-1">Great job! Keep learning! 🚀</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in with bounce effect
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
        toast.classList.add('animate-bounce');
    }, 100);
    
    // Remove bounce after animation
    setTimeout(() => {
        toast.classList.remove('animate-bounce');
    }, 1000);
    
    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 500);
    }, 4000);
};
