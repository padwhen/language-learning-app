import { renderHook, act } from '@testing-library/react'
import { usePlaceholder } from '@/state/hooks/usePlaceholder'
import { describe, it, expect } from 'vitest'

describe('usePlaceholder hook', () => {
    it('should have placeholder set after initial render', () => {
    const { result } = renderHook(() => usePlaceholder('tab', 'newline'))
    expect(result.current).toBe('Card1\tCard2\nCard3\tCard4')
    })
    
  it('should set placeholder with tab and newline separators by default', () => {
    const { result } = renderHook(() => usePlaceholder('tab', 'newline'))
    
    // Wait for useEffect to run
    act(() => {})
    
    expect(result.current).toBe('Card1\tCard2\nCard3\tCard4')
  })
  
  it('should set placeholder with comma for term separator', () => {
    const { result } = renderHook(() => usePlaceholder('comma', 'newline'))
    
    act(() => {})
    
    expect(result.current).toBe('Card1,Card2\nCard3,Card4')
  })
  
  it('should set placeholder with semicolon for card separator', () => {
    const { result } = renderHook(() => usePlaceholder('tab', 'semicolon'))
    
    act(() => {})
    
    expect(result.current).toBe('Card1\tCard2;Card3\tCard4')
  })
  
  it('should set placeholder with comma and semicolon when both options are selected', () => {
    const { result } = renderHook(() => usePlaceholder('comma', 'semicolon'))
    
    act(() => {})
    
    expect(result.current).toBe('Card1,Card2;Card3,Card4')
  })
  
  it('should update placeholder when separators change', () => {
    const { result, rerender } = renderHook(
      ({ termSep, cardSep }) => usePlaceholder(termSep, cardSep),
      { initialProps: { termSep: 'tab', cardSep: 'newline' } }
    )
    
    // Initial render
    act(() => {})
    expect(result.current).toBe('Card1\tCard2\nCard3\tCard4')
    
    // Change separators
    rerender({ termSep: 'comma', cardSep: 'semicolon' })
    
    act(() => {})
    expect(result.current).toBe('Card1,Card2;Card3,Card4')
  })
})