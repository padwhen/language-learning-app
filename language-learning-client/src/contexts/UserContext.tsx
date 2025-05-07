// src/contexts/UserContext.js
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { hasToken } from "../utils/cookies";
import { useGamification } from "@/gamification/useGamification";

interface Achievement {
    name: string;
    dateEarned: Date;
    description?: string;
}

interface Badge {
    name: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    dateEarned: Date;
}

export interface User {
    _id: string;
    username: string;
    name: string;
    avatarUrl?: string;
    level?: number;
    xp?: number;
    currentStreak?: number;
    maxStreak?: number;
    streakFreezes?: number;
    lastActiveDate?: Date;
    xpMultiplier?: number;
    xpMultiplierExpiration?: Date | null;
    achievements?: Achievement[];
    badges?: Badge[];
}

interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isAuthenticated: boolean;
    refreshUserStats: () => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
    isAuthenticated: false,
    refreshUserStats: async () => {}
});

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const refreshUserStats = async () => {
        try {
            const { data } = await axios.get('/profile'); // Use /profile instead of /gamification/stats
            setUser(prevUser => prevUser ? { ...prevUser, ...data } : data);
        } catch (error) {
            console.error('Error refreshing user stats: ', error);
        }
    };

    const { awardDailyLoginXp } = useGamification(user, refreshUserStats);

    const fetchUserProfile = async () => {
        try {
            const tokenExists = hasToken();
            if (tokenExists) {
                setIsAuthenticated(true);
                const { data } = await axios.get<User>('/profile');
                const defaultAvatarUrl = "https://github.com/shadcn.png";

                data.avatarUrl = defaultAvatarUrl || defaultAvatarUrl;
                setUser(data);
                localStorage.setItem('userId', data._id);
                
                // Award XP for daily login
                await awardDailyLoginXp();
            } else {
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem('userId');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('userId');
        }
    };

    useEffect(() => {
        if (!user) {
            fetchUserProfile();
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, isAuthenticated, refreshUserStats }}>
            {children}
        </UserContext.Provider>
    );
};