import { generateQuiz } from "@/utils/generateQuiz";
import { describe, it, expect } from "vitest";
import { Card, QuizItem } from "@/types";

const cards: Card[] = [
    { engCard: 'answer1', userLangCard: 'test1', cardScore: 0, _id: '1' },
    { engCard: 'answer2', userLangCard: 'test2', cardScore: 0, _id: '2' },
    { engCard: 'answer3', userLangCard: 'test3', cardScore: 0, _id: '3' },
    { engCard: 'answer4', userLangCard: 'test4', cardScore: 0, _id: '4' }
]

describe('generateQuiz function', () => {
    it('should generate a quiz with correct structure', () => {
        const quiz: QuizItem[] = generateQuiz(cards)
        expect(quiz.length).toBe(cards.length)
        quiz.forEach((item, index) => {
            expect(item).toHaveProperty('text', cards[index].userLangCard)
            expect(item).toHaveProperty('options')
            expect(item).toHaveProperty('answer', cards[index].engCard)
            expect(item.options.length).toBe(4)
            expect(item.options).toContain(cards[index].engCard)
        })
    })
    it('should shuffle options correctly', () => {
        const quiz: QuizItem[] = generateQuiz(cards)
        quiz.forEach(item => {
            const correctAnswer = item.answer
            const options = item.options
            expect(options).toContain(correctAnswer)
            expect(options).not.toContain(cards.map(card => card.engCard))
        })
    })
})