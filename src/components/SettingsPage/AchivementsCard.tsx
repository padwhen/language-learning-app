


// src/components/SettingsPage/AchievementsCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Sparkles, Star } from "lucide-react";

interface AchievementsCardProps {
  highlightedElement: string | null;
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({ highlightedElement }) => {
  return (
    <Card className={`transition-all duration-300 ${
      highlightedElement === 'achievements' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg' : ''
    }`}>
      <CardHeader>
        <CardTitle>Recent Achievements</CardTitle>
        <p className="text-sm text-slate-600">Your latest milestones</p>
      </CardHeader>
      <CardContent>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg">Daily Visitor</div>
                <div className="text-sm opacity-90">Visited the app today</div>
              </div>
              <div className="ml-auto">
                <Star className="h-6 w-6 text-yellow-300 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};