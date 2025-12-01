import { renderHook, act } from '@testing-library/react'
import { useFetchHistory, useFetchNextQuizDate, useFetchQuizHistory } from '@/state/hooks/useLearningHistoryHooks'
import axios from 'axios'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mockQuizHistoryData } from '@/test/__mocks__/data/mockQuizHistory'


vi.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Learning History Hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('useFetchHistory', () => {
    const mockHistoryData = {
      history: [
        {
          id: 'history-1',
          correctAnswers: 4,
          date: '2023-01-15T00:00:00.000Z',
          cardsStudied: 5,
          quizType: 'learn' as const,
          randomName: 'Winter Quiz'
        },
        {
          id: 'history-2',
          correctAnswers: 3,
          date: '2023-01-16T00:00:00.000Z',
          cardsStudied: 5,
          quizType: 'review' as const,
          randomName: 'Spring Review'
        }
      ]
    }

    it('should initialize with empty history array', () => {
      const { result } = renderHook(() => useFetchHistory(null, null))
      
      expect(result.current.history).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('should not fetch history if userId or deckId is missing', async () => {
      const { result } = renderHook(() => useFetchHistory(null, null))
      
      await act(async () => {
        await result.current.fetchHistory()
      })
      
      expect(mockedAxios.get).not.toHaveBeenCalled()
      expect(result.current.history).toEqual([])
    })

    it('should fetch and set history when userId and deckId are provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockHistoryData })
      
      const { result } = renderHook(() => useFetchHistory('user-123', 'deck-123'))
      
      await act(async () => {
        await result.current.fetchHistory()
      })
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/learning-history/user-123/deck-123')
      expect(result.current.history).toEqual(mockHistoryData.history)
      expect(result.current.error).toBeNull()
    })

    it('should set error when API call fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
      
      const { result } = renderHook(() => useFetchHistory('user-123', 'deck-123'))
      
      await act(async () => {
        await result.current.fetchHistory()
      })
      
      expect(result.current.error).toBe('Error fetching learning history')
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('useFetchNextQuizDate', () => {
    const mockNextQuizDate = {
      nextQuizDate: '2023-02-01T00:00:00.000Z'
    }

    it('should initialize with null nextQuizDate', () => {
      const { result } = renderHook(() => useFetchNextQuizDate(null, null))
      
      expect(result.current.nextQuizDate).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should not fetch next quiz date if userId or deckId is missing', async () => {
      const { result } = renderHook(() => useFetchNextQuizDate(null, null))
      
      await act(async () => {
        await result.current.fetchNextQuizDate()
      })
      
      expect(mockedAxios.get).not.toHaveBeenCalled()
      expect(result.current.nextQuizDate).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should fetch and set next quiz date when userId and deckId are provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockNextQuizDate })
      
      const { result } = renderHook(() => useFetchNextQuizDate('user-123', 'deck-123'))
      
      await act(async () => {
        await result.current.fetchNextQuizDate()
      })
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/learning-history/next-quiz-date/user-123/deck-123')
      expect(result.current.nextQuizDate).toEqual(new Date(mockNextQuizDate.nextQuizDate))
      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should set error when API call fails and set loading to false', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
      
      const { result } = renderHook(() => useFetchNextQuizDate('user-123', 'deck-123'))
      
      await act(async () => {
        await result.current.fetchNextQuizDate()
      })
      
      expect(result.current.error).toBe('Error fetching next quiz date')
      expect(result.current.loading).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('useFetchQuizHistory', () => {
    it('should initialize with null quizHistory', () => {
      const { result } = renderHook(() => useFetchQuizHistory(''))
      
      expect(result.current.quizHistory).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should fetch and set quiz history when historyId is provided', async () => {
      // Use the existing mockQuizHistoryData
      mockedAxios.get.mockResolvedValueOnce({ data: mockQuizHistoryData })
      
      const { result } = renderHook(() => useFetchQuizHistory('history-123'))
      
      await act(async () => {
        await result.current.fetchQuizHistory()
      })
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/learning-history/history-123')
      expect(result.current.quizHistory).toEqual(mockQuizHistoryData)
      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should set error when API call fails and set loading to false', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
      
      const { result } = renderHook(() => useFetchQuizHistory('history-123'))
      
      await act(async () => {
        await result.current.fetchQuizHistory()
      })
      
      expect(result.current.error).toBe('Error fetching quiz history')
      expect(result.current.loading).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })
  })
})