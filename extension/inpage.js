class FreoBusProvider {
  constructor() {
    this.isFreoWallet = true;
    this._state = {
      accounts: [],
      isConnected: false,
      chainId: null
    };
    this._listeners = new Map();
  }

  // EIP-1193 Provider Methods
  async request({ method, params }) {
    return this._sendToExtension({ method, params });
  }

  async enable() {
    return this.request({ method: 'eth_requestAccounts' });
  }

  // Event handling
  on(eventName, listener) {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName).add(listener);
  }

  removeListener(eventName, listener) {
    if (this._listeners.has(eventName)) {
      this._listeners.get(eventName).delete(listener);
    }
  }

  // Internal methods
  async _sendToExtension(message) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2);
      
      const handleResponse = (event) => {
        if (event.data?.type === 'FREOBUS_RESPONSE' && event.data?.id === id) {
          window.removeEventListener('message', handleResponse);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };

      window.addEventListener('message', handleResponse);
      window.postMessage({
        type: 'FREOBUS_REQUEST',
        id,
        payload: message
      }, '*');
    });
  }

  _emit(eventName, data) {
    if (this._listeners.has(eventName)) {
      this._listeners.get(eventName).forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // State management
  _updateState(newState) {
    this._state = { ...this._state, ...newState };
    
    // Emit events based on state changes
    if (newState.accounts) {
      this._emit('accountsChanged', newState.accounts);
    }
    if (newState.chainId) {
      this._emit('chainChanged', newState.chainId);
    }
    if (newState.isConnected !== undefined) {
      this._emit('connect', { chainId: this._state.chainId });
    }
  }
}

// Initialize provider
const provider = new FreoBusProvider();

// Inject provider into window
window.ethereum = provider;
window.freoBus = {
  isConnected: () => provider._state.isConnected,
  getAccount: async () => {
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  },
  connect: async () => {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    provider._updateState({ accounts, isConnected: true });
    return accounts[0];
  },
  disconnect: async () => {
    await provider.request({ method: 'wallet_disconnect' });
    provider._updateState({ accounts: [], isConnected: false });
  },
  on: (event, callback) => provider.on(event, callback),
  removeListener: (event, callback) => provider.removeListener(event, callback)
};

// Listen for messages from extension
window.addEventListener('message', (event) => {
  if (event.data?.type === 'FREOBUS_STATE_UPDATE') {
    provider._updateState(event.data.state);
  }
});

// Notify extension that provider is ready
window.postMessage({ type: 'FREOBUS_PROVIDER_READY' }, '*'); 