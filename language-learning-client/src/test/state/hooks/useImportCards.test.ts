import { renderHook, act } from "@testing-library/react";
import { useImportCards } from "@/state/hooks/useImportCards";
import { parseImportData } from "@/utils/parseImportData";
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock('@/utils/parseImportData')
vi.mock('uuid', () => ({ v4: () => 'mocked-uuid' }))

describe('useImportCards', () => {
    const mockSetCards = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('initial state', () => {
        const { result } = renderHook(() => useImportCards(mockSetCards))
        expect(result.current.open).toBe(false)
        expect(result.current.importData).toBe('')
        expect(result.current.termSeparator).toBe('tab')
        expect(result.current.cardSeparator).toBe('newline')
        expect(result.current.parsedCards).toEqual(undefined)
    })

    test('setOpen changes open state', () => {
        const { result } = renderHook(() => useImportCards(mockSetCards))
        act(() => {
            result.current.setOpen(true)
        })
        expect(result.current.open).toBe(true)
    })

    test('setImportData changes importData state and triggers parsing', () => {
        // Whenever it is called during the test, it will return this value
        vi.mocked(parseImportData).mockReturnValue([
            { term: 'Term1', definition: 'Definition1' }
        ])
        const { result } = renderHook(() => useImportCards(mockSetCards))
        act(() => {
            result.current.setImportData('Term1\tDefinition1')
        })
        expect(result.current.importData).toBe('Term1\tDefinition1')
        expect(result.current.parsedCards).toEqual([
            { term: 'Term1', definition: 'Definition1' }
        ])
        expect(parseImportData).toHaveBeenCalledWith('Term1\tDefinition1', 'tab', 'newline')
    })

    test('setTermSeparator changes termSeparator state and triggers parsing', () => {
        vi.mocked(parseImportData).mockReturnValue([
            { term: 'Term1', definition: 'Definition1' }
        ])
        const { result } = renderHook(() => useImportCards(mockSetCards))
        act(() => {
            result.current.setTermSeparator('comma')
        })
        expect(result.current.termSeparator).toBe('comma')
        expect(parseImportData).toHaveBeenCalledWith('', 'comma', 'newline')
    })

    test('setCardSeparator changes cardSeparator state and triggers parsing', () => {
        vi.mocked(parseImportData).mockReturnValue([
            { term: 'Term1', definition: 'Definition1' },
            { term: 'Term2', definition: 'Definition2' }
        ])
        const { result } = renderHook(() => useImportCards(mockSetCards))

        act(() => {
            result.current.setCardSeparator('semicolon')
        })

        expect(result.current.cardSeparator).toBe('semicolon')
        expect(parseImportData).toHaveBeenCalledWith('', 'tab', 'semicolon')
    })

    test('handleImport adds new cards and closes modal', () => {
        vi.mocked(parseImportData).mockReturnValue([
            { term: 'Term1', definition: 'Definition1' },
            { term: 'Term2', definition: 'Definition2' }  
        ])
        const { result } = renderHook(() => useImportCards(mockSetCards))

        act(() => {
            result.current.setImportData('Term1\tDefinition1\nTerm2\tDefinition2')
        })

        act(() => {
            result.current.handleImport()
        })

        expect(mockSetCards).toHaveBeenCalledWith(expect.any(Function))
        const setCardsCallback = mockSetCards.mock.calls[0][0]
        const newCards = setCardsCallback([])

        expect(newCards).toEqual([
            { _id: 'mocked-uuid', engCard: 'Definition1', userLangCard: 'Term1', cardScore: 0 },
            { _id: 'mocked-uuid', engCard: 'Definition2', userLangCard: 'Term2', cardScore: 0 }
        ])

        expect(result.current.open).toBe(false)
    })
})