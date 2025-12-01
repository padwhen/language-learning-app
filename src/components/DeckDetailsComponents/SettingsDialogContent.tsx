import { useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface SettingsDialogContentProps {
    onResetProgress: () => void;
    onToggleHandwritingRecognition: (enabled: boolean) => void;
    isHandwritingRecognitionEnabled: boolean;
}

export const SettingsDialogContentProps: React.FC<SettingsDialogContentProps> = ({
    onResetProgress, onToggleHandwritingRecognition, isHandwritingRecognitionEnabled
}) => {

    const [showResetConfirmation, setShowResetConfirmation] = useState(false)

    const handleResetProgress = () => {
        setShowResetConfirmation(false)
        onResetProgress()
        setTimeout(() => {
            window.location.reload()
        }, 3000)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="handwriting-recognition" className="text-sm font-medium">
                    Handwriting Recognition
                </Label>
                <Switch 
                    id="handwriting-recognition" 
                    checked={isHandwritingRecognitionEnabled}
                    onCheckedChange={onToggleHandwritingRecognition}
                />
            </div>
            <AlertDialog open={showResetConfirmation} onOpenChange={setShowResetConfirmation}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                        Reset Progress
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your progress data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetProgress}>
                            Yes, reset my progress
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}