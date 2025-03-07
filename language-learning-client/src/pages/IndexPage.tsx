import { TranslationBar } from "../components/IndexPage/TranslationBar";
import { InputBar } from "../components/IndexPage/InputBar";
import { Translation } from "../components/IndexPage/Translation";
import { WordDetails } from "../components/IndexPage/Details";
import { User } from "../components/IndexPage/User";
import { DeckInfo } from "../components/IndexPage/DeckInfo";
import useTranslation from "../state/hooks/useTranslation";
import { useContext, useEffect } from "react";
import { UserContext } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { StreakDisplay } from "@/gamification/StreakDisplay";
import axios from "axios";


export const IndexPage = () => {
    const { fromLanguage, setFromLanguage, inputText, setInputText, ready, response, handleTranslation } = useTranslation()
    const { user, refreshUserStats } = useContext(UserContext)
    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            const today = new Date()
            const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null
            const isFirstLoginToday =
                !lastActive || new Date(lastActive).toDateString() !== today.toDateString()
            
            if (isFirstLoginToday) {
                // Streak toast
                toast({
                    title: `Welcome back! It's your ${user.currentStreak + 1} day in a row`,
                    description: (
                        <StreakDisplay
                            currentStreak={user.currentStreak + 1}
                            lastActiveDate={user.lastActiveDate}
                        />
                    ),
                    duration: 5000
                })

                // XP Toast and Award XP 
                const xpGain = user.currentStreak + 1
                setTimeout(async () => {
                    try {
                        const response = await axios.post("/gamification/award-xp", {
                            xpAmount: xpGain,
                            activity: "daily_login"
                        })
                        const data = response.data

                        // toast({
                        //     title: `+${data.adjustedXpGained} XP`,
                        //     description: 'Earned for your daily login!',
                        //     duration: 3000,
                        //     className: 'fixed bottom-4 left-4' 
                        // })

                        // Check for multiplier reward
                        if (data.streakReward?.type === "xp_multiplier") {
                            toast({
                                title: `Streak Bonus! +${data.streakReward.multiplier}x XP Multiplier`,
                                description: `Active until ${new Date(data.streakReward.expires).toLocaleTimeString()}! +1 Streak Freeze also awarded.`,
                                duration: 5000
                            })
                        }

                        // Refresh user stats after awarding XP
                        await refreshUserStats()
                    } catch (error) {
                        console.error("Error awarding XP: ", error)
                        toast({
                            title: "Error", 
                            description: "Failed to award XP. Please try again",
                            variant: 'destructive'
                        })
                    }
                })
            }
        }
    }, [])

    return (
        <div className="flex flex-col lg:flex-row">
            <div className="w-full px-4 lg:px-16 flex flex-col items-center">
                <TranslationBar fromLanguage={fromLanguage} setFromLanguage={setFromLanguage} />
                <InputBar inputText={inputText} setInputText={setInputText} handleTranslation={handleTranslation} ready={ready} />
                {response?.sentence && (
                    <Translation text={response.sentence} />    
                )}
                {response?.words && (
                    <WordDetails words={response.words} />    
                )}
            </div>
            <div className="w-full lg:w-1/4 flex flex-col mr-4">
                <div className="md:hidden lg:hidden"><User /></div>
                <div className="mt-2">
                    <DeckInfo />
                </div>
            </div>
        </div>
    )
}
