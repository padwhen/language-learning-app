import { useEffect } from "react";

export const useKeyboardNavigation = (
    handleMoveLeft: () => void,
    handleMoveRight: () => void,
    currentCardIndex: number,
    totalCards: number
) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                handleMoveLeft()
            } else if (event.key === "ArrowRight") {
                handleMoveRight()
            }
        }
        window.addEventListener("keydown",handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [handleMoveLeft, handleMoveRight, currentCardIndex, totalCards])
}