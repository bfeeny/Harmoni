import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock Web Audio API
class AudioContextMock {
  state = 'running';
  destination = {
    maxChannelCount: 2,
  };
  currentTime = 0;
  
  createGain() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
    };
  }
  
  createBufferSource() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      buffer: null,
      loop: false,
    };
  }
  
  createAnalyser() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: vi.fn(),
      getByteTimeDomainData: vi.fn(),
      smoothingTimeConstant: 0.8,
    };
  }
  
  decodeAudioData = vi.fn().mockImplementation((arrayBuffer, successCallback) => {
    const audioBuffer = {
      duration: 3.0,
      length: 132300,
      numberOfChannels: 2,
      sampleRate: 44100,
    };
    
    if (successCallback) {
      successCallback(audioBuffer);
    }
    
    return Promise.resolve(audioBuffer);
  });
  
  close = vi.fn();
}

// Mock AudioService
vi.mock('../services/AudioService', () => {
  return {
    audioService: {
      initialize: vi.fn(),
      getAudioContext: vi.fn().mockReturnValue(new AudioContextMock()),
      loadSound: vi.fn().mockResolvedValue(undefined),
      playSound: vi.fn(),
      stopSound: vi.fn(),
      stopAll: vi.fn(),
      setVolume: vi.fn(),
      getVolume: vi.fn().mockReturnValue(0.5),
      fadeOutAll: vi.fn().mockResolvedValue(undefined),
      fadeOutAndStopSound: vi.fn(),
      connectAnalyzer: vi.fn(),
      disconnectAnalyzer: vi.fn(),
      getActiveSounds: vi.fn().mockReturnValue([]),
      dispose: vi.fn(),
    },
  };
});

class AnalyserNodeMock {
  connect = vi.fn();
  disconnect = vi.fn();
  fftSize = 2048;
  frequencyBinCount = 1024;
  getByteFrequencyData = vi.fn();
  getByteTimeDomainData = vi.fn();
}

Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'AudioContext', { value: AudioContextMock });
Object.defineProperty(global, 'webkitAudioContext', { value: AudioContextMock });
Object.defineProperty(global, 'AnalyserNode', { value: AnalyserNodeMock });
Object.defineProperty(global, 'btoa', { value: (str: string) => Buffer.from(str).toString('base64') });
Object.defineProperty(global, 'atob', { value: (str: string) => Buffer.from(str, 'base64').toString() });

// Mock navigator.share for Web Share API testing
Object.defineProperty(global.navigator, 'share', {
  value: vi.fn().mockImplementation(() => Promise.resolve()),
  writable: true,
});

// Only set up clipboard mock if it's not already defined
if (!global.navigator.clipboard) {
  Object.defineProperty(global.navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    },
    configurable: true,
  });
}

// Use Vitest's own timer mocks
vi.useFakeTimers();

// Mock fetch API
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  }),
);

// Mock canvas context
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
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  scale: vi.fn(),
  translate: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn()
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});