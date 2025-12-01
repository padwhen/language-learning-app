import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface TourStep { 
    title: string;
    description: string;
}

interface TourConfig {
    totalSteps: number;
    stepHighlights: (string | null)[]
    steps: TourStep[]
}

export const useTour = (config: TourConfig) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)
    const [highlightedElement, setHighlightedElement] = useState<string | null>(null)

    const { totalSteps, stepHighlights, steps } = config;
    const isTourActive = new URLSearchParams(location.search).get('tour') === 'true'

    useEffect(() => {
        if (isTourActive) {
            setHighlightedElement(stepHighlights[currentStep] || null)
        } else {
            setHighlightedElement(null)
        }
    }, [currentStep, isTourActive, stepHighlights])

    const removeTourFromUrl = (): string => {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('tour')
        return newUrl.pathname
    }

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSkip = () => {
        navigate(removeTourFromUrl())
        setCurrentStep(0)
        setHighlightedElement(null)
    }

    const handleFinish = () => {
        navigate(removeTourFromUrl())
        setCurrentStep(0)
        setHighlightedElement(null)
    }

    const startTour = () => {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('tour', 'true')
        navigate(newUrl.pathname + newUrl.search)
    }

    return {
        currentStep,
        highlightedElement,
        totalSteps,
        isTourActive,
        steps,
        handleNext,
        handlePrev,
        handleSkip,
        handleFinish,
        startTour
    };
}