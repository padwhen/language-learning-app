import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent, useState } from "react";
import { FormData } from "@/types";
import axios from "axios";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { LoginPage } from "./LoginPage";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FaExclamationTriangle } from "react-icons/fa";


export function RegisterPage() {
    const [formData, setFormData] = useState<FormData>({ name: '', username: '', pin: '' });
    const [errorMessage, setErrorMessage] = useState('')
    const [errors, setErrors] = useState<{[key: string]: string}>({
        name: '', username: '', pin: ''
    })

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
        setErrors({...errors, [name]: value ? '' : `${name} is required`})
    };

    const handlePinChange = (value: string) => {
        setFormData({ ...formData, pin: value })
        setErrors({ ...errors, pin: '' })
    }

    const handleRegister = async () => {
        let hasError = false;
        const newErrors = { ... errors }
        if (!formData.name) {
            newErrors.name = 'Full name is required';
            hasError = true;
        }
        if (!formData.username) {
            newErrors.username = 'Username is required';
            hasError = true;
        }
        if (!formData.pin) {
            newErrors.pin = 'PIN is required'
            hasError = true;
        } else {
            newErrors.pin = ''
        }
        if (hasError) {
            setErrors(newErrors)
            return;
        }
        try {
            await axios.post('/register', formData)
            alert('Registeration successful. Now you can login!');
            setFormData({ name: '', username: '', pin: ''})
            setErrorMessage('')
            setErrors({ name: '', username: '', pin: ''})
            window.location.reload()
        } catch (error) {
            console.error('Error registerating: ', error)
            setErrorMessage('Error registerating. Please try again later');
        }
    };

    return (
        <div className="grid justify-center">
            <div className="grid grid-cols-4 items-center gap-4 w-full max-w-xs">
                <Label htmlFor="name" className="text-right text-lg w-4">Fullname</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} className={`col-span-3 text-md ml-4 h-[40px] max-w-[220px] ${errors.name && 'border-red-500'}`} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 w-full max-w-xs mt-2">
                <Label htmlFor="username" className="text-right text-lg w-4">Username</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleChange} className={`col-span-3 text-md ml-4 h-[40px] max-w-[220px] ${errors.username && 'border-red-500'}`} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 w-full max-w-xs">
                <Label htmlFor="password" className="text-right text-lg w-4">PIN</Label>
                <div className="mt-2 col-span-3 ml-4">
                    <InputOTP maxLength={4} type="password" onChange={handlePinChange} value={formData.pin}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className={`w-[55px] ${errors.pin && 'border-red-500'}`} />
                            <InputOTPSlot index={1} className={`w-[55px] ${errors.pin && 'border-red-500'}`} />
                            <InputOTPSlot index={2} className={`w-[55px] ${errors.pin && 'border-red-500'}`} />
                            <InputOTPSlot index={3} className={`w-[55px] ${errors.pin && 'border-red-500'}`} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
            </div>
            {errors && Object.values(errors).some(error => error) || errorMessage ? (
                <Alert variant="destructive" className="mt-5">
                    <FaExclamationTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {errorMessage && (
                            <p>{errorMessage}</p>
                        )}
                        {Object.keys(errors).map(key => (
                            errors[key] && <p key={key}>{errors[key]}</p>
                        ))}
                    </AlertDescription>
                </Alert>
            ) : null}
            <div className="flex justify-end mt-2">
                <Button type="submit" onClick={handleRegister}>Register</Button>
            </div>
            <div className="mt-2 flex justify-center italic gap-1">
                <div className="mt-[3px]">Already have a user?</div>
                <Dialog>
                    <DialogTrigger>
                        <h1 className="mt-[2px] underline cursor-pointer hover:text-blue-400">
                            Login here
                        </h1>                        
                    </DialogTrigger>
                    <DialogContent className="max-w-[555px] h-[370px]">
                        <DialogTitle className="text-4xl flex items-center justify-center mt-8">Log In</DialogTitle>
                        <LoginPage />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
