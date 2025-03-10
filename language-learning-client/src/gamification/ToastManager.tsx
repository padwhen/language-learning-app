import { useToast } from "@/components/ui/use-toast"
import { StreakDisplay } from "./StreakDisplay"

export const useToastManager = () => {
    const { toast, toasts } = useToast()

    const getBottomOffset = (baseOffset: number) => {
        return baseOffset + toasts.length * 60
    }

    const showStreakToast = (streakCount: number, lastActiveDate: Date | null) => {
        toast({
            title: `Welcome back! It's your ${streakCount} day in a row`,
            description: (
                <StreakDisplay currentStreak={streakCount} lastActiveDate={lastActiveDate} />
            ),
            duration: 5000,
            className: `max-w-xs fixed bottom-${getBottomOffset(4)} left-4 bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg rounded-lg z-50`
        })
    }

    const showXpToast = (xpGained: number) => {
        toast({
            title: `+${xpGained} XP`,
            description: "Earned for your daily login!",
            duration: 3000,
            className: `max-w-xs fixed bottom-${getBottomOffset(16)} left-4 bg-blue-500 text-white rounded-full px-4 py-2 shadow-md z-50`
        })
    }

    const showMultiplierToast = (multiplier: string, expires: Date) => {
        toast({
            title: `Streak Bonus! +${multiplier}x XP Multiplier`,
            description: `Active until ${new Date(expires).toLocaleTimeString()}! +1 Streak Freeze also rewarded.`,
            duration: 5000,
            className: `max-w-xs fixed bottom-${getBottomOffset(28)} left-4 bg-purple-500 text-white rounded-lg shadow-lg z-50`
        })
    }

    const showErrorToast = (message: string) => {
        toast({
            title: "Error",
            description: message || "Something went wrong. Please try again",
            variant: "destructive",
            duration: 5000,
            className: `max-w-xs fixed bottom-${getBottomOffset(40)} left-4 z-50`
        })
    }

    return { showStreakToast, showXpToast, showMultiplierToast, showErrorToast }
}