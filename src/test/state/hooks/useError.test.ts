import { renderHook, act } from '@testing-library/react'
import { useError } from '@/state/hooks/useError'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useError hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with empty error', () => {
    const { result } = renderHook(() => useError())
    expect(result.current.error).toBe('')
  })

  it('should set error when handleError is called', () => {
    const { result } = renderHook(() => useError())
    
    act(() => {
      result.current.handleError('Test error message')
    })
    
    expect(result.current.error).toBe('Test error message')
  })

  it('should clear error after 5 seconds', () => {
    const { result } = renderHook(() => useError())
    
    act(() => {
      result.current.handleError('Test error message')
    })
    
    expect(result.current.error).toBe('Test error message')
    
    // Fast-forward time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    
    expect(result.current.error).toBe('')
  })
})