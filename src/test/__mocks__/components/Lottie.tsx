import React from 'react';

interface LottieProps {
  height?: number | string;
  width?: number | string;
  isStopped?: boolean;
  isPaused?: boolean;
  eventListeners?: Array<{
    eventName: string;
    callback: () => void;
  }>;
  options?: any;
}

const LottieMock: React.FC<LottieProps> = ({ 
  height, 
  width, 
  isStopped, 
  isPaused, 
  eventListeners 
}) => {
  if (eventListeners && !isStopped && !isPaused) {
    const completeListener = eventListeners.find((listener) => listener.eventName === 'complete')
    if (completeListener) {
      setTimeout(() => completeListener.callback(), 0)
    }
  }
  return <div data-testid="lottie-mock" style={{ width, height }} />
}

export default LottieMock;