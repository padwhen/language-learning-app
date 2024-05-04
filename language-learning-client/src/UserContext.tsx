import axios from "axios";
import { createContext, useEffect, useState } from "react";

interface User {
    username: string;
    name: string;
}

interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
});

export const UserContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data } = await axios.get<User>('/profile');
                setUser(data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        if (!user) {
            fetchUserProfile();
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};