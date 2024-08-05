import { act, renderHook } from "@testing-library/react";
import { describe, it, vi} from "vitest";
import { Card, Deck } from "@/types";
import * as fetchDeckModule from '@/state/hooks/useFetchDeck'
import { useMatchGame } from "@/state/hooks/useMatchGame";

vi.mock('./useFetchDeck', () => ({
    __esModule: true,
    default: vi.fn(),
}))

const mockCards: Card[] = [
    { _id: '1', engCard: 'Hello', userLangCard: 'Bonjour', cardScore: 0 },
    { _id: '2', engCard: 'Goodbye', userLangCard: 'Au revoir', cardScore: 0 },
    { _id: '3', engCard: 'Yes', userLangCard: 'Oui', cardScore: 0 }
]

const mockDeck: Deck = {
    _id: 'deckId',
    deckName: 'Test Deck',
    deckTags: ['French'],
    cards: mockCards,
}


describe('useMatchGame', () => {
    let fetchDeckMock: any

    beforeEach(() => {
        // Anything use useFetchDeck will return exactly like this
        fetchDeckMock = vi.spyOn(fetchDeckModule, 'default').mockReturnValue({
            deck: mockDeck,
            cards: mockCards,
            deckName: mockDeck.deckName,
            deckTags: mockDeck.deckTags,
            userLang: mockDeck.deckTags[0],
            setDeck: vi.fn(),
            setCards: vi.fn(),
            setDeckName: vi.fn(),
            setDeckTags: vi.fn(),
            setUserLang: vi.fn(),
        })
    })

    afterEach(() => {
        fetchDeckMock.mockRestore()
    })

    it('should initialize game correctly', () => {
        const { result } = renderHook(() => useMatchGame('deckId'))
        expect(result.current.gameCards).toEqual(expect.any(Array))
        expect(result.current.selectedCards).toEqual([])
        expect(result.current.matchedPairs).toEqual([])
        expect(result.current.incorrectPair).toEqual([])
        expect(result.current.isGameCompleted).toBe(false)
        expect(result.current.gameStarted).toBe(false)
        expect(result.current.showPenalty).toBe(false)
        expect(result.current.gameOptions).toEqual({
            showTimer: true,
            allowDeselect: false,
        })
    })
    
    it('should start the game', () => {
        const { result } = renderHook(() => useMatchGame('deckId'))

        act(() => {
            result.current.startGame()
        })

        expect(result.current.gameStarted).toBe(true)
        expect(result.current.timeElapsed).toBe(0)
    })

    it('should handle card click and match correctly', () => {
        const { result } = renderHook(() => useMatchGame('deckId'))
        const cardId1 = '1-eng'
        const cardId2 = '1-userLang'

        act(() => {
            result.current.handleCardClick(cardId1)
            result.current.handleCardClick(cardId2)
        })

        expect(result.current.selectedCards).toEqual([cardId1, cardId2])
        expect(result.current.matchedPairs).toContain(cardId1)
        expect(result.current.matchedPairs).toContain(cardId2)
    })

    it('should handle card click and mismatch correctly', () => {
        const { result } = renderHook(() => useMatchGame('deckId'))
        const cardId1 = '1-eng'
        const cardId2 = '2-userLang'

        act(() => {
            result.current.handleCardClick(cardId1)
            result.current.handleCardClick(cardId2)
        })

        expect(result.current.selectedCards).toEqual([cardId1, cardId2])
        expect(result.current.incorrectPair).toEqual([cardId1, cardId2])
        expect(result.current.timeElapsed).toBe(5000)
    })

    it('should reset the game correctly', () => {
        const { result } = renderHook(() => useMatchGame('deckId'))

        act(() => {
            result.current.startGame()
            result.current.resetGame()
        })

        expect(result.current.selectedCards).toEqual([])
        expect(result.current.matchedPairs).toEqual([])
        expect(result.current.incorrectPair).toEqual([])
        expect(result.current.timeElapsed).toBe(0)
        expect(result.current.isGameCompleted).toBe(false)
    })

    it('should suffle cards', () => {
        const { result } = renderHook(() => useMatchGame('deckId'))
        const initialCards = result.current.gameCards

        act(() => {
            result.current.shuffleCards()
        })

        expect(result.current.gameCards).not.toEqual(initialCards)
    })

    it('should complete the game when all pairs are matched', () => {
        vi.useFakeTimers()
        const { result } = renderHook(() => useMatchGame('deckId'))
    
        act(() => {
            result.current.startGame()
        })
    
        const clickCard = (id: string) => {
            act(() => {
                result.current.handleCardClick(id)
            })
        }
    
        const pairs = [
            ['1-eng', '1-userLang'],
            ['2-eng', '2-userLang'],
            ['3-eng', '3-userLang'],
        ]
    
        pairs.forEach(([first, second]) => {
            clickCard(first)
            clickCard(second)
            act(() => {
                vi.advanceTimersByTime(500);
            });
        })
        act(() => { vi.runAllTimers() })
        expect(result.current.isGameCompleted).toBe(true)
        expect(result.current.matchedPairs.length).toBe(result.current.gameCards.length)
        vi.useRealTimers();
    })
    it('should add 5 seconds to the timer when a wrong pair is selected', () => {
        const { result } = renderHook(() => useMatchGame('deckId'))

        act(() => {
            result.current.startGame()
            result.current.handleCardClick('1-eng')
            result.current.handleCardClick('2-userLang')
        })

        expect(result.current.timeElapsed).toBe(5000)
    })
})