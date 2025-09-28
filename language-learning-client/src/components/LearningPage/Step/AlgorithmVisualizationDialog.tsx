import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
    Brain, 
    Play, 
    Pause, 
    RotateCcw,
    MapPin,
    Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface AlgorithmVisualizationDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

type TimelinePosition = 'learn' | 'review1' | 'review2' | 'review3' | 'review4' | 'review5' | 'mastered';
type PlaybackMode = 'automatic' | 'interactive';

interface TimelineStep {
    id: TimelinePosition;
    label: string;
    days: number;
    description: string;
    color: string;
    sessionType: string;
    exampleText: string;
}

const timelineSteps: TimelineStep[] = [
    { 
        id: 'learn', 
        label: 'Learn', 
        days: 0, 
        description: 'First time seeing the word', 
        color: 'bg-blue-500',
        sessionType: 'Learning Session',
        exampleText: 'You learn 8 new words today'
    },
    { 
        id: 'review1', 
        label: '1 Day', 
        days: 1, 
        description: 'Quick review tomorrow', 
        color: 'bg-green-500',
        sessionType: 'Review Session',
        exampleText: 'Review those 8 words tomorrow (1-2 minutes)'
    },
    { 
        id: 'review2', 
        label: '3 Days', 
        days: 3, 
        description: 'Short-term reinforcement', 
        color: 'bg-yellow-500',
        sessionType: 'Review Session',
        exampleText: 'Review again in 3 days (1-2 minutes)'
    },
    { 
        id: 'review3', 
        label: '1 Week', 
        days: 7, 
        description: 'Weekly check-in', 
        color: 'bg-orange-500',
        sessionType: 'Review Session',
        exampleText: 'Weekly review (1-2 minutes)'
    },
    { 
        id: 'review4', 
        label: '2 Weeks', 
        days: 14, 
        description: 'Bi-weekly reinforcement', 
        color: 'bg-red-500',
        sessionType: 'Review Session',
        exampleText: 'Bi-weekly review (1-2 minutes)'
    },
    { 
        id: 'review5', 
        label: '1 Month', 
        days: 30, 
        description: 'Monthly check-in', 
        color: 'bg-purple-500',
        sessionType: 'Review Session',
        exampleText: 'Monthly review (1-2 minutes)'
    },
    { 
        id: 'mastered', 
        label: 'Mastered', 
        days: 90, 
        description: 'Permanent memory', 
        color: 'bg-emerald-500',
        sessionType: 'Complete',
        exampleText: 'Word is now in your permanent memory!'
    }
];

export const AlgorithmVisualizationDialog: React.FC<AlgorithmVisualizationDialogProps> = ({
    isOpen,
    onClose
}) => {
    const [currentPosition, setCurrentPosition] = useState<TimelinePosition>('learn');
    const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('automatic');
    const [isPlaying, setIsPlaying] = useState(false);
    const [sliderValue, setSliderValue] = useState([0]);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentStep = timelineSteps.find(step => step.id === currentPosition) || timelineSteps[0];
    const currentIndex = timelineSteps.findIndex(step => step.id === currentPosition);

    // Automatic playback simulation
    const startAutomaticPlayback = () => {
        setIsPlaying(true);
        let step = 0;
        intervalRef.current = setInterval(() => {
            if (step < timelineSteps.length - 1) {
                step++;
                setCurrentPosition(timelineSteps[step].id);
                setSliderValue([step]);
            } else {
                setIsPlaying(false);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            }
        }, 2500);
    };

    const stopAutomaticPlayback = () => {
        setIsPlaying(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const resetToStart = () => {
        setCurrentPosition('learn');
        setSliderValue([0]);
        stopAutomaticPlayback();
    };

    const handleSliderChange = (value: number[]) => {
        const newIndex = value[0];
        setSliderValue(value);
        setCurrentPosition(timelineSteps[newIndex].id);
    };

    const getPathVisualization = () => {
        return (
            <div className="flex flex-col items-center space-y-6">
                {/* Timeline Path */}
                <div className="relative w-full max-w-4xl h-24">
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 transform -translate-y-1/2 rounded-full" />
                    {timelineSteps.map((step, index) => (
                        <div key={step.id} className="absolute top-1/2 transform -translate-y-1/2" 
                             style={{ left: `${(index / (timelineSteps.length - 1)) * 100}%` }}>
                            <div className={`w-8 h-8 rounded-full border-4 ${
                                index <= currentIndex ? `${step.color} border-current shadow-lg` : 'bg-white border-gray-300'
                            }`} />
                            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap font-medium">
                                {step.label}
                            </div>
                        </div>
                    ))}
                    <motion.div
                        className="absolute top-1/2 w-10 h-10 bg-blue-500 rounded-full transform -translate-y-1/2 shadow-xl border-4 border-white"
                        animate={{
                            left: `${(currentIndex / (timelineSteps.length - 1)) * 100}%`
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                        <MapPin className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </motion.div>
                </div>

                {/* Current Step Details */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${currentStep.color}`} />
                        <span className="text-lg font-semibold text-gray-900">{currentStep.sessionType}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{currentStep.description}</p>
                    <p className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                        {currentStep.exampleText}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Brain className="w-6 h-6 text-purple-600" />
                        How Spaced Repetition Works
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8">
                    {/* Mode Selection */}
                    <div className="flex justify-center space-x-4">
                        <Button
                            variant={playbackMode === 'automatic' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPlaybackMode('automatic')}
                            className="flex items-center gap-2"
                        >
                            <Play className="w-4 h-4" />
                            Watch Demo
                        </Button>
                        <Button
                            variant={playbackMode === 'interactive' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPlaybackMode('interactive')}
                            className="flex items-center gap-2"
                        >
                            <Clock className="w-4 h-4" />
                            Explore
                        </Button>
                    </div>

                    {/* Main Visualization */}
                    <div className="bg-gray-50 p-8 rounded-xl">
                        {getPathVisualization()}
                    </div>

                    {/* Interactive Controls */}
                    {playbackMode === 'automatic' ? (
                        <div className="flex justify-center space-x-4">
                            <Button
                                onClick={isPlaying ? stopAutomaticPlayback : startAutomaticPlayback}
                                className="flex items-center gap-2"
                            >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {isPlaying ? 'Pause' : 'Start'} Demo
                            </Button>
                            <Button variant="outline" onClick={resetToStart}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Learning Progress</span>
                                <Badge className="bg-blue-100 text-blue-800">
                                    {currentStep.label}
                                </Badge>
                            </div>
                            <Slider
                                value={sliderValue}
                                onValueChange={handleSliderChange}
                                max={timelineSteps.length - 1}
                                step={1}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Learn</span>
                                <span>Mastered</span>
                            </div>
                        </div>
                    )}

                    {/* Current Status */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-center">
                            <h4 className="font-semibold text-blue-900 mb-2">Current Status</h4>
                            <p className="text-sm text-blue-800">{currentStep.description}</p>
                        </div>
                    </div>

                    {/* Detailed Explanation */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">How Spaced Repetition Works</h4>
                        <div className="space-y-3 text-sm text-gray-700">
                            <p>
                                <strong>Learning Session:</strong> You learn new words today (e.g., 8 words in 10-15 minutes)
                            </p>
                            <p>
                                <strong>Review Sessions:</strong> Each word gets reviewed at specific intervals:
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Tomorrow: Quick 1-2 minute review</li>
                                <li>3 days later: Another quick review</li>
                                <li>1 week later: Weekly check-in</li>
                                <li>2 weeks later: Bi-weekly reinforcement</li>
                                <li>1 month later: Monthly review</li>
                            </ul>
                            <p>
                                <strong>Result:</strong> After ~5 successful reviews, the word moves to your permanent memory!
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end">
                        <Button onClick={onClose} size="lg">
                            Got it!
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
