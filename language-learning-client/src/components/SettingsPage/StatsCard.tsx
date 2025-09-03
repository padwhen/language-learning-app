import { Trophy } from "lucide-react";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface StatsCardProps {
    user: any;
    xpProgress: any;
    experienceHistory: any[];
    highlightedElement: string | null;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    user,
    xpProgress,
    experienceHistory,
    highlightedElement
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className={`bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200 w-full ${highlightedElement === 'user-stats' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg' : ''}`}>
                    <div className="text-sm opacity-90 mb-2">Experience</div>
                    <div className="text-4xl font-bold mb-1">{user?.xp ?? 0}</div>
                    <div className="text-xs opacity-80 mb-4">out of {xpProgress.xpNeededForNextLevel} XP</div>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                        <div className="bg-white h-2 rounded-full" style={{ width: `${xpProgress.progressPercentage}%` }}></div>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/30">
                        🏆 Level {user?.level}
                    </Badge>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Experience History
                    </DialogTitle>
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
                    )) : 
                    <div className="text-slate-500 text-sm">
                        No XP history yet.
                    </div>
                    }
                </div>
            </DialogContent>
        </Dialog>
    )
}