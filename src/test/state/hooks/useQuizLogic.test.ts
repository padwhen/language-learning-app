import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useQuizLogic from '@/state/hooks/useQuizLogic'
import axios from 'axios'
import type { QuizItem, Card } from '@/types'

vi.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const createMockQuizItems = (count: number): QuizItem[] =>
    Array.from({ length: count }, (_, i) => ({
        userLangCard: `word-${i}`,
        options: [`opt-a-${i}`, `opt-b-${i}`, `opt-c-${i}`, `correct-${i}`],
        correctAnswer: `correct-${i}`,
        correctIndex: 3,
        cardId: `card-${i}`,
        cardScore: 0,
        questionType: 'multiple-choice' as const,
    }))

const createMockCards = (count: number): Card[] =>
    Array.from({ length: count }, (_, i) => ({
        _id: `card-${i}`,
        engCard: `correct-${i}`,
        userLangCard: `word-${i}`,
        cardScore: 0,
        learning: false,
    }))

describe('useQuizLogic', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        localStorage.setItem('userId', 'test-user-123')
        // Mock fetchCards (GET /decks/:id)
        mockedAxios.get.mockResolvedValue({ data: { cards: createMockCards(4) } })
        // Mock finishQuiz PUT + POST
        mockedAxios.put.mockResolvedValue({ data: {} })
        mockedAxios.post.mockResolvedValue({
            data: { history: { nextQuizDate: new Date().toISOString() } },
        })
    })

    afterEach(() => {
        localStorage.clear()
    })

    it('should initialize with correct default state', () => {
        const quiz = createMockQuizItems(4)
        const { result } = renderHook(() => useQuizLogic(quiz, 'deck-1'))

        expect(result.current.question).toBe(1)
        expect(result.current.answers).toEqual([])
        expect(result.current.quizdone).toBe(false)
        expect(result.current.score).toBe(0)
    })

    it('should initialize with resume data when provided', () => {
        const quiz = createMockQuizItems(2)
        const resumeData = {
            currentQuestion: 3,
            answers: [
                { question: 1, userAnswer: 'a', correctAnswer: 'a', correct: true, cardId: 'card-0', cardScore: 1 },
                { question: 2, userAnswer: 'b', correctAnswer: 'b', correct: true, cardId: 'card-1', cardScore: 1 },
            ],
            score: 2,
        }

        const { result } = renderHook(() =>
            useQuizLogic(quiz, 'deck-1', false, undefined, true, resumeData)
        )

        expect(result.current.answers).toEqual(resumeData.answers)
        expect(result.current.score).toBe(2)
    })

    describe('saveAnswer', () => {
        it('should increment question and score on correct answer', async () => {
            const quiz = createMockQuizItems(4)
            const { result } = renderHook(() =>
                useQuizLogic(quiz, 'deck-1', false, undefined, false, undefined, undefined, true)
            )

            // Wait for fetchCards
            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(3, true, 'card-0')
            })

            expect(result.current.question).toBe(2)
            expect(result.current.score).toBe(1)
        })

        it('should increment question but not score on wrong answer', async () => {
            const quiz = createMockQuizItems(4)
            const { result } = renderHook(() =>
                useQuizLogic(quiz, 'deck-1', false, undefined, false, undefined, undefined, true)
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(0, false, 'card-0')
            })

            expect(result.current.question).toBe(2)
            expect(result.current.score).toBe(0)
        })

        it('should apply +0.5 score for partial correct answers', async () => {
            const mockCards = createMockCards(2)
            mockCards[0].cardScore = 2
            mockedAxios.get.mockResolvedValue({ data: { cards: mockCards } })

            const quiz = createMockQuizItems(2)
            const { result } = renderHook(() =>
                useQuizLogic(quiz, 'deck-1', false, undefined, false, undefined, undefined, true)
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(0, true, 'card-0', 'partial answer', true)
            })

            // Partial correct still counts toward score
            expect(result.current.score).toBe(1)
            // Card score should be 2 + 0.5 = 2.5
            const card = result.current.cards.find(c => c._id === 'card-0')
            expect(card?.cardScore).toBe(2.5)
        })

        it('should cap card score at 5', async () => {
            const mockCards = createMockCards(2)
            mockCards[0].cardScore = 5
            mockedAxios.get.mockResolvedValue({ data: { cards: mockCards } })

            const quiz = createMockQuizItems(2)
            const { result } = renderHook(() =>
                useQuizLogic(quiz, 'deck-1', false, undefined, false, undefined, undefined, true)
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(3, true, 'card-0')
            })

            const card = result.current.cards.find(c => c._id === 'card-0')
            expect(card?.cardScore).toBe(5)
        })

        it('should floor card score at 0', async () => {
            const mockCards = createMockCards(2)
            mockCards[0].cardScore = 0
            mockedAxios.get.mockResolvedValue({ data: { cards: mockCards } })

            const quiz = createMockQuizItems(2)
            const { result } = renderHook(() =>
                useQuizLogic(quiz, 'deck-1', false, undefined, false, undefined, undefined, true)
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(0, false, 'card-0')
            })

            const card = result.current.cards.find(c => c._id === 'card-0')
            expect(card?.cardScore).toBe(0)
        })
    })

    describe('quizType on finish', () => {
        it('should send quizType "learn" for a normal learn session', async () => {
            const quiz = createMockQuizItems(1) // single question quiz
            const { result } = renderHook(() =>
                useQuizLogic(quiz, 'deck-1', false, undefined, false, undefined, undefined, true)
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(3, true, 'card-0')
            })

            expect(result.current.quizdone).toBe(true)
            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/learning-history/save-quiz-result',
                expect.objectContaining({ quizType: 'learn' })
            )
        })

        it('should send quizType "learn" even when resuming (not "resume")', async () => {
            const quiz = createMockQuizItems(1)
            const resumeData = { currentQuestion: 2, answers: [], score: 0 }

            const { result } = renderHook(() =>
                useQuizLogic(
                    quiz, 'deck-1', false, undefined,
                    true,       // isResumeMode = true
                    resumeData,
                    createMockQuizItems(2), // originalQuizItems
                    true
                )
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(3, true, 'card-0')
            })

            expect(result.current.quizdone).toBe(true)
            // Key assertion: quizType should be 'learn', NOT 'resume'
            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/learning-history/save-quiz-result',
                expect.objectContaining({ quizType: 'learn' })
            )
        })

        it('should send quizType "review" for review sessions', async () => {
            const quiz = createMockQuizItems(1)
            const { result } = renderHook(() =>
                useQuizLogic(
                    quiz, 'deck-1',
                    true, // isReviewMode = true
                    undefined, false, undefined, undefined, true
                )
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(3, true, 'card-0')
            })

            expect(result.current.quizdone).toBe(true)
            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/learning-history/save-quiz-result',
                expect.objectContaining({ quizType: 'review' })
            )
        })

        it('should send quizType "review" even when resuming a review session', async () => {
            const quiz = createMockQuizItems(1)
            const resumeData = { currentQuestion: 2, answers: [], score: 0 }

            const { result } = renderHook(() =>
                useQuizLogic(
                    quiz, 'deck-1',
                    true,  // isReviewMode = true
                    undefined,
                    true,  // isResumeMode = true
                    resumeData,
                    createMockQuizItems(2),
                    true
                )
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(3, true, 'card-0')
            })

            expect(result.current.quizdone).toBe(true)
            // Key assertion: quizType should be 'review', NOT 'resume'
            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/learning-history/save-quiz-result',
                expect.objectContaining({ quizType: 'review' })
            )
        })

        it('should never send quizType "resume"', async () => {
            const quiz = createMockQuizItems(1)
            const resumeData = { currentQuestion: 2, answers: [], score: 0 }

            const { result } = renderHook(() =>
                useQuizLogic(quiz, 'deck-1', false, undefined, true, resumeData, createMockQuizItems(2), true)
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(3, true, 'card-0')
            })

            // Verify none of the POST calls contain 'resume'
            for (const call of mockedAxios.post.mock.calls) {
                if (call[0] === '/learning-history/save-quiz-result') {
                    expect(call[1].quizType).not.toBe('resume')
                }
            }
        })
    })

    describe('finishQuiz', () => {
        it('should call PUT to update cards and POST to save result', async () => {
            const quiz = createMockQuizItems(1)
            const { result } = renderHook(() =>
                useQuizLogic(quiz, 'deck-1', false, undefined, false, undefined, undefined, true)
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            await act(async () => {
                await result.current.saveAnswer(3, true, 'card-0')
            })

            expect(mockedAxios.put).toHaveBeenCalledWith(
                '/decks/update-card/deck-1',
                expect.objectContaining({ cards: expect.any(Array) })
            )
            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/learning-history/save-quiz-result',
                expect.objectContaining({
                    userId: 'test-user-123',
                    deckId: 'deck-1',
                    cardsStudied: 1,
                    correctAnswers: 1,
                })
            )
        })

        it('should handle finishQuiz API errors gracefully without crashing', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            // Let the card-level PUTs succeed but make finishQuiz's POST fail
            mockedAxios.put.mockResolvedValue({ data: {} })
            mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))

            const quiz = createMockQuizItems(1)
            const { result } = renderHook(() =>
                useQuizLogic(quiz, 'deck-1', false, undefined, false, undefined, undefined, true)
            )

            await act(async () => {
                await new Promise(r => setTimeout(r, 0))
            })

            // Should not throw even though POST fails
            await act(async () => {
                await result.current.saveAnswer(3, true, 'card-0')
            })

            expect(consoleErrorSpy).toHaveBeenCalled()
            consoleErrorSpy.mockRestore()
        })
    })
})
