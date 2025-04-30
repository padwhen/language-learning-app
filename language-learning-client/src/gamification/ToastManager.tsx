import { useToast } from "@/components/ui/use-toast"
import { StreakDisplay } from "./StreakDisplay"

export const useToastManager = () => {
    const { toast } = useToast()

    const showStreakToast = (streakCount: number, lastActiveDate: Date | null) => {
        toast({
            title: `Welcome back! It's your ${streakCount} day in a row`,
            description: (
                <StreakDisplay currentStreak={streakCount} lastActiveDate={lastActiveDate} />
            ),
            duration: 5000,
            className: `max-w-xs bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg rounded-lg`
        })
    }

    const showXpToast = (xpGained: number) => {
        toast({
            title: `+${xpGained} XP`,
            description: "Earned for your daily login!",
            duration: 3000,
            className: `max-w-xs bg-blue-500 text-white rounded-full px-4 py-2 shadow-md`
        })
    }

    const showMultiplierToast = (multiplier: string, expires: Date) => {
        toast({
            title: `Streak Bonus! +${multiplier}x XP Multiplier`,
            description: `Active until ${new Date(expires).toLocaleTimeString()}! +1 Streak Freeze also rewarded.`,
            duration: 5000,
            className: `max-w-xs bg-purple-500 text-white rounded-lg shadow-lg `
        })
    }

    const showErrorToast = (message: string) => {
        toast({
            title: "Error",
            description: message || "Something went wrong. Please try again",
            variant: "destructive",
            duration: 5000,
            className: `max-w-xs`
        })
    }

    return { showStreakToast, showXpToast, showMultiplierToast, showErrorToast }
}