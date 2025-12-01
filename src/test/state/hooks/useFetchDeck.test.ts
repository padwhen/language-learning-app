import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import axios from 'axios'
import useFetchDeck from '@/state/hooks/useFetchDeck'
import { Deck } from '@/types'

vi.mock('axios')

describe('useFetchDeck', () => {
    const mockDeckId = '123'
    const mockDeckData: Deck = {
        _id: mockDeckId,
        deckName: 'Test Deck',
        deckTags: ['French', 'Beginner'],
        cards: [
            { _id: '1', engCard: 'hello', userLangCard: 'bonjour', cardScore: 0 },
            { _id: '2', engCard: 'goodbye', userLangCard: 'au revoir', cardScore: 0 }
        ]
    }

    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('updates state correctly when API call is successful', async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: mockDeckData })

        const { result } = renderHook(() => useFetchDeck(mockDeckId))

        await waitFor(() => {
            expect(result.current.deck).toEqual(mockDeckData)
        })
        
        expect(result.current.cards).toEqual(mockDeckData.cards)
        expect(result.current.deckName).toEqual(mockDeckData.deckName)
        expect(result.current.deckTags).toEqual(mockDeckData.deckTags)
        expect(result.current.userLang).toBe(mockDeckData.deckTags[0])
    })

    it('handles error when API call fails', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.mocked(axios.get).mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useFetchDeck(mockDeckId))

        await waitFor(() => {
            expect(result.current.deck).toBeNull()
        })

        expect(result.current.cards).toEqual([])
        expect(consoleErrorSpy).toHaveBeenCalled()

        consoleErrorSpy.mockRestore()
    })

    it('does not make API call when id is restored', () => {
        renderHook(() => useFetchDeck(undefined))
        expect(axios.get).not.toHaveBeenCalled()
    })
})