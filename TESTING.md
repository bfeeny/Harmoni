# Testing in Harmoni

This document provides an overview of the testing approach used in the Harmoni project.

## Testing Framework

Harmoni uses the following testing tools:

- **Vitest**: Fast and lightweight test runner compatible with Vite and React
- **React Testing Library**: Testing utilities for React components
- **jsdom**: DOM implementation for Node.js used in the tests
- **@testing-library/user-event**: Library for simulating user events

## Test Types

The project includes the following types of tests:

### Unit Tests

- Testing individual functions and utilities
- Located in `*.test.ts` files alongside the implementation files
- Focus on isolated behavior without external dependencies

### Component Tests

- Testing React components in isolation
- Located in `*.test.tsx` files alongside the component files
- Mock external dependencies and services

### Integration Tests

- Testing interactions between multiple components
- Focus on user flows and feature completeness
- Tests timer fade-out, sound mixing, and other key features

## Mock Implementations

The tests use mocks for several browser APIs that are not available in Node.js:

- Web Audio API (AudioContext, GainNode, etc.)
- LocalStorage
- Web Share API
- Clipboard API
- Canvas API

## Running Tests

To run the tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Common Testing Challenges and Solutions

### Web Audio API Mocking

The Web Audio API presents several challenges for testing:

1. **AudioContext**: Mocked in `setup.ts` with a custom implementation providing all necessary methods.

2. **Visualization**: The AudioContext.createAnalyser() method returns a mocked analyzer that supports:
   - frequencyBinCount
   - getByteFrequencyData
   - getByteTimeDomainData

3. **GainNode**: Mocked with volume control methods.

### Canvas API Mocking

The HTML5 Canvas API requires a thorough mock implementation including:

```javascript
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn()
}));
```

### Asynchronous Testing

Strategies for testing asynchronous code:

1. **Timer Mocking**: Use `vi.useFakeTimers()` and `vi.advanceTimersByTime()` to control time.
2. **Promise Resolution**: When testing promise-based code, use `await` or `waitFor` from React Testing Library.
3. **Resolved Test Timeout**: Set `testTimeout: 20000` in `vitest.config.ts` for longer-running tests.

## Test Coverage

Test coverage information is not currently collected but can be enabled by adding the `--coverage` flag to the test command.

## Future Improvements

- Fix failing tests
- Add more comprehensive tests for edge cases
- Add end-to-end tests using a tool like Cypress or Playwright
- Set up continuous integration to run tests on each commit