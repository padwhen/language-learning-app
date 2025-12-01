import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface CoachMarkProps {
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
  title: string;
  content: string;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const CoachMark: React.FC<CoachMarkProps> = ({ 
  step, 
  totalSteps, 
  onNext, 
  onPrev, 
  onSkip, 
  onFinish,
  title,
  content,
  position = 'center'
}) => {
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const getInitialPosition = () => {
    switch (position) {
      case 'center':
        return { x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 200 };
      case 'top':
        return { x: window.innerWidth / 2 - 250, y: 50 };
      case 'bottom':
        return { x: window.innerWidth / 2 - 250, y: window.innerHeight - 350 };
      case 'left':
        return { x: 50, y: window.innerHeight / 2 - 150 };
      case 'right':
        return { x: window.innerWidth - 550, y: window.innerHeight / 2 - 150 };
      default:
        return { x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 200 };
    }
  };

  useEffect(() => {
    setCurrentPosition(getInitialPosition());
  }, [step, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y
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
      
      setCurrentPosition({
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
  }, [isDragging, dragStart, currentPosition]);

  return (
    <>
      {/* Smart Overlay */}
      <div className="fixed inset-0 z-40">
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>
      
      {/* Coach Mark with Drag Functionality */}
      <div
        ref={dialogRef}
        className="fixed z-50 w-[500px] animate-in fade-in slide-in-from-top-4 duration-500"
        style={{
          left: `${currentPosition.x}px`,
          top: `${currentPosition.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-500 relative overflow-hidden">
          {/* Draggable Header with Gradient */}
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center justify-between">
              <div className="text-white font-semibold text-lg flex items-center gap-2">
                📚 Deck Details Tour
              </div>
              <button
                onClick={onSkip}
                className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2.5">
              <div 
                className="bg-white rounded-full h-2.5 transition-all duration-500 shadow-sm"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
            
            <div className="mt-2 text-white text-sm opacity-90 font-medium">
              Step {step + 1} of {totalSteps}
            </div>
          </div>

          {/* Content with Enhanced Styling */}
          <div className="p-6 bg-gradient-to-br from-white to-blue-50">
            <h3 className="text-xl font-bold text-gray-800 mb-4 leading-tight">
              {title}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-base">
              {content}
            </p>

            {/* Enhanced Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 font-medium transition-all duration-200 px-3 py-2 hover:bg-gray-100 rounded-lg"
              >
                Skip Tour
              </button>
              
              <div className="flex space-x-3">
                {step > 0 && (
                  <button
                    onClick={onPrev}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 font-medium"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </button>
                )}
                
                {step < totalSteps - 1 ? (
                  <button
                    onClick={onNext}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={onFinish}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                  >
                    Finish Tour!
                    <Play className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Decorative Bottom Border */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
        </div>
      </div>
    </>
  );
};

export default CoachMark; 