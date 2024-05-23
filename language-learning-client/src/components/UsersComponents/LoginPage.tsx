import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent, useState } from "react";
import axios, { AxiosError } from "axios";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { RegisterPage } from "./RegisterPage";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FaExclamationTriangle } from "react-icons/fa";

export function LoginPage() {
    const [formData, setFormData] = useState({ username: '', pin: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [errors, setErrors] = useState({ username: '', pin: '' });

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' }); 
    };

    const handlePinChange = (value: string) => {
        setFormData({ ...formData, pin: value })
        setErrors({ ...errors, pin: '' })
    }

    const handleLogin = async () => {
        if (!formData.username || !formData.pin) {
            setErrors({
                username: !formData.username ? 'Username is required' : '',
                pin: !formData.pin ? 'PIN is required' : ''
            });
            return;
        }

        try {
            await axios.post('/login', formData);
            setFormData({ username: '', pin: '' });
            alert('Login successful');
            window.location.reload();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<any>
                if (axiosError.response) {
                    setErrorMessage(axiosError.response?.data)
                } 
            } else {
                console.error('Error logging in: ', error)
                setErrorMessage('Error logging in. Please try again later');
            }
        }
    };

    return (
        <div className="grid justify-center">
            <div className="grid grid-cols-4 items-center gap-4 w-full max-w-xs mt-2">
                <Label htmlFor="username" className="text-right text-lg w-4">Username</Label>
                <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`col-span-3 text-md ml-4 h-[40px] max-w-[220px] ${errors.username && 'border-red-500'}`}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 w-full max-w-xs">
                <Label htmlFor="password" className="text-right text-lg w-4">PIN</Label>
                <div className="mt-2 col-span-3 ml-4">
                    <InputOTP
                        maxLength={4}
                        type="password"
                        onChange={handlePinChange}
                        value={formData.pin}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className={`w-[55px] ${errors.pin && 'border-red-500'}`} />
                            <InputOTPSlot index={1} className={`w-[55px] ${errors.pin && 'border-red-500'}`} />
                            <InputOTPSlot index={2} className={`w-[55px] ${errors.pin && 'border-red-500'}`} />
                            <InputOTPSlot index={3} className={`w-[55px] ${errors.pin && 'border-red-500'}`} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
            </div>
            {(errors.username || errors.pin || errorMessage) && (
                <Alert variant="destructive" className="mt-5">
                    <FaExclamationTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {errorMessage && <p>{errorMessage}</p>}
                        {errors.username && <p>{errors.username}</p>}
                        {errors.pin && <p>{errors.pin}</p>}
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex justify-end mt-2">
                <Button type="submit" onClick={handleLogin}>Login</Button>
            </div>
            <div className="mt-2 flex justify-center italic gap-1">
                <div className="mt-[3px]">Don't have an account yet? </div>
                <Dialog>
                    <DialogTrigger>
                        <h1 className="mb-[21px] underline cursor-pointer hover:text-blue-400 mt-[3px]">Register here</h1>
                    </DialogTrigger>
                    <DialogContent className="max-w-[555px] max-h-[570px] overflow-y-auto">
                        <DialogTitle className="text-4xl flex items-center justify-center mt-8">Register</DialogTitle>
                        <RegisterPage />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
