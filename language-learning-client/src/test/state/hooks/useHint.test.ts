import { renderHook, act } from '@testing-library/react'
import { useHint } from '@/state/hooks/useHint'
import { describe, it, expect } from 'vitest'

describe('useHint hook', () => {
  it('should initialize with empty hint', () => {
    const { result } = renderHook(() => useHint())
    
    expect(result.current.hint).toBe('')
  })
  
  it('should not change hint when word is undefined', () => {
    const { result } = renderHook(() => useHint())
    
    act(() => {
      result.current.generateHint(undefined as unknown as string)
    })
    
    expect(result.current.hint).toBe('')
  })
  
  it('should set full word as hint for single character words', () => {
    const { result } = renderHook(() => useHint())
    
    act(() => {
      result.current.generateHint('A')
    })
    
    expect(result.current.hint).toBe('A')
  })
  
  it('should set full word as hint for words with length less than 2', () => {
    const { result } = renderHook(() => useHint())
    
    act(() => {
      result.current.generateHint('')
    })
    
    expect(result.current.hint).toBe('')
  })
  
  it('should show only first and last letters for a two-letter word', () => {
    const { result } = renderHook(() => useHint())
    
    act(() => {
      result.current.generateHint('AB')
    })
    
    expect(result.current.hint).toBe('AB')
  })
  
  it('should mask middle characters for words with more than 2 characters', () => {
    const { result } = renderHook(() => useHint())
    
    act(() => {
      result.current.generateHint('Hello')
    })
    
    // Should show first and last letter with underscores in between
    expect(result.current.hint).toBe('H _  _  _ o')
  })
  
  it('should handle longer words correctly', () => {
    const { result } = renderHook(() => useHint())
    
    act(() => {
      result.current.generateHint('Extraordinary')
    })
    
    // First letter E, last letter y, rest masked
    const expected = 'E' + ' _ '.repeat(11) + 'y'
    expect(result.current.hint).toBe(expected)
  })
  
  it('should correctly handle special characters', () => {
    const { result } = renderHook(() => useHint())
    
    act(() => {
      result.current.generateHint('Hôtel')
    })
    
    expect(result.current.hint).toBe('H _  _  _ l')
  })
})