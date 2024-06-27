import { renderHook, act } from "@testing-library/react";
import useQuizOptions from "@/state/hooks/useQuizOptions";
import { Card } from "@/types";

const mockCards: Card[] = [
    { _id: '1', engCard: 'Hello', userLangCard: 'Bonjour', cardScore: 0 },
    { _id: '2', engCard: 'Goodbye', userLangCard: 'Au revoir', cardScore: 2 },
    { _id: '3', engCard: 'Thank you', userLangCard: 'Merci', cardScore: 4 },
    { _id: '4', engCard: 'Please', userLangCard: 'S\'il vous plaît', cardScore: 5 },
    { _id: '5', engCard: 'Yes', userLangCard: 'Oui', cardScore: 1 },
  ];

describe('useQuizOptions', () => {
    test('initial state', () => {
        const { result } = renderHook(() => useQuizOptions(mockCards))
        expect(result.current.includeCompletedCards).toBe(false)
        expect(result.current.cardsToLearn).toBe(10)
        expect(result.current.cardTypeToLearn).toBe('All')
        expect(result.current.shuffleCards).toBe(false)
        const filterCards = result.current.filterCards()
        expect(filterCards).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ _id: '3', engCard: 'Thank you', userLangCard: 'Merci', cardScore: 4 }),
                expect.objectContaining({ _id: '4', engCard: 'Please', userLangCard: 'S\'il vous plaît', cardScore: 5 })
            ])
        )
    })
    test('setIncludeCompletedCards', () => {
        const { result } = renderHook(() => useQuizOptions(mockCards))
        act(() => {
            result.current.setIncludeCompletedCards(true)
        })
        expect(result.current.includeCompletedCards).toBe(true)
        const filterCards = result.current.filterCards()
        expect(filterCards).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ _id: '3', engCard: 'Thank you', userLangCard: 'Merci', cardScore: 4 }),
                expect.objectContaining({ _id: '4', engCard: 'Please', userLangCard: 'S\'il vous plaît', cardScore: 5 })
            ])
        )
    })
    test('setCardsToLearn', () => {
        const { result } = renderHook(() => useQuizOptions(mockCards))
        act(() => {
            result.current.setCardsToLearn(5)
        })
        expect(result.current.cardsToLearn).toBe(5)
    })
    test('setCardTypeToLearn: Learning', () => {
        const { result } = renderHook(() => useQuizOptions(mockCards))
        act(() => {
            result.current.setCardTypeToLearn('Learning')
        })
        const filterCards = result.current.filterCards()
        expect(filterCards).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ _id: '2', engCard: 'Goodbye', userLangCard: 'Au revoir', cardScore: 2 }),
                expect.objectContaining({ _id: '5', engCard: 'Yes', userLangCard: 'Oui', cardScore: 1 })
            ])
        )
    })
    test('setCardTypeToLearn: Not studied', () => {
        const { result } = renderHook(() => useQuizOptions(mockCards))
        act(() => {
            result.current.setCardTypeToLearn('Not studied')
        })
        const filterCards = result.current.filterCards()
        expect(filterCards).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ _id: '1', engCard: 'Hello', userLangCard: 'Bonjour', cardScore: 0 })
            ])
        )
    })
    test('setCardTypeToLearn: Completed', () => {
        const { result } = renderHook(() => useQuizOptions(mockCards))
        
        act(() => {
          result.current.setCardTypeToLearn('Completed')
          result.current.setIncludeCompletedCards(true)
        });
        
        const filteredCards = result.current.filterCards()
        expect(filteredCards.length).toBe(2)
        expect(filteredCards.every(card => card.cardScore >= 4 && card.cardScore <= 5)).toBe(true)
    });
    test('setShuffleCards', () => {
        const { result } = renderHook(() => useQuizOptions(mockCards))
        act(() => {
            result.current.setShuffleCards(true)
        })
        expect(result.current.shuffleCards).toBe(true)
    })
    test('filterCards - shuffle cards', () => {
        const { result } = renderHook(() => useQuizOptions(mockCards))
        act(() => {
            result.current.setShuffleCards(true)
            result.current.setIncludeCompletedCards(true)
        })
        // Run multiple times to ensure shuffling
        const results = new Set()
        for (let i = 0; i < 10; i++) {
            const filteredCards = result.current.filterCards()
            results.add(filteredCards.map(card => card._id).join(','))
        }
        expect(results.size).toBeGreaterThan(1)
    })
})