import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoPlay } from '@/state/hooks/useAutoPlay';

describe('useAutoPlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should not set interval when autoPlay is false', () => {
    const setIsFlipped = vi.fn();
    const setCurrentCardIndex = vi.fn();
    const setAutoPlay = vi.fn();
    
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    
    renderHook(() => 
      useAutoPlay(
        false, 
        false, 
        0, 
        5, 
        setIsFlipped, 
        setCurrentCardIndex, 
        setAutoPlay
      )
    );
    
    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(setIsFlipped).not.toHaveBeenCalled();
    expect(setCurrentCardIndex).not.toHaveBeenCalled();
    expect(setAutoPlay).not.toHaveBeenCalled();
  });

  it('should set interval when autoPlay is true', () => {
    const setIsFlipped = vi.fn();
    const setCurrentCardIndex = vi.fn();
    const setAutoPlay = vi.fn();
    
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    
    renderHook(() => 
      useAutoPlay(
        true, 
        false, 
        0, 
        5, 
        setIsFlipped, 
        setCurrentCardIndex, 
        setAutoPlay
      )
    );
    
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
  });

  it('should flip card when not flipped and not on last card', () => {
    const setIsFlipped = vi.fn();
    const setCurrentCardIndex = vi.fn();
    const setAutoPlay = vi.fn();
    
    renderHook(() => 
      useAutoPlay(
        true, 
        false, 
        0, 
        5, 
        setIsFlipped, 
        setCurrentCardIndex, 
        setAutoPlay
      )
    );
    
    vi.advanceTimersByTime(2000);
    
    expect(setIsFlipped).toHaveBeenCalledWith(true);
    expect(setCurrentCardIndex).not.toHaveBeenCalled();
    expect(setAutoPlay).not.toHaveBeenCalled();
  });

  it('should advance to next card when flipped and not on last card', () => {
    const setIsFlipped = vi.fn();
    const setCurrentCardIndex = vi.fn();
    const setAutoPlay = vi.fn();
    
    renderHook(() => 
      useAutoPlay(
        true, 
        true, 
        0, 
        5, 
        setIsFlipped, 
        setCurrentCardIndex, 
        setAutoPlay
      )
    );
    
    vi.advanceTimersByTime(2000);
    
    expect(setIsFlipped).toHaveBeenCalledWith(false);
    expect(setCurrentCardIndex).toHaveBeenCalled();
    expect(setAutoPlay).not.toHaveBeenCalled();
  });

  it('should flip card when not flipped and on last card', () => {
    const setIsFlipped = vi.fn();
    const setCurrentCardIndex = vi.fn();
    const setAutoPlay = vi.fn();
    
    renderHook(() => 
      useAutoPlay(
        true, 
        false, 
        4, 
        5, 
        setIsFlipped, 
        setCurrentCardIndex, 
        setAutoPlay
      )
    );
    
    vi.advanceTimersByTime(2000);
    
    expect(setIsFlipped).toHaveBeenCalledWith(true);
    expect(setCurrentCardIndex).not.toHaveBeenCalled();
    expect(setAutoPlay).not.toHaveBeenCalled();
  });

  it('should stop autoPlay when flipped and on last card', () => {
    const setIsFlipped = vi.fn();
    const setCurrentCardIndex = vi.fn();
    const setAutoPlay = vi.fn();
    
    renderHook(() => 
      useAutoPlay(
        true, 
        true, 
        4, 
        5, 
        setIsFlipped, 
        setCurrentCardIndex, 
        setAutoPlay
      )
    );
    
    vi.advanceTimersByTime(2000);
    
    expect(setIsFlipped).not.toHaveBeenCalledWith(false);
    expect(setCurrentCardIndex).not.toHaveBeenCalled();
    expect(setAutoPlay).toHaveBeenCalledWith(false);
  });

  it('should clear interval on unmount', () => {
    const setIsFlipped = vi.fn();
    const setCurrentCardIndex = vi.fn();
    const setAutoPlay = vi.fn();
    
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => 
      useAutoPlay(
        true, 
        false, 
        0, 
        5, 
        setIsFlipped, 
        setCurrentCardIndex, 
        setAutoPlay
      )
    );
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should update when autoPlay is toggled', () => {
    const setIsFlipped = vi.fn();
    const setCurrentCardIndex = vi.fn();
    const setAutoPlay = vi.fn();
    
    const { rerender } = renderHook(
      ({ autoPlay }) => useAutoPlay(
        autoPlay, 
        false, 
        0, 
        5, 
        setIsFlipped, 
        setCurrentCardIndex, 
        setAutoPlay
      ),
      { initialProps: { autoPlay: false } }
    );
    
    expect(setIsFlipped).not.toHaveBeenCalled();
    
    rerender({ autoPlay: true });
    vi.advanceTimersByTime(2000);
    
    expect(setIsFlipped).toHaveBeenCalledWith(true);
  });
});