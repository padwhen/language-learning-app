import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Trophy, Star } from "lucide-react";
import Lottie from "lottie-react";
import { allAchievements, lottieMap } from "../utils";

interface AchievementsCardProps {
  user: any;
  highlightedElement?: string | null;
}

export const AchievementsCard = ({ user, highlightedElement }: AchievementsCardProps) => {
  const userAchievements = user?.achievements || [];

  return (
    <Card className={`transition-all duration-300 ${
      highlightedElement === 'achievements' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg' : ''
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </CardTitle>
        <p className="text-sm text-slate-600">
          {user?.achievements ? `${user.achievements.length} of 6 unlocked` : '0 of 6 unlocked'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {allAchievements.slice(0, 16).map((achievement, _index) => {
            if (!achievement) return null;
            
            const isUnlocked = userAchievements.some((ua: any) => ua.name === achievement.name);
            const isComingSoon = achievement.comingSoon === true;
            const earnedDate = userAchievements.find((ua: any) => ua.name === achievement.name)?.dateEarned;

            return (
              <div
                key={achievement.id}
                className="group relative w-32 h-32"
              >
                {/* Achievement Box */}
                <div className={`
                  w-full h-full rounded-lg border-2 transition-all duration-300 flex items-center justify-center text-xl cursor-pointer
                  ${isUnlocked 
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300 hover:border-yellow-400 hover:shadow-lg' 
                    : isComingSoon
                    ? 'bg-gray-50 border-gray-200 opacity-30'
                    : 'bg-gray-100 border-gray-300 opacity-50 hover:opacity-70'
                  }
                `}>
                  {isUnlocked && 'lottieFile' in achievement && achievement.lottieFile ? (
                    <Lottie 
                      animationData={lottieMap[achievement.lottieFile as keyof typeof lottieMap]} 
                      loop={true} 
                      style={{ width: 56, height: 56 }}
                    />
                  ) : (
                    <span className={isComingSoon ? 'text-gray-300' : 'text-gray-400'}>
                      {achievement.icon}
                    </span>
                  )}
                  
                  {/* Unlock indicator */}
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Star className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Hover Tooltip */}
                {!isComingSoon && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="font-semibold">{achievement.name}</div>
                      <div className="text-gray-300 mt-1">{achievement.description}</div>
                      {isUnlocked && earnedDate && (
                        <div className="text-yellow-300 mt-1 text-xs">
                          Earned {new Date(earnedDate).toLocaleDateString()}
                        </div>
                      )}
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Achievement Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Achievement Progress</span>
            <span className="font-medium text-gray-900">
              {user?.achievements?.length || 0} / 6 Complete
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((user?.achievements?.length || 0) / 6) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 