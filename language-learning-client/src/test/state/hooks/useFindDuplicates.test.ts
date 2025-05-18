import { describe, it, expect} from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Card, Deck } from '@/types'
import { useFindDuplicates } from '@/state/hooks/useFindDuplicates'
import { mockCards, mockDecks } from '@/test/__mocks__/data/mockDecks'

describe('useFindDuplicates', () => {

    it('should find duplicates correctly', async () => {
        const { result } = renderHook(() => useFindDuplicates(mockCards, mockDecks, 'French Basics', 'French'))

        await waitFor(() => {
            expect(result.current.duplicates).toEqual({
                '1': [
                    {
                    deckName: 'This current deck',
                    isDuplicateTerm: true,
                    definition: 'Good morning',
                    cardId: '3'
                    }
                ],
                '2': [
                    {
                    deckName: '"French Advanced"',
                    isDuplicateTerm: true,
                    definition: 'Goodbye',
                    cardId: '4'
                    }
                ]
            })
        })
    })

    it('should not find duplicates in decks with different language', async () => {
      const spanishDeck: Deck = {
        _id: '3',
        deckName: 'Spanish Basics',
        deckTags: ['Spanish'],
        cards: [
          { _id: '5', engCard: 'Hello', userLangCard: 'Hola', cardScore: 0 },
        ],
      }

      const combinedDecks = mockDecks.concat(spanishDeck)
  
      const { result } = renderHook(() => 
        useFindDuplicates(mockCards, combinedDecks, 'French Basics', 'French')
      )
  
      await waitFor(() => {
        expect(result.current.duplicates['1'][0].deckName).not.toBe('"Spanish Basics"')
      })
    })
  
    it('should update localDecks when updateLocalDecks is called', async () => {
      const { result } = renderHook(() => useFindDuplicates(mockCards, mockDecks, 'French Basics', 'French'))

      const updatedDecks = [...mockDecks, {
        _id: '4',
        deckName: 'New Deck', 
        deckTags: ['French'],
        cards: []
      }]

      act(() => {
        result.current.updateLocalDecks(updatedDecks)
      })

      expect(result.current.localDecks).toEqual(updatedDecks)
    })

    it('should not find duplicates when card IDs are the same', async () => {
      const cardsWithSameID: Card[] = [
        { _id: '1', engCard: 'Hello', userLangCard: 'Bonjour', cardScore: 0 },
      ]
      const { result } = renderHook(() => useFindDuplicates(cardsWithSameID, mockDecks, 'French Basics', 'French'))

      await waitFor(() => {
        expect(result.current.duplicates).toEqual({
          '1': [
            {
              deckName: 'This current deck',
              isDuplicateTerm: true,
              definition: 'Good morning',
              cardId: '3'
            }
          ]
        })
      })
    })
})