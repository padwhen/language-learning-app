import React, { useState } from 'react';
import Lottie from 'react-lottie';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
    Trophy, 
    Flame, 
    Star, 
    Award 
} from 'lucide-react';

// Import Lottie animations (you'll need to install these or create custom animations)
import levelUpAnimation from '@/assets/lottie/level-up.json';
import achievementAnimation from '@/assets/lottie/achievement.json';
import { User } from '@/contexts/UserContext';

interface UserStatsProps {
    user: User;
}

export const UserStats: React.FC<UserStatsProps> = ({ user }) => {
    const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
    const [showAchievementAnimation, setShowAchievementAnimation] = useState(false);

    // Calculate XP for next level
    const calculateXPForNextLevel = (currentLevel: number) => {
        return Math.pow(currentLevel, 2) * 100;
    }

    // Lottie animation options
    const levelUpOptions = {
        loop: false,
        autoplay: true,
        animationData: levelUpAnimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const achievementOptions = {
        loop: false,
        autoplay: true,
        animationData: achievementAnimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const currentLevel = user.level || 1;
    const currentXP = user.xp || 0;
    const xpForNextLevel = calculateXPForNextLevel(currentLevel);
    const xpProgressPercentage = (currentXP / xpForNextLevel) * 100;

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>User Stats</span>
                    <div className="flex items-center space-x-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <span>Level {currentLevel}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Level and XP Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Experience</h3>
                        <div className="flex items-center space-x-2">
                            <Star className="w-5 h-5 text-blue-500" />
                            <Progress 
                                value={xpProgressPercentage} 
                                className="w-full" 
                            />
                            <span>{currentXP} / {xpForNextLevel} XP</span>
                        </div>
                    </div>

                    {/* Streak Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Streak</h3>
                        <div className="flex items-center space-x-2">
                            <Flame className="w-5 h-5 text-red-500" />
                            <span>Current Streak: {user.currentStreak || 0} days</span>
                            <span>Max Streak: {user.maxStreak || 0} days</span>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Recent Achievements</h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {user.achievements?.slice(0, 5).map((achievement, index) => (
                            <div 
                                key={index} 
                                className="flex flex-col items-center p-2 bg-gray-100 rounded-md"
                            >
                                <Award className="w-8 h-8 text-green-500" />
                                <span className="text-xs text-center">{achievement.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Badges Section */}
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Badges</h3>
                    <div className="flex space-x-2">
                        {user.badges?.map((badge, index) => (
                            <div 
                                key={index} 
                                className={`
                                    p-2 rounded-md 
                                    ${badge.tier === 'Bronze' ? 'bg-orange-100 text-orange-800' : 
                                      badge.tier === 'Silver' ? 'bg-gray-200 text-gray-800' : 
                                      badge.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-purple-100 text-purple-800'}
                                `}
                            >
                                {badge.name} ({badge.tier})
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>

            {/* Animated Modals for Level Up and Achievements */}
            {showLevelUpAnimation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <Lottie 
                        options={levelUpOptions} 
                        height={400} 
                        width={400} 
                        isStopped={false}
                        isPaused={false}
                        eventListeners={[
                            {
                                eventName: 'complete',
                                callback: () => setShowLevelUpAnimation(false)
                            }
                        ]}
                    />
                </div>
            )}

            {showAchievementAnimation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <Lottie 
                        options={achievementOptions} 
                        height={400} 
                        width={400} 
                        isStopped={false}
                        isPaused={false}
                        eventListeners={[
                            {
                                eventName: 'complete',
                                callback: () => setShowAchievementAnimation(false)
                            }
                        ]}
                    />
                </div>
            )}
        </Card>
    );
};