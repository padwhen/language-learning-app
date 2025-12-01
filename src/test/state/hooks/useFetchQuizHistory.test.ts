import { renderHook, waitFor } from '@testing-library/react'
import { useFetchQuizHistory } from '@/state/hooks/useFetchQuizHistory'
import axios from 'axios'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mockQuizHistoryData } from '@/test/__mocks__/data/mockQuizHistory'
import { act } from 'react-dom/test-utils'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('useFetchQuizHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFetchQuizHistory(undefined))
    
    expect(result.current.quizData).toBeNull()
    expect(result.current.searchTerm).toBe('')
    expect(result.current.filter).toBe('default')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.filteredQuizDetails).toEqual([])
    expect(result.current.averageTime).toBe('0')
  })

  it('should not fetch data if id is undefined', () => {
    renderHook(() => useFetchQuizHistory(undefined))
    
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })

  it('should fetch and set quiz history data when id is provided', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockQuizHistoryData })
    
    const { result } = renderHook(() => useFetchQuizHistory('history-123'))
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/learning-history/history-123')
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.quizData).toEqual(mockQuizHistoryData)
      // Check calculated average time
      const expectedAvg = (mockQuizHistoryData.quizDetails.reduce((sum, quiz) => 
        sum + quiz.timeTaken, 0) / mockQuizHistoryData.quizDetails.length / 1000).toFixed(2)
      expect(result.current.averageTime).toBe(expectedAvg)
    })
  })
  
  it('should filter quiz details based on search term', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockQuizHistoryData })
    
    const { result } = renderHook(() => useFetchQuizHistory('history-123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Set search term
    act(() => {
      result.current.setSearchTerm('question 1')
    })
    
    expect(result.current.filteredQuizDetails.length).toBeLessThan(mockQuizHistoryData.quizDetails.length)
    expect(result.current.filteredQuizDetails.every(quiz => 
      quiz.question.toLowerCase().includes('question 1')
    )).toBe(true)
  })

  it('should handle API error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
    
    const { result } = renderHook(() => useFetchQuizHistory('history-123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).not.toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
    
    consoleErrorSpy.mockRestore()
  })
})