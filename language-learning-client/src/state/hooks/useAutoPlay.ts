import { useEffect } from "react";

export const useAutoPlay = (
    autoPlay: boolean, 
    isFlipped: boolean, 
    currentCardIndex: number, 
    cardsLength: number, 
    setIsFlipped: (flipped: boolean) => void, 
    setCurrentCardIndex: (index: number | ((prevIndex: number) => number)) => void, 
    setAutoPlay: (play: boolean) => void
) => {
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (autoPlay) {
          interval = setInterval(() => {
            if (currentCardIndex < cardsLength - 1) {
              if (!isFlipped) {
                setIsFlipped(true);
              } else {
                setIsFlipped(false);
                setCurrentCardIndex((prevIndex: number) => prevIndex + 1);
              }
            } else if (currentCardIndex === cardsLength - 1) {
              if (!isFlipped) {
                setIsFlipped(true);
              } else {
                setAutoPlay(false);
              }
            }
          }, 2000);
        }
        return () => { if (interval) clearInterval(interval); };
      }, [autoPlay, currentCardIndex, cardsLength, isFlipped, setIsFlipped, setCurrentCardIndex, setAutoPlay]);
}
