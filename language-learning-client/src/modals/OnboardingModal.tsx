import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Button } from "../components/ui/button";

type Step = {
    title: string;
    description: string;
    gifUrl: string;
}

type PageConfig = {
    pageName: string;
    steps: Step[]
}

interface OnboardingModalProps {
    config: PageConfig
}

export const OnboardingModal = ({ config }: OnboardingModalProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const { pageName, steps } = config

    useEffect(() => {
        const hasSeenModal = localStorage.getItem(`hasSeenOnboarding_${pageName}`)
        if (!hasSeenModal) setIsOpen(true)
    }, [pageName])

    const handleClose = () => {
        localStorage.setItem(`hasSeenOnboarding_${pageName}`, 'true')
        setIsOpen(false)
    }

    const isMultiStep = steps.length > 1

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                if (!open) handleClose()
                else setIsOpen(true)
            }}
        >
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {steps[currentStep].title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-6">
                    <img 
                        src={steps[currentStep].gifUrl} 
                        alt={steps[currentStep].title}
                        className="rounded-lg shadow-lg w-full max-w-md"
                    />
                    <p className="text-center text-lg">
                        {steps[currentStep].description}
                    </p>
                </div>

                <DialogFooter className="flex justify-between gap-2">
                    {isMultiStep && currentStep > 0 && (
                        <Button 
                            variant="outline"
                            onClick={() => setCurrentStep(prev => prev - 1)}
                        >
                            Previous
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            if (currentStep === steps.length - 1) handleClose()
                                else setCurrentStep(prev => prev + 1)
                        }}
                    >
                        {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}