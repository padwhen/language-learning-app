import { renderHook, act } from '@testing-library/react'
import useModifiedCards from '@/state/hooks/useModifiedCards'
import * as useFetchDeckModule from '@/state/hooks/useFetchDeck'
import { vocabulariesTailor } from '@/chatcompletion/ChatCompletion'
import { extractExplanation } from '@/utils/extractExplanation'
import { getDictionarySuggestion } from '@/utils/getDictionarySuggestion'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockCards, mockModifiedCards } from '@/test/__mocks__/data/mockDecks'

// Mock the required dependencies
vi.mock('@/state/hooks/useFetchDeck', () => ({
  default: vi.fn()
}))
vi.mock('@/chatcompletion/ChatCompletion', () => ({
  vocabulariesTailor: vi.fn()
}))
vi.mock('@/utils/extractExplanation', () => ({
  extractExplanation: vi.fn()
}))
vi.mock('@/utils/getDictionarySuggestion', () => ({
  getDictionarySuggestion: vi.fn()
}))

describe('useModifiedCards', () => {

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks()
    
    // Mock useFetchDeck to return mockCards
    const useFetchDeckDefault = useFetchDeckModule.default as jest.Mock
    useFetchDeckDefault.mockReturnValue({ 
      cards: mockCards, 
      deck: null,
      deckName: '',
      deckTags: [],
      userLang: '',
      setDeck: vi.fn(),
      setCards: vi.fn(),
      setDeckName: vi.fn(),
      setDeckTags: vi.fn(),
      setUserLang: vi.fn()
    })

    // Mock vocabulariesTailor to return modified cards
    vi.mocked(vocabulariesTailor).mockResolvedValue(JSON.stringify(mockModifiedCards))
    
    // Mock extractExplanation
    vi.mocked(extractExplanation).mockImplementation((str) => ({
      text: str,
      link: `https://example.com/dictionary/${str}`
    }))
    
    // Mock getDictionarySuggestion
    vi.mocked(getDictionarySuggestion).mockImplementation(async (word) => {
      return `Dictionary suggestion for ${word}`
    })
  })

  it('should initialize with empty items array', () => {
    const { result } = renderHook(() => useModifiedCards('deck-1'))
    
    expect(result.current.items).toEqual([])
    expect(result.current.length).toBe(mockCards.length)
  })

  it('should fetch and process modified cards', async () => {
    const { result } = renderHook(() => useModifiedCards('deck-1'))
    
    // Wait for async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    // Check that items were properly set
    expect(result.current.items).toHaveLength(2)
    
    // Check first item
    expect(result.current.items[0]).toMatchObject({
      _id: '1',
      engCard: 'Hello',
      userLangCard: 'Bonjour',
      aiEngCard: 'Hello (modified)',
      chosen: false,
      explanation: {
        text: 'A greeting used when meeting someone',
        link: 'https://example.com/dictionary/A greeting used when meeting someone'
      },
      dictionarySuggestion: 'Dictionary suggestion for Bonjour'
    })
    
    // Check second item
    expect(result.current.items[1]).toMatchObject({
      _id: '2',
      engCard: 'Goodbye',
      userLangCard: 'Au revoir',
      aiEngCard: 'Goodbye (modified)',
      chosen: false,
      explanation: {
        text: 'A farewell expression',
        link: 'https://example.com/dictionary/A farewell expression'
      },
      dictionarySuggestion: 'Dictionary suggestion for Au revoir'
    })
  })

  it('should not fetch modified cards if original cards array is empty', async () => {
    // Mock useFetchDeck to return empty cards array
    const useFetchDeckDefault = useFetchDeckModule.default as jest.Mock
    useFetchDeckDefault.mockReturnValue({
      cards: [],
      deck: null,
      deckName: '',
      deckTags: [],
      userLang: '',
      setDeck: vi.fn(),
      setCards: vi.fn(),
      setDeckName: vi.fn(),
      setDeckTags: vi.fn(),
      setUserLang: vi.fn()
    })
    
    const { result } = renderHook(() => useModifiedCards('deck-1'))
    
    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    // Verify vocabulariesTailor was not called
    expect(vocabulariesTailor).not.toHaveBeenCalled()
    expect(result.current.items).toEqual([])
    expect(result.current.length).toBe(0)
  })

  it('should handle errors gracefully', async () => {
    // Mock vocabulariesTailor to throw an error
    vi.mocked(vocabulariesTailor).mockRejectedValue(new Error('API error'))
    
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const { result } = renderHook(() => useModifiedCards('deck-1'))
    
    // Wait for async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching modified cards:',
      expect.any(Error)
    )
    
    // Items should remain empty
    expect(result.current.items).toEqual([])
    
    consoleErrorSpy.mockRestore()
  })
})