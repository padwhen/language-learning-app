import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

interface StreakCardProps {
  user: any;
  loginDays: Date[];
}

export const StreakCard: React.FC<StreakCardProps> = ({ user, loginDays }) => {
  return (
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
  );
};