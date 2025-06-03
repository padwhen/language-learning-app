import { Button } from "../ui/button"
import { Alert, AlertTitle, AlertDescription } from "../ui/alert"
import { LearningStep } from "./LearningPage";

interface NoCardNotificationsProps {
    setCurrentStep: (step: LearningStep) => void;
}

export const NoCardNotifications: React.FC<NoCardNotificationsProps> = ({ setCurrentStep }) => {
    return (
        <div className="flex justify-center items-center min-h-screen p-4">
                <Alert className="w-full max-w-2xl">
                    <AlertTitle className="text-xl font-bold">No Cards Available</AlertTitle>
                    <AlertDescription className="text-lg">
                        All cards in this deck are currently being learned or have been completed. 
                        Check back later or adjust your quiz options to include more cards.
                    </AlertDescription>
                    <Button 
                        className="mt-4"
                        onClick={() => setCurrentStep('settings')}
                    >
                        Adjust Settings
                    </Button>
                </Alert>
        </div>
    )
}