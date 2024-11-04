import { generateQuiz } from "@/utils/generateQuiz";
import { describe, it, expect, vi } from "vitest";
import { Card } from "@/types";

const cards: Card[] = [
    { engCard: 'answer1', userLangCard: 'test1', cardScore: 0, _id: '1' },
    { engCard: 'answer2', userLangCard: 'test2', cardScore: 0, _id: '2' },
    { engCard: 'answer3', userLangCard: 'test3', cardScore: 0, _id: '3' },
    { engCard: 'answer4', userLangCard: 'test4', cardScore: 0, _id: '4' },
    { engCard: 'answer5', userLangCard: 'test5', cardScore: 0, _id: '5' }
]

let randomIndex = 0
const mockRandomValues = [0.5, 0.2, 0.8, 0.1, 0.9, 0.3, 0.7, 0.4, 0.6]

describe('generateQuiz function', () => {
    beforeEach(() => {
        randomIndex = 0
        vi.spyOn(Math, 'random').mockImplementation(() => {
            const value = mockRandomValues[randomIndex]
            randomIndex = (randomIndex + 1) % mockRandomValues.length
            return value
        })
        vi.spyOn(console, 'warn').mockImplementation(() => {})
    })
    describe('Basic Quiz Generation', () => {
        it('generates a quiz with correct number of questions', () => {
            const quiz = generateQuiz(cards)
            expect(quiz).toHaveLength(cards.length)
        })
        it('each question contains required properties', () => {
            const quiz = generateQuiz(cards)
            quiz.forEach(question => {
                expect(question).toHaveProperty('userLangCard')
                expect(question).toHaveProperty('options')
                expect(question).toHaveProperty('correctAnswer')
                expect(question).toHaveProperty('correctIndex')
                expect(question).toHaveProperty('cardId')
                expect(question).toHaveProperty('cardScore')
            })
        })
        it('each question has exactly 4 options', () => {
            const quiz = generateQuiz(cards)
            quiz.forEach(question => {
                expect(question.options).toHaveLength(4)
            })
        })
        it('correct answer is always included in options', () => {
            const quiz = generateQuiz(cards)
            quiz.forEach(question => {
                expect(question.options).toContain(question.correctAnswer)
                expect(question.options[question.correctIndex]).toBe(question.correctAnswer)
            })
        })
    })
    describe('Option Generation', () => {
        it('handles cards with fewer than 3 wrong options available', () => {
            const smallDeck: Card[] = cards.slice(0, 2)
            const quiz = generateQuiz(smallDeck)

            quiz.forEach(question => {
                expect(question.options).toHaveLength(4)
                expect(question.options.filter(opt => opt === "")).toHaveLength(2)
            })
        })
        it('uses empty strings for missing options', () => {
            const quiz = generateQuiz([cards[0]])
            const emptyOptions = quiz[0].options.filter(opt => opt === "")
            expect(emptyOptions).toHaveLength(3)
        })
        it('does not include duplicate options in a single question', () => {
            const quiz = generateQuiz(cards)
            quiz.forEach(question => {
                const uniqueOptions = new Set(question.options)
                expect(uniqueOptions.size).toBe(
                    question.options.filter(opt => opt !== "").length
                )
            })
        })
        it('does not use the same card for multiple options', () => {
            const quiz = generateQuiz(cards)
            quiz.forEach(question => {
                const nonEmptyOptions = question.options.filter(opt => opt !== "")
                const uniqueOptions = new Set(nonEmptyOptions)
                expect(uniqueOptions.size).toBe(nonEmptyOptions.length)
            })
        })
    })
    describe('Shuffle Behavior', () => {
        it('shuffles questions differently each time', () => {
            // Reset random mock to ensure consistent test
            randomIndex = 0
            const quiz1 = generateQuiz(cards)
            const quiz2 = generateQuiz(cards)

            // Convert to string for deep comparison
            const quiz1String = JSON.stringify(quiz1.map(q => q.userLangCard))
            const quiz2String = JSON.stringify(quiz2.map(q => q.userLangCard))

            expect(quiz1String).not.toBe(quiz2String)
        })
        it('shuffles options differently for each question', () => {
            const quiz = generateQuiz(cards)
            const optionsPatterns = quiz.map(q => JSON.stringify(q.options))
            const uniquePatterns = new Set(optionsPatterns)

            // Most questions should have different option arrangements
            expect(uniquePatterns.size).toBeGreaterThan(1)
        })
    })
    describe('Adjacent Duplicates Prevention', () => {
        it('attempts to prevent adjacent duplicate questions', () => {
            const quiz = generateQuiz(cards)
            let hasAdjacentDuplicates = false
            for (let i = 1; i < quiz.length; i++) {
                if (
                    quiz[i].userLangCard === quiz[i-1].userLangCard ||
                    quiz[i].correctAnswer === quiz[i-1].correctAnswer
                ) {
                    hasAdjacentDuplicates = true
                    break
                }
            }
            // This might occasionally fail due to randomness?
            expect(hasAdjacentDuplicates).toBe(false)
        })
    })
    describe('Edge Cases', () => {
        it('handles empty card array', () => {
            const quiz = generateQuiz([])
            expect(quiz).toHaveLength(0)
        })
        it('handles single card', () => {
            const quiz = generateQuiz([cards[0]])
            expect(quiz).toHaveLength(1)
            expect(quiz[0].options.filter(opt => opt === "")).toHaveLength(3)
            expect(quiz[0].options).toContain(cards[0].engCard)
        })
        it('handles cards with the same userLangCard', () => {
            const duplicateCards = [
                { ...cards[0] },
                { ...cards[1], userLangCard: cards[0].userLangCard },
                { ...cards[2] }
            ]
            const quiz = generateQuiz(duplicateCards)
            expect(quiz).toHaveLength(duplicateCards.length)
        })
        it('handles cards with the same engCard', () => {
            const duplicateCards = [
                { ...cards[0] },
                { ...cards[1], engCard: cards[1].engCard },
                { ...cards[2] }
            ]
            const quiz = generateQuiz(duplicateCards)
            expect(quiz).toHaveLength(duplicateCards.length)
        })
        it('handles undefined or null card properties', () => {
            const invalidCards = [
                { _id: '1', engCard: undefined, userLangCard: 'test1', cardScore: 0 },
                { _id: '2', engCard: 'test2', userLangCard: null, cardScore: 0 }
            ] as unknown as Card[]
            expect(() => generateQuiz(invalidCards)).not.toThrow()
        })
    })
})