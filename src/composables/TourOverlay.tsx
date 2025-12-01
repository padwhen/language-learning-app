import { Button } from "@/components/ui/button";
import { TourStep } from "@/state/hooks/useTour";
import React from "react";

interface TourOverlayProps {
    steps: TourStep[]
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    onFinish: () => void;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({
    steps,
    currentStep, 
    totalSteps,
    onNext,
    onPrev,
    onSkip,
    onFinish
}) => {
    const currentStepData = steps[currentStep]

    if (!currentStepData) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
                    <p className="text-sm text-gray-600">{currentStepData.description}</p>
                </div>
                <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={onSkip}>
                        Skip
                    </Button>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <Button variant="outline" onClick={onPrev}>
                                Previous
                            </Button>
                        )}
                        {currentStep < totalSteps - 1 ? (
                            <Button onClick={onNext}>
                                Next
                            </Button>
                        ) : (
                            <Button onClick={onFinish}>
                                Finish
                            </Button>
                        )}
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <span className="text-sm text-gray-500">
                        Step {currentStep + 1} of {totalSteps}
                    </span>
                </div>
            </div>
        </div>
    )
}