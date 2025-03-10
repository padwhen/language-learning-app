import { useState } from "react";
import { useToastManager } from "./ToastManager";
import axios from "axios";

export const useGamification = (
    user: {
        currentStreak?: number;
        lastActiveDate?: Date | null;
    } | null,
    refreshUserStats: () => Promise<void>
) => {
    console.log(user)
    const [hasAwardedXpToday, setHasAwardedXpToday] = useState(() => {
        const lastAwardDate = localStorage.getItem('lastXpAwardDate')
        const today = new Date().toDateString()
        return lastAwardDate === today // True if XP was already awarded today
    })
    const [isAwarding, setIsAwarding] = useState(false) 
    const { showStreakToast, showXpToast, showMultiplierToast, showErrorToast } = useToastManager()

    const awardDailyLoginXp = async () => {
        if (hasAwardedXpToday || isAwarding) return;

        setIsAwarding(true)
        const today = new Date();
        try {
            const response = await axios.post("/gamification/award-xp", {
                xpAmount: 1, // Base XP for login, adjusted by streak on backend
                activity: 'daily_login',
            });
            const data = response.data;
            // Show toasts based on backend response
            if (data.streakIncreased || data.streakStarted) {
                showStreakToast(data.currentStreak, user?.lastActiveDate ?? null);
            }
            showXpToast(data.adjustedXpGained);

            if (data.streakReward?.type === 'xp_multiplier' && data.streakReward.multiplier && data.streakReward.expires) {
                showMultiplierToast(data.streakReward.multiplier, data.streakReward.expires);
            }

            localStorage.setItem('lastXpAwardDate', today.toDateString());
            setHasAwardedXpToday(true);
            await refreshUserStats();
        } catch (error) {
            console.error("Error awarding XP: ", error);
            showErrorToast("Failed to award XP. Please try again.");
        } finally {
            setIsAwarding(false)
        }
    };

    return { hasAwardedXpToday, awardDailyLoginXp };
}