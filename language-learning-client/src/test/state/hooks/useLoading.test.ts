import { renderHook, act } from '@testing-library/react'
import { useLoading } from '@/state/hooks/useLoading'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useLoading hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with loading set to true', () => {
    const { result } = renderHook(() => useLoading())
    expect(result.current).toBe(true)
  })

  it('should set loading to false after default delay (10 seconds)', () => {
    const { result } = renderHook(() => useLoading())
    
    // Initially it should be true
    expect(result.current).toBe(true)
    
    // Advance timers by default delay
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    
    // After delay it should be false
    expect(result.current).toBe(false)
  })

  it('should set loading to false after custom delay', () => {
    const customDelay = 5000
    const { result } = renderHook(() => useLoading(customDelay))
    
    // Initially it should be true
    expect(result.current).toBe(true)
    
    // Advance timers by half the delay - should still be loading
    act(() => {
      vi.advanceTimersByTime(customDelay / 2)
    })
    expect(result.current).toBe(true)
    
    // Advance timers to complete the delay
    act(() => {
      vi.advanceTimersByTime(customDelay / 2)
    })
    
    // After full delay it should be false
    expect(result.current).toBe(false)
  })

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    
    const { unmount } = renderHook(() => useLoading())
    
    unmount()
    
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})