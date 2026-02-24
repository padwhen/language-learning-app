import { Card, CardContent } from "../../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../ui/dialog";
import { Badge } from "../../ui/badge";
import { CalendarIcon, Trophy } from "lucide-react";
import { Calendar } from "../../ui/calendar";
import { getXPProgress } from "../utils";

interface UserStatsCardProps {
  user: any;
  loginDays: Date[];
  experienceHistory: Array<{
    date: string;
    action: string;
    xp: number;
  }>;
  highlightedElement?: string | null;
}

export const UserStatsCard = ({ 
  user, 
  loginDays, 
  experienceHistory, 
  highlightedElement 
}: UserStatsCardProps) => {
  const xpProgress = getXPProgress(user?.level, user?.xp);

  return (
    <Card className={`transition-all duration-300 ${
      highlightedElement === 'user-stats' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg' : ''
    }`}>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Experience Card */}
          <Dialog>
            <DialogTrigger asChild>
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200">
                <div className="text-sm opacity-90 mb-2">Experience</div>
                <div className="text-4xl font-bold mb-1">{xpProgress.xpInCurrentLevel}</div>
                <div className="text-xs opacity-80 mb-4">{user?.xp ?? 0} out of {xpProgress.xpForNextLevel} XP</div>
                <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                  <div 
                    className="bg-white h-2 rounded-full" 
                    style={{ width: `${xpProgress.progressPercentage}%` }}
                  ></div>
                </div>
                <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/30">
                  🏆 Level {user?.level}
                </Badge>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Experience History
                </DialogTitle>
                <DialogDescription>View your XP gains and activity history</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {experienceHistory.length > 0 ? experienceHistory.map((entry, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{entry.action}</div>
                      <div className="text-xs text-slate-600">{entry.date}</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      +{entry.xp} XP
                    </Badge>
                  </div>
                )) : <div className="text-slate-500 text-sm">No XP history yet.</div>}
              </div>
            </DialogContent>
          </Dialog>

          {/* Streak Card */}
          <Dialog>
            <DialogTrigger asChild>
              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200">
                <div className="text-sm opacity-90 mb-2">Learning Streak</div>
                <div className="text-4xl font-bold mb-1">{user?.currentStreak ?? 0}</div>
                <div className="text-xs opacity-80 mb-4">Max: {user?.maxStreak ?? 0} days</div>
                <div className="text-sm opacity-90">
                  🔥 Keep it up tomorrow!
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Login Calendar
                </DialogTitle>
                <DialogDescription>View your login history and streaks</DialogDescription>
              </DialogHeader>
              <div className="p-4">
                <Calendar
                  mode="multiple"
                  selected={loginDays}
                  className="flex justify-center items-center w-full"
                  modifiers={{
                    loginDay: loginDays
                  }}
                  modifiersStyles={{
                    loginDay: {
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                  month={loginDays.length > 0 ? loginDays[0] : new Date()}
                  showOutsideDays={false}
                />
                <div className="mt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Days you logged in</span>
                  </div>
                  <p>Current streak: {user?.currentStreak ?? 0} day(s) • Best streak: {user?.maxStreak ?? 0} days </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}; 