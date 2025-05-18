import { afterEach, vi } from "vitest";
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import '@testing-library/jest-dom'

vi.mock('react-lottie', () => ({
  default: vi.fn().mockImplementation(({ height, width, isStopped, isPaused, eventListeners }) => {
    if (eventListeners && !isStopped && !isPaused) {
      const completeListener = eventListeners.find((listener: any) => listener.eventName === 'complete')
      if (completeListener) {
        setTimeout(() => completeListener.callback(), 0)
      }
    }
    return { type: 'div', props: { 'data-testid': 'lottie-mock', style: { width, height } } };
  })
}));

afterEach(() => {
    cleanup()
})