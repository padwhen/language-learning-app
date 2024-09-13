import { describe, it, expect} from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Card, Deck } from '@/types'
import { useFindDuplicates } from '@/state/hooks/useFindDuplicates'

describe('useFindDuplicates', () => {
    const mockCards: Card[] = [
        { _id: '1', engCard: 'Hello', userLangCard: 'Bonjour', cardScore: 0 },
        { _id: '2', engCard: 'Goodbye', userLangCard: 'Au revoir', cardScore: 0 }
    ]

    const mockDecks: Deck[] = [
        {
          _id: '1',
          deckName: 'French Basics',
          deckTags: ['French'],
          cards: [
            { _id: '1', engCard: 'Hello', userLangCard: 'Bonjour', cardScore: 0 },
            { _id: '3', engCard: 'Good morning', userLangCard: 'Bonjour', cardScore: 0 },
          ],
        },
        {
          _id: '2',
          deckName: 'French Advanced',
          deckTags: ['French'],
          cards: [
            { _id: '4', engCard: 'Goodbye', userLangCard: 'Au revoir', cardScore: 0 },
          ],
        },
    ]

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