import { useToast } from "@/components/ui/use-toast";
import Lottie from "lottie-react";
import { motion } from "framer-motion";

// Import Lottie animations
import streakAnimation from '@/assets/lottie/streak.json';
import achievementAnimation from '@/assets/lottie/achievement.json';
import levelUpAnimation from '@/assets/lottie/level-up.json';
import sharkAnimation from '@/assets/lottie/shark.json';
import catAnimation from '@/assets/lottie/Cat_scratches.json';
import cookingEggAnimation from '@/assets/lottie/Cooking_egg.json';
import winkAnimation from '@/assets/lottie/wink.json';
import rabbitAnimation from '@/assets/lottie/Rabbit.json';
import owlAnimation from '@/assets/lottie/owl.json';

const lottieMap = {
    'shark.json': sharkAnimation,
    'Cat_scratches.json': catAnimation,
    'Cooking_egg.json': cookingEggAnimation,
    'wink.json': winkAnimation,
    'Rabbit.json': rabbitAnimation,
    'owl.json': owlAnimation,
    'streak.json': streakAnimation,
    'achievement.json': achievementAnimation,
    'level-up.json': levelUpAnimation
};

// Tier colors for hologram effect
const tierColors = {
    bronze: 'from-amber-400 to-orange-500',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    diamond: 'from-blue-400 to-purple-600'
};

export const useToastManager = () => {
    const { toast } = useToast();

    const showXpToast = (xpAmount: number) => {
        toast({
            title: "Experience Gained!",
            description: (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8">
                        <Lottie animationData={levelUpAnimation} loop={false} />
                    </div>
                    <span>+{xpAmount} XP earned!</span>
                </div>
            ),
            duration: 3000,
        });
    };

    const showStreakToast = (streakCount: number, lastActiveDate?: Date) => {
        toast({
            title: "Streak Updated!",
            description: (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8">
                        <Lottie animationData={streakAnimation} loop={false} />
                    </div>
                    <span>🔥 {streakCount} day streak!</span>
                </div>
            ),
            duration: 4000,
        });
    };

    const showAchievementToast = (achievement: {
        name: string;
        description: string;
        lottieFile?: string;
        tier?: string;
    }) => {
        const animationData = achievement.lottieFile ? lottieMap[achievement.lottieFile as keyof typeof lottieMap] : achievementAnimation;
        const tierGradient = achievement.tier ? tierColors[achievement.tier as keyof typeof tierColors] : '';

        toast({
            title: "🎉 Achievement Unlocked!",
            description: (
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-3 p-2"
                >
                    <div className="relative">
                        <div className="w-12 h-12 relative">
                            <Lottie animationData={animationData} loop={true} />
                        </div>
                        {achievement.tier && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r ${tierGradient} rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg`}
                            >
                                {achievement.tier.charAt(0).toUpperCase()}
                            </motion.div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-sm">{achievement.name}</div>
                        <div className="text-xs text-gray-600">{achievement.description}</div>
                        {achievement.tier && (
                            <div className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium bg-gradient-to-r ${tierGradient} text-white`}>
                                {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)} Tier
                            </div>
                        )}
                    </div>
                </motion.div>
            ),
            duration: 5000,
        });
    };

    const showBadgeToast = (badge: {
        name: string;
        tier: string;
        count?: number;
    }) => {
        const tierGradient = tierColors[badge.tier.toLowerCase() as keyof typeof tierColors];
        
        toast({
            title: "🏆 Badge Upgraded!",
            description: (
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-3 p-2"
                >
                    <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1 }}
                        className={`w-12 h-12 bg-gradient-to-r ${tierGradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                        🏆
                    </motion.div>
                    <div>
                        <div className="font-bold text-sm">{badge.name}</div>
                        <div className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium bg-gradient-to-r ${tierGradient} text-white`}>
                            {badge.tier} Tier
                        </div>
                        {badge.count && (
                            <div className="text-xs text-gray-600 mt-1">
                                {badge.count} games completed
                            </div>
                        )}
                    </div>
                </motion.div>
            ),
            duration: 5000,
        });
    };

    const showErrorToast = (message: string) => {
        toast({
            title: "Error",
            description: message,
            variant: "destructive",
            duration: 3000,
        });
    };

    return {
        showXpToast,
        showStreakToast,
        showAchievementToast,
        showBadgeToast,
        showErrorToast
    };
};