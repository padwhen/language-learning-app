import { Button } from "../../ui/button";

interface TourOverlayProps {
  currentStep: number;
  totalSteps: number;
  getTourMessage: () => string;
  handleNext: () => void;
  handlePrev: () => void;
  handleSkip: () => void;
  handleFinish: () => void;
}

export const TourOverlay = ({
  currentStep,
  totalSteps,
  getTourMessage,
  handleNext,
  handlePrev,
  handleSkip,
  handleFinish
}: TourOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">Settings Tour</h3>
          <p className="text-sm text-gray-600">
            {getTourMessage()}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev}>
                Previous
              </Button>
            )}
            {currentStep < totalSteps - 1 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleFinish}>
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
  );
}; 