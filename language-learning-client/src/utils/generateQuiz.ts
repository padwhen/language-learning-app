import { Card, QuizItem } from "@/types";

export const generateQuiz = (cards: Card[]): QuizItem[] => {
    // First generate all possible questions
    const allQuestions = cards.map((card, index) => {
        // Filter out cards with the same userLangCard or engCard
        const availableCards = cards.filter((c, i) => 
            i !== index &&
            c.engCard !== card.engCard && 
            c.userLangCard !== card.userLangCard
        )

        // Create 4 options, but some might be empty
        const numberOfUniqueOptions = Math.min(3, availableCards.length)

        // Shuffle available cards
        const shuffledCards = [...availableCards].sort(() => Math.random() - 0.5)
        
        // Take the required number of wrong options
        const wrongOptions = shuffledCards.slice(0, numberOfUniqueOptions)

        // Create all options array with correct answer and empty strings if nedeed
        const allOptions = [...wrongOptions, card]
        while (allOptions.length < 4) {
            allOptions.push({
                engCard: "",
                _id: "",
                userLangCard: "",
                cardScore: 0
            })
        }

        // Shuffle final options array
        const shuffleOptions = allOptions.sort(() => Math.random() - 0.5)
        
        // Get the correct answer's position
        const correctIndex = shuffleOptions.findIndex(c => c.engCard === card.engCard)

        return {
            userLangCard: card.userLangCard, 
            options: shuffleOptions.map(c => c.engCard),
            correctAnswer: card.engCard,
            correctIndex, 
            cardId: card._id,
            cardScore: card.cardScore
        }
    })

    // Prevent adjacent duplicates by shuffling while checking for adjacency
    const shuffleWithoutAdjacent = (questions: QuizItem[]): QuizItem[] => {
        let attempts = 0
        const maxAttempts = 100

        while (attempts < maxAttempts) {
            const shuffled = [...questions].sort(() => Math.random() - 0.5)
            const hasAdjacentDuplicates = shuffled.some((q, i) => {
                i > 0 && (q.userLangCard === shuffled[i - 1].userLangCard ||
                    q.correctAnswer === shuffled[i - 1].correctAnswer
                )
            })
            if (!hasAdjacentDuplicates) {
                return shuffled
            }
            attempts++
        }
        console.warn('Could not prevent all adjacent duplicates after maximum attempts')
        return [...questions].sort(() => Math.random() - 0.5)
    }

    return shuffleWithoutAdjacent(allQuestions)
}