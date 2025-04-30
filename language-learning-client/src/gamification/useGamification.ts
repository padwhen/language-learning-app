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
    const [isAwarding, setIsAwarding] = useState(false) 
    const { showStreakToast, showXpToast, showMultiplierToast, showErrorToast } = useToastManager()

    const awardDailyLoginXp = async () => {
        if (isAwarding) return;
        setIsAwarding(true)

        try {
            const response = await axios.post("/gamification/award-xp", {
                xpAmount: 1, // Base XP for login, adjusted by streak on backend
                activity: 'daily_login',
            });
            const data = response.data;
            console.log("Backend Response: ", data)

            // Show toasts based on backend response
            // Only show XP toast if XP was actually gained
            if (data.adjustedXpGained > 0) {
                showXpToast(data.adjustedXpGained)
            }

            if (data.streakIncreased || data.streakStarted) {
                // Use streak count from response data, not potentially stale user state
                showStreakToast(data.currentStreak, data.lastActiveDate)
            }

            if (data.streakReward?.type === 'xp_multiplier' /* ... */) {
                // ...multiplier toast logic...
            }

            await refreshUserStats()
        } catch (error) {
            console.error("Error awarding XP: ", error);
            showErrorToast("Failed to award XP. Please try again.");
        } finally {
            setIsAwarding(false)
        }
    };

    return { awardDailyLoginXp };
}