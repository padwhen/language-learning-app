import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { hasToken } from "./utils/cookies";

interface User {
    _id: string;
    username: string;
    name: string;
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
    const isAuthenticated = !!user;

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = hasToken()
                if (token) {
                    const { data } = await axios.get<User>('/profile');
                    setUser(data);                    
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        if (!user) {
            fetchUserProfile();
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, isAuthenticated }}>
            {children}
        </UserContext.Provider>
    );
};