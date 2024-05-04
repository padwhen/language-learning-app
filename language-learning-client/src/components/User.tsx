import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RegisterPage } from "./UsersComponents/RegisterPage";
import { Link, Navigate } from "react-router-dom";
import { ChangeEvent, useContext, useState } from "react";
import { FormData } from "@/types";
import axios from "axios";
import { LoginPage } from "./UsersComponents/LoginPage";
import { UserContext } from "@/UserContext";

export const User = () => {
    const [formData, setFormData] = useState<FormData>({name: 'Your name', username: '@yourusername', pin: ''})
    const { user, setUser } = useContext(UserContext);
    
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const clearFormData = () => {
        setFormData({ name: '', username: '', pin: ''})
    }


    const handleRegister = async () => {
        if (!formData.name || !formData.username || !formData.pin) {
            console.error('Please fill out all required fields')
            return;
        }
        try {
            await axios.post('/register', formData)
            alert('Registeration succesful. Now you can login!')
            clearFormData()
            window.location.reload()
        } catch (error) {
            console.error('Error registering: ', error)
        }
    }

    const handleLogin = async () => {
        if (!formData.username || !formData.pin) {
            console.error('Please fill out all required fields')
            return;
        }
        try {
            await axios.post('/login', formData)
            clearFormData()
            alert('Login succesful')
            window.location.reload()
        } catch (exception) {
            console.log(exception)
        }
    }

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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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
                            <RegisterPage formData={formData} setFormData={setFormData} handleChange={handleChange} />
                        <DialogFooter>
                            <Button type="submit" onClick={handleRegister}>Register</Button>
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
                                <LoginPage formData={formData} setFormData={setFormData} handleChange={handleChange} />
                        <DialogFooter>
                            <Button type="submit" onClick={handleLogin}>Log In</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </div>  
            </div>               
            )} 

        </div>
    )
}