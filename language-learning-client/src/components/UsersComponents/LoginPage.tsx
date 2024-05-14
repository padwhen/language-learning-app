import { InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangeEvent, useState } from "react";
import { FormData } from "@/types";
import { Button } from "../ui/button";
import axios from "axios";
import { RegisterPage } from "./RegisterPage";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";

export function LoginPage() {
    const [formData, setFormData] = useState<FormData>({ name: '', username: '', pin: ''})
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleLogin = async () => {
        if (!formData.username || !formData.pin) {
            console.error('Please fill out all required fields')
            return;
        }
        try {
            await axios.post('/login', formData)
            setFormData({ name: '', username: '', pin: '' });
            alert('Login succesful')
            window.location.reload()
        } catch (exception) {
            console.error(exception)
        }
    }
    return (
        <div className="grid justify-center">
            <div className="grid grid-cols-4 items-center gap-4 w-full max-w-xs mt-2">
                <Label htmlFor="username" className="text-right text-lg w-4">Username</Label>
                <Input id="username" name="username" defaultValue={formData.username} onChange={handleChange} className="col-span-3 text-md ml-4 h-[40px] max-w-[220px]" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 w-full max-w-xs">
                <Label htmlFor="password" className="text-right text-lg w-4">Password</Label>
                <div className="mt-2 col-span-3 ml-4">
                    <InputOTP maxLength={4} type="password" onChange={(value: string) => setFormData({ ...formData, pin: value })} value={formData.pin}>
                        <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-[55px]" />
                        <InputOTPSlot index={1} className="w-[55px]" />
                        <InputOTPSlot index={2} className="w-[55px]" />
                        <InputOTPSlot index={3} className="w-[55px]" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
            </div>
            <div className="flex justify-end mt-2">
                <Button type="submit" onClick={handleLogin}>Login</Button>
            </div>
            <div className="mt-2 flex justify-center italic gap-1">
                <div className="mt-[3px]">Haven't had a user yet? </div>
                <Dialog>
                    <DialogTrigger>
                        <h1 className="mb-[21px] underline cursor-pointer hover:text-blue-400">
                            Register here
                        </h1>                        
                    </DialogTrigger>
                    <DialogContent className="max-w-[555px] h-[370px]">
                        <DialogTitle className="text-4xl flex items-center justify-center mt-8">Register</DialogTitle>
                        <RegisterPage />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )}
