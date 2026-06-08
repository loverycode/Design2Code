import '@testing-library/jest-dom';

// Мок для matchMedia (используем window вместо global)
(window as any).matchMedia = (window as any).matchMedia || function(query: string) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};