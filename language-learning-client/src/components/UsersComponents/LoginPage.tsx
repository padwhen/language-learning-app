import { InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangeEvent } from "react";
import { FormData } from "@/types";

interface Props {
    formData: FormData
    setFormData: (formData: FormData) => void;
    handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function LoginPage({ formData, setFormData, handleChange }: Props) {
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
            </div>
    )}
