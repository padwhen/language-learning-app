import React, { useState, useEffect } from 'react';
import { X, Play, User } from 'lucide-react';

interface WelcomeTourModalProps {
  onStartTour: () => void;
}

const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({ onStartTour }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('hasSeenLanguageLearningTour');
    
    if (!hasSeenTour) {
      // Delay showing the modal by 1.5 seconds for a smooth experience
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleStartTour = () => {
    setIsVisible(false);
    onStartTour();
    // Don't set hasSeenTour here - let the tour completion handle it
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenLanguageLearningTour', 'skipped');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-40 animate-in fade-in duration-300" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl relative">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center">
              Welcome to Your Language Journey! 🎉
            </h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 text-lg leading-relaxed text-center mb-6">
              Looks like this is your first time here! Would you like a quick tour to discover all the powerful features that will help you master new languages?
            </p>
            
            <div className="text-center text-sm text-gray-500 mb-6">
              ✨ Takes just 2 minutes • Discover translation magic • Learn about vocabulary building
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartTour}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Tour
              </button>
              
              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                No Thanks, I'll Explore
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeTourModal; 