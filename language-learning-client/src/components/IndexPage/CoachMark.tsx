import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface CoachMarkProps {
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

const CoachMark: React.FC<CoachMarkProps> = ({ step, totalSteps, onNext, onPrev, onSkip, onFinish }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      title: "Welcome to Your Language Learning Journey! 🎉",
      content: "Let's take a quick tour to help you master this powerful translation and vocabulary building tool. This tour will show you all the key features in just a few minutes!",
      position: "center",
      highlight: null
    },
    {
      title: "Language Selection Hub",
      content: "Start here! Click the left dropdown to choose your source language (Finnish, Korean, Chinese, Vietnamese, Greek). The arrow shows translation direction - always ending in English for now.",
      position: "bottom-center",
      highlight: "translation-bar"
    },
    {
      title: "Smart Text Input Area",
      content: "Enter any sentence or phrase here. Pro tip: Complete sentences give better context and more accurate translations. Use the Speak button to hear pronunciation!",
      position: "top-center",
      highlight: "input-bar"
    },
    {
      title: "Beautiful Translation Display",
      content: "Your translated text appears here in an elegant, easy-to-read format. Perfect for quick reference, studying, or sharing with others!",
      position: "top-center",
      highlight: "translation"
    },
    {
      title: "Interactive Word Analysis",
      content: "This is where the magic happens! Every word gets categorized (verbs, nouns, adjectives, etc.). Click any word to see pronunciation, detailed explanations, and save it to your vocabulary deck!",
      position: "top-center",
      highlight: "word-details"
    },
    {
      title: "Your Personal Profile Center",
      content: "Register or log in here to unlock the full power of the app. Save your vocabulary, track progress, create custom decks, and sync across devices. Your learning journey starts here!",
      position: "left",
      highlight: "user-section"
    },
    {
      title: "Vocabulary Deck Management",
      content: "Your flashcard decks live here! See progress percentages, card counts, creation dates, and quick access to detailed views. Perfect for tracking your learning journey across different languages.",
      position: "left",
      highlight: "deck-info"
    },
    {
      title: "You're Ready to Master Languages! 🚀",
      content: "That's the complete tour! Start by selecting a language and typing your first sentence. Every word you translate can become part of your personal vocabulary collection. Ready to become fluent?",
      position: "center",
      highlight: null
    }
  ];

  const currentStep = steps[step];

  const getInitialPosition = () => {
    switch (currentStep.position) {
      case 'center':
        return { x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 200 };
      case 'bottom-center':
        return { x: window.innerWidth / 2 - 250, y: window.innerHeight / 3 };
      case 'top-center':
        return { x: window.innerWidth / 2 - 250, y: window.innerHeight - window.innerHeight / 4 - 200 };
      case 'left':
        return { x: 32, y: window.innerHeight / 2 - 150 };
      case 'right':
        return { x: window.innerWidth - 400 - 32, y: window.innerHeight / 2 - 150 };
      default:
        return { x: window.innerWidth - 400 - 32, y: 32 };
    }
  };

  useEffect(() => {
    setPosition(getInitialPosition());
  }, [step]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Ensure the dialog stays within viewport bounds
      const dialogWidth = 500;
      const dialogHeight = 400;
      const maxX = window.innerWidth - dialogWidth;
      const maxY = window.innerHeight - dialogHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position]);

  return (
    <>
      {/* Smart Overlay - doesn't cover highlighted elements */}
      <div className="fixed inset-0 z-40">
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
      
      {/* Coach Mark with Drag Functionality */}
      <div
        ref={dialogRef}
        className="fixed z-50 w-[500px] animate-in fade-in slide-in-from-top-4 duration-500"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-500 relative overflow-hidden">
          {/* Draggable Header */}
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center justify-between">
              <div className="text-white font-semibold">
                Language Learning Tour
              </div>
              <button
                onClick={onSkip}
                className="text-white hover:text-gray-200 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
            
            <div className="mt-2 text-white text-sm opacity-90">
              Step {step + 1} of {totalSteps}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {currentStep.title}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-base">
              {currentStep.content}
            </p>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 font-medium transition-colors px-3 py-2"
              >
                Skip Tour
              </button>
              
              <div className="flex space-x-3">
                {step > 0 && (
                  <button
                    onClick={onPrev}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border rounded-lg hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </button>
                )}
                
                {step < totalSteps - 1 ? (
                  <button
                    onClick={onNext}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={onFinish}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                  >
                    Start Learning!
                    <Play className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachMark;
