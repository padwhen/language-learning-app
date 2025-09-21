import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, CheckCircle, Clock } from 'lucide-react';

interface LearningModeLoadingModalProps {
    isOpen: boolean;
    currentStep: number;
    totalSteps: number;
}

const steps = [
    {
        title: "Translating sentence",
        description: "Converting your text to English...",
        funFact: "Did you know Finnish has 15 grammatical cases?"
    },
    {
        title: "Analyzing grammar patterns",
        description: "Identifying word forms and structures...",
        funFact: "Finnish words can have over 2,000 different forms!"
    },
    {
        title: "Validating and finalizing",
        description: "Ensuring accuracy and consistency...",
        funFact: "Finnish is related to Estonian and Hungarian!"
    }
];

export const LearningModeLoadingModal: React.FC<LearningModeLoadingModalProps> = ({
    isOpen,
    currentStep,
    totalSteps
}) => {
    const [progress, setProgress] = useState(0);
    const [currentFunFact, setCurrentFunFact] = useState(0);

    // Animate progress bar
    useEffect(() => {
        if (isOpen) {
            const targetProgress = ((currentStep + 1) / totalSteps) * 100;
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= targetProgress) {
                        clearInterval(interval);
                        return targetProgress;
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [currentStep, totalSteps, isOpen]);

    // Rotate fun facts
    useEffect(() => {
        if (isOpen) {
            const interval = setInterval(() => {
                setCurrentFunFact(prev => (prev + 1) % steps.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen}>
            <DialogContent className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border-0 p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                        <h2 className="text-xl font-semibold">Preparing Learning Mode</h2>
                    </div>
                    <p className="text-violet-100 text-sm">
                        We're creating your annotated translation with detailed grammar insights
                    </p>
                </div>

                {/* Progress Section */}
                <div className="p-6">
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Step {currentStep + 1} of {totalSteps}
                            </span>
                            <span className="text-sm text-gray-500">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Current Step */}
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div 
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                                    index === currentStep 
                                        ? 'bg-violet-50 border border-violet-200' 
                                        : index < currentStep 
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {index < currentStep ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : index === currentStep ? (
                                        <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-medium text-sm ${
                                        index === currentStep 
                                            ? 'text-violet-700' 
                                            : index < currentStep 
                                                ? 'text-green-700'
                                                : 'text-gray-500'
                                    }`}>
                                        {step.title}
                                    </h3>
                                    <p className={`text-xs mt-1 ${
                                        index === currentStep 
                                            ? 'text-violet-600' 
                                            : index < currentStep 
                                                ? 'text-green-600'
                                                : 'text-gray-400'
                                    }`}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Fun Fact */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">💡</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-800 text-sm mb-1">
                                    Fun Fact
                                </h4>
                                <p className="text-blue-700 text-sm leading-relaxed">
                                    {steps[currentFunFact]?.funFact}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Estimated Time */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            This usually takes 2-3 minutes. Thanks for your patience! 🙏
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
