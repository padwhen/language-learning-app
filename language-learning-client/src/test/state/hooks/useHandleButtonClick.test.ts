import { renderHook, act } from '@testing-library/react'
import { useHandleButtonClick } from '@/state/hooks/useHandleButtonClick'
import { describe, it, expect, vi } from 'vitest'

describe('useHandleButtonClick hook', () => {
  it('should initialize with empty chosenOptions array', () => {
    const { result } = renderHook(() => useHandleButtonClick())
    
    expect(result.current.chosenOptions).toEqual([])
  })

  it('should handle button click and update items when called', () => {
    const { result } = renderHook(() => useHandleButtonClick())
    
    const mockItems = [
      { _id: '1', userLangCard: 'card1', chosen: false },
      { _id: '2', userLangCard: 'card2', chosen: false },
    ]
    
    const mockSetItems = vi.fn()
    
    act(() => {
      result.current.handleButtonClick(
        mockItems,
        mockSetItems,
        1,
        'testOption',
        'notOriginal'
      )
    })
    
    // Check if setItems was called with the correct transformed array
    expect(mockSetItems).toHaveBeenCalledWith([
      { _id: '1', userLangCard: 'card1', chosen: false },
      { _id: '2', userLangCard: 'card2', chosen: true },
    ])
  })

  it('should add chosen option to chosenOptions when selectedSuggestion is not "original"', () => {
    const { result } = renderHook(() => useHandleButtonClick())
    
    const mockItems = [
      { _id: '1', userLangCard: 'card1', chosen: false },
      { _id: '2', userLangCard: 'card2', chosen: false },
    ]
    
    act(() => {
      result.current.handleButtonClick(
        mockItems,
        vi.fn(),
        1,
        'testOption',
        'notOriginal'
      )
    })
    
    expect(result.current.chosenOptions).toEqual([
      {
        _id: '2',
        userLangCard: 'card2',
        chosenOption: 'testOption'
      }
    ])
  })

  it('should not add to chosenOptions when selectedSuggestion is "original"', () => {
    const { result } = renderHook(() => useHandleButtonClick())
    
    const mockItems = [
      { _id: '1', userLangCard: 'card1', chosen: false },
    ]
    
    act(() => {
      result.current.handleButtonClick(
        mockItems,
        vi.fn(),
        0,
        'testOption',
        'original'
      )
    })
    
    // Verify chosenOptions remained empty
    expect(result.current.chosenOptions).toEqual([])
  })

  it('should replace existing option with the same _id in chosenOptions', () => {
    const { result } = renderHook(() => useHandleButtonClick())
    
    // Add initial option
    const mockItems1 = [
      { _id: '1', userLangCard: 'card1', chosen: false },
    ]
    
    act(() => {
      result.current.handleButtonClick(
        mockItems1,
        vi.fn(),
        0,
        'option1',
        'notOriginal'
      )
    })
    
    // Add second option for different card
    const mockItems2 = [
      { _id: '2', userLangCard: 'card2', chosen: false },
    ]
    
    act(() => {
      result.current.handleButtonClick(
        mockItems2, 
        vi.fn(),
        0,
        'option2',
        'notOriginal'
      )
    })
    
    // Replace first option with new choice
    act(() => {
      result.current.handleButtonClick(
        mockItems1,
        vi.fn(), 
        0,
        'updatedOption1',
        'notOriginal'
      )
    })
    
    // Should have both options, with updated first option
    expect(result.current.chosenOptions).toEqual([
      {
        _id: '2',
        userLangCard: 'card2',
        chosenOption: 'option2'
      },
      {
        _id: '1',
        userLangCard: 'card1',
        chosenOption: 'updatedOption1'
      }
    ])
  })
})