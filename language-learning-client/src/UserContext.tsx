import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { hasToken } from "./utils/cookies";

interface User {
    _id: string;
    username: string;
    name: string;
    avatarUrl?: string
}

interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isAuthenticated: boolean;
}

export const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
    isAuthenticated: false
});

export const UserContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

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
                    setUser(data);                    
                } else {
                    setIsAuthenticated(false);
                    setUser(null)
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setIsAuthenticated(false)
            }
        };

        if (!user) {
            fetchUserProfile();
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser, isAuthenticated }}>
            {children}
        </UserContext.Provider>
    );
};