import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { hasToken } from "./utils/cookies";

interface Achievement {
    name: string;
    dateEarned: Date;
    description?: string;
}

interface Badge {
    name: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
    dateEarned: Date;
}

interface User {
    _id: string;
    username: string;
    name: string;
    avatarUrl?: string

    // New Gamification Fields
    level?: number;
    xp?: number;
    currentStreak?: number;
    maxStreak?: number;
    streakFreezes?: number;
    achievements?: Achievement[]
    badges?: Badge[]
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

export const UserContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

    const refreshUserStats = async () => {
        try {
            const { data: gamificationStats } = await axios.get('/gamification/stats')
            setUser(prevUser => prevUser ? {
                ...prevUser,
                level: gamificationStats.level,
                xp: gamificationStats.xp,
                currentStreak: gamificationStats.currentStreak,
                maxStreak: gamificationStats.maxStreak,
                streakFreezes: gamificationStats.streakFreezes,
                achievements: gamificationStats.achievements,
                badges: gamificationStats.badges
            } : null)
        } catch (error) {
            console.error('Error refreshing user stats: ', error)
        }
    }

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const tokenExists = hasToken()
                if (tokenExists) {
                    setIsAuthenticated(true)
                    const { data } = await axios.get<User>('/profile');
                    const defaultAvatarUrl = "https://github.com/shadcn.png";

                    if (!data.avatarUrl) {
                        data.avatarUrl = defaultAvatarUrl;
                    }

                    // Fetch gamification stats
                    try {
                        const { data: gamificationStats } = await axios.get('/gamification/stats')
                        Object.assign(data, {
                            level: gamificationStats.level,
                            xp: gamificationStats.xp,
                            currentStreak: gamificationStats.currentStreak,
                            maxStreak: gamificationStats.maxStreak,
                            streakFreezes: gamificationStats.streakFreezes,
                            achievements: gamificationStats.achievements,
                            badges: gamificationStats.badges
                        });
                    } catch (error) {
                        console.error('Error fetching gamification stats: ', error)
                    }
                    setUser(data);
                    localStorage.setItem('userId', data._id)                   
                } else {
                    setIsAuthenticated(false);
                    setUser(null)
                    localStorage.removeItem('userId')
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setIsAuthenticated(false)
                localStorage.removeItem('userId')
            }
        };

        if (!user) {
            fetchUserProfile();
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser, isAuthenticated, refreshUserStats }}>
            {children}
        </UserContext.Provider>
    );
};