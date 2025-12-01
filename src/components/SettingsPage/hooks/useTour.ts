import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useTour = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const totalSteps = 4;
  const isTourActive = new URLSearchParams(location.search).get('tour') === 'true';

  useEffect(() => {
    if (isTourActive) {
      const stepHighlights = [
        'profile-picture', 'user-stats', 'achievements', 'personal-info'
      ];
      setHighlightedElement(stepHighlights[currentStep]);
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isTourActive]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('tour');
    navigate(newUrl.pathname);
    setCurrentStep(0);
    setHighlightedElement(null);
  };

  const handleFinish = () => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('tour');
    navigate(newUrl.pathname);
    setCurrentStep(0);
    setHighlightedElement(null);
  };

  const getTourMessage = () => {
    switch (currentStep) {
      case 0:
        return "Welcome to your Settings page! Let's explore the key features.";
      case 1:
        return "Here you can view your experience points and learning streak.";
      case 2:
        return "Check out your recent achievements and milestones.";
      case 3:
        return "Update your personal information and account details.";
      default:
        return "";
    }
  };

  return {
    currentStep,
    totalSteps,
    isTourActive,
    highlightedElement,
    handleNext,
    handlePrev,
    handleSkip,
    handleFinish,
    getTourMessage
  };
}; 