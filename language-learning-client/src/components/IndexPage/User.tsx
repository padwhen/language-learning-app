import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RegisterPage } from "../UsersComponents/RegisterPage";
import { Link } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
import { LoginPage } from "../UsersComponents/LoginPage";
import { UserContext } from "@/UserContext";
import { Avatar, AvatarImage } from "../ui/avatar";

const UserLoggedIn = ({ user, handleLogout }: {
    user: { name: string; avatarUrl?: string }
    handleLogout: () => void;
}) => (
    <div className="w-full max-w-sm mx-auto flex flex-col bg-white border border-blue-600 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
        <div className="p-4">
            <h1 className="text-xl sm:text-2xl gap-2 font-bold text-gray-800 dark:text-white flex items-center justify-center">
            <div className="rounded-3xl p-px bg-gradient-to-r from-blue-600 to-sky-600">
                <Avatar>
                    <AvatarImage src={user.avatarUrl} />
                </Avatar>
            </div>

                <span className="ml-2">{user.name}</span>
            </h1>
            <div className="mt-4 flex lg:flex-col flex-row justify-center items-center gap-1">
                <Link to="/settings" className="w-full sm:w-auto text-center px-4 py-2 text-md font-semibold rounded-lg text-blue-600 hover:bg-blue-50">
                    Profile Settings
                </Link>
                <Link to="/vocabulary" className="w-full sm:w-auto text-center px-4 py-2 text-md font-semibold rounded-lg text-blue-600 hover:bg-blue-50">
                    All Vocabulary
                </Link>
                <button onClick={handleLogout} className="w-full sm:w-auto text-center px-4 py-2 text-md font-semibold rounded-lg text-blue-600 hover:bg-blue-50">
                    Log Out
                </button>
            </div>
        </div>
    </div>
)

const UserLoggedOut = () => (
    <div className="w-full max-w-sm mx-auto flex flex-col bg-white border border-blue-600 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
        <div className="p-4">
            <h1 className="text-xl sm:text-2xl gap-2 font-bold text-gray-800 dark:text-white flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <span className="ml-2">Username</span>
            </h1>
            <div className="flex lg:flex-col flex-row justify-center items-center gap-1">
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="w-full sm:w-auto text-center px-4 py-2 text-md font-semibold rounded-lg text-blue-600 hover:bg-blue-50">
                            Register
                        </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[555px] max-h-[570px] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-4xl flex items-center justify-center mt-2">Register</DialogTitle>
                        </DialogHeader>
                        <RegisterPage />
                        <DialogFooter />
                    </DialogContent>
                </Dialog>
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="w-full sm:w-auto text-center px-4 py-2 text-md font-semibold rounded-lg text-blue-600 hover:bg-blue-50">
                            Log In
                        </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[555px] max-h-[570px] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-4xl flex items-center justify-center mt-8">Log In</DialogTitle>
                        </DialogHeader>
                        <LoginPage />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    </div>
)

export const User = () => {
    const { user, setUser } = useContext(UserContext)

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            setUser(null);
            localStorage.clear();
            window.location.reload();
        } catch (error) {
            console.error('Error logging out: ', error);
        }
    }

    return (
        <div className="w-full px-4 py-2">
            {user ? <UserLoggedIn user={user} handleLogout={handleLogout} /> : <UserLoggedOut />}
        </div>
    )
}