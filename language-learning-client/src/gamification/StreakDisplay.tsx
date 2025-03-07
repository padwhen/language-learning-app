import Lottie from "react-lottie";
import fireAnimation from "../assets/lottie/streak.json"
import { Flame } from "lucide-react";

interface StreakDisplayProps {
    currentStreak: number;
    lastActiveDate: Date;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ currentStreak, lastActiveDate }) => {
    const today = new Date()
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1

    console.log(lastActiveDate)

    const streakDays = Array(7).fill(false)
    if (lastActiveDate) {
        const lastActive = new Date(lastActiveDate)
        const dayDifference = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
        if (dayDifference === 0 && currentStreak > 0) {
            for (let i = 0; i < currentStreak && i < 7; i++) {
                const dayIndex = (currentDayIndex - i + 7) % 7
                streakDays[dayIndex] = true
            }
        }
    }

    const fireOptions = {
        loop: true,
        autoPlay: true,
        animationData: fireAnimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    return (
        <div className="flex space-x-2">
            {weekDays.map((day, index) => (
                <div
                    key={index}
                    className={`w-10 h-10 flex items-center justify-center rounded-md border ${
                        streakDays[index]
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                >
                    {index === currentDayIndex && streakDays[index] ? (
                        <Lottie options={fireOptions} height={30} width={30} />
                    ) : (
                        day[0]
                    )}
                </div>
            ))}
            <div className="flex items-center space-x-1">
                <Flame className="w-5 h-5 text-red-500" />
                <span>{currentStreak}</span>
            </div>
        </div>
    )
}