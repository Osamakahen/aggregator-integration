// Mock BroadcastChannel
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.listeners = new Set();
  }

  postMessage(message) {
    this.listeners.forEach(listener => {
      listener({ data: message });
    });
  }

  onmessage = null;

  addEventListener(type, listener) {
    if (type === 'message') {
      this.listeners.add(listener);
    }
  }

  removeEventListener(type, listener) {
    if (type === 'message') {
      this.listeners.delete(listener);
    }
  }

  close() {
    this.listeners.clear();
  }
}

global.BroadcastChannel = MockBroadcastChannel;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn()
};

global.localStorage = localStorageMock;

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://test.com'
  },
  writable: true
});

// Mock window.addEventListener
window.addEventListener = jest.fn();
window.removeEventListener = jest.fn(); 