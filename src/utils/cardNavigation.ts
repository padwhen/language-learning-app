export const moveLeft = (currentCardIndex: number, setCurrentCardIndex: (index: number) => void) => {
    if (currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1)
    }
}

export const moveRight = (currentCardIndex: number, cardsLength: number, setCurrentCardIndex: (index: number) => void) => {
    if (currentCardIndex < cardsLength - 1) {
        setCurrentCardIndex(currentCardIndex + 1)
    }
}