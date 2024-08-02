import { Card } from "@/types";
import { generateSynonymMatchingQuestions, generateWordScrambleQuestions, highlightText, subsetCards } from "@/utils/testUtils";
import { describe, it, expect } from "vitest";

const cards: Card[] = [
    { engCard: 'answer1', userLangCard: 'test1', cardScore: 0, _id: '1' },
    { engCard: 'answer2', userLangCard: 'test2', cardScore: 0, _id: '2' },
    { engCard: 'answer3', userLangCard: 'test3', cardScore: 0, _id: '3' },
    { engCard: 'answer4', userLangCard: 'test4', cardScore: 0, _id: '4' }
]

describe('generateSynonymMatchingQuestions', () => {
    it('should generate the correct number of questions', () => {
        const questions = generateSynonymMatchingQuestions(subsetCards(cards), 2)
        expect(questions).toHaveLength(2)
    })
    it('should generate questions with correct structure', () => {
        const questions = generateSynonymMatchingQuestions(subsetCards(cards))
        questions.forEach(q => {
            expect(q).toHaveProperty('question')
            expect(q).toHaveProperty('options')
            expect(q).toHaveProperty('correct_answer')
            expect(q.options).toHaveLength(4)
            expect(q.options).toContain(q.correct_answer)
        })
    })
})

describe('generateWordScrambleQuestions', () => {
    it('should generate the correct number of questions', () => {
        const questions = generateSynonymMatchingQuestions(subsetCards(cards), 3)
        expect(questions).toHaveLength(3)
    })
    it('should generate questions with correct structure', () => {
        const questions = generateWordScrambleQuestions(subsetCards(cards))
        questions.forEach(q => {
            expect(q).toHaveProperty('question')
            expect(q).toHaveProperty('correct_answer')
            expect(q.question).toContain("Unscrambled this word")
        })
    })
    it('should scramble the words correctly', () => {
        const questions = generateWordScrambleQuestions(subsetCards(cards))
        questions.forEach(q => {
            const scrambledWord = q.question.split('**')[1]
            expect(scrambledWord.split('').sort().join('')).toEqual(q.correct_answer.split('').sort().join(''))
        })
    })
})

describe('subsetCards', () => {
    it('should return an array with only engCard and userLangCard properities', () => {
        const subset = subsetCards(cards)
        expect(subset).toHaveLength(cards.length)
        subset.forEach(card => {
            expect(Object.keys(card)).toHaveLength(2)
            expect(card).toHaveProperty('engCard')
            expect(card).toHaveProperty('userLangCard')
        })
    })
})

describe('highlightText', () => {
    it('should highlight text between ** correctly', () => {
        const result = highlightText('This is a **test** of highlighting')
        expect(result).toHaveLength(3)
        expect(result[1]).toEqual(expect.objectContaining({
            type: 'span',
            props: expect.objectContaining({
                className: 'font-bold text-primary'
            })
        }))
    })
    it('should return original text if no highlighting is needed', () => {
        const result = highlightText('This is a test without highlighting')
        expect(result).toHaveLength(1)
        expect(result[0]).toBe('This is a test without highlighting');
    })
})