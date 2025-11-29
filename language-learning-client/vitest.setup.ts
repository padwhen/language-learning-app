import '@testing-library/jest-dom';
// Mock canvas for lottie-web and any canvas usage in jsdom
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.HTMLCanvasElement.prototype.getContext = function () {
    return {
      fillStyle: '',
      drawImage: () => {},
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => [],
      setTransform: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
    } as any
  }
}
