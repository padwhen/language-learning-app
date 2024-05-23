import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RegisterPage } from "./UsersComponents/RegisterPage";
import { Link } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
import { LoginPage } from "./UsersComponents/LoginPage";
import { UserContext } from "@/UserContext";

export const User = () => {
    const { user, setUser } = useContext(UserContext);
    
    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            setUser(null)
            window.location.reload()
        } catch (error) {
            console.error('Error logging out: ', error)
        }
    }

    return (
        <div className="flex items-center justify-start">
            {user ? (
            <div className="w-64 flex flex-col bg-white border border-blue-600 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
            <div className="p-2">
            <h1 className="text-2xl gap-2 font-bold text-gray-800 dark:text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                {user.username}
            </h1>
                <div className="mt-3 justify-center flex items-center gap-x-1 text-md font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400">
                    <Link to={"/view-all-decks"}>View All Your Decks</Link>
                </div> 
                <div onClick={handleLogout} className="cursor-pointer mt-3 justify-center flex items-center gap-x-1 text-md font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400">
                    Log Out
                </div> 
            </div>  
        </div>   
            ) : (
            <div className="w-64 flex flex-col bg-white border border-blue-600 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
                <div className="p-2">
                <h1 className="text-2xl gap-2 font-bold text-gray-800 dark:text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    Username
                </h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <a className="cursor-pointer mt-3 justify-center flex items-center gap-x-1 text-md font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400">
                            Register
                        </a>
                    </DialogTrigger>
                    <DialogContent className="max-w-[555px] h-[370px]">
                            <DialogHeader>
                                <DialogTitle className="text-4xl flex items-center justify-center mt-8">Register</DialogTitle>
                            </DialogHeader>
                            <RegisterPage />
                        <DialogFooter>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Dialog>
                    <DialogTrigger asChild>
                        <a className="cursor-pointer mt-3 justify-center flex items-center gap-x-1 text-md font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400">
                            Log In
                        </a>
                    </DialogTrigger>
                    <DialogContent className="max-w-[555px] h-[370px]">
                            <DialogHeader>
                                <DialogTitle className="text-4xl flex items-center justify-center mt-8">Log In</DialogTitle>
                            </DialogHeader>
                                <LoginPage />
                    </DialogContent>
                </Dialog>
                </div>  
            </div>                
            )} 
        </div>
    )
}