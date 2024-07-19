import { Card, Question } from "@/types";

type TestCard = Pick<Card, 'engCard' | 'userLangCard'>

export function generateSynonymMatchingQuestions(flashcards: TestCard[], count: number = 4): Question[] {
    const shuffled = flashcards.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count).map(card => {
        const options = [card.engCard]
        while (options.length < 4) {
            const randomCard = flashcards[Math.floor(Math.random() * flashcards.length)]
            if (!options.includes(randomCard.engCard)) {
                options.push(randomCard.engCard)
            }
        }
        return {
            question: `The word **${card.userLangCard}** has the closet meaning to which word below?`,
            options: options.sort(() => 0.5 - Math.random()),
            correct_answer: card.engCard
        }
    })
}

export function generateWordScrambleQuestions(flashcards: TestCard[], count: number = 4): Question[] {
    const shuffled = flashcards.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count).map(card => {
        const scrambledWord = card.userLangCard
            .split('')
            .sort(() => 0.5 - Math.random())
            .join('')
        return {
            question: `Unscrambled this word ${scrambledWord}`,
            correct_answer: card.userLangCard
        }
    })
}

export function subsetCards(cards: Card[]): TestCard[] {
    return cards.map(({ engCard, userLangCard }) => ({
        engCard,
        userLangCard
    }));
}