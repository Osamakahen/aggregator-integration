import { ProviderState, ProviderMessage, FreoBusProvider as IFreoBusProvider } from './types';

class FreoBusProvider implements IFreoBusProvider {
  public isFreoWallet: boolean;
  private _state: ProviderState;
  private _listeners: Map<string, Set<Function>>;

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
  async request({ method, params }: { method: string; params?: unknown[] }): Promise<unknown> {
    return this._sendToExtension({ method, params });
  }

  async enable(): Promise<string[]> {
    return this.request({ method: 'eth_requestAccounts' }) as Promise<string[]>;
  }

  // Event handling
  on(eventName: string, listener: Function): void {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName)!.add(listener);
  }

  removeListener(eventName: string, listener: Function): void {
    if (this._listeners.has(eventName)) {
      this._listeners.get(eventName)!.delete(listener);
    }
  }

  // Internal methods
  private async _sendToExtension(message: { method: string; params?: unknown[] }): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2);
      
      const handleResponse = (event: MessageEvent<ProviderMessage>) => {
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

  private _emit(eventName: string, data: unknown): void {
    if (this._listeners.has(eventName)) {
      this._listeners.get(eventName)!.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // State management
  _updateState(newState: Partial<ProviderState>): void {
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

  // Public getters for state
  get isConnected(): boolean {
    return this._state.isConnected;
  }

  get accounts(): string[] {
    return this._state.accounts;
  }

  get chainId(): string | null {
    return this._state.chainId;
  }
}

// Initialize provider
const provider = new FreoBusProvider();

// Inject provider into window
window.ethereum = provider;
window.freoBus = {
  isConnected: () => provider.isConnected,
  getAccount: async () => {
    const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
    return accounts[0] || null;
  },
  connect: async () => {
    const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
    provider._updateState({ accounts, isConnected: true });
    return accounts[0];
  },
  disconnect: async () => {
    await provider.request({ method: 'wallet_disconnect' });
    provider._updateState({ accounts: [], isConnected: false });
  },
  on: (event: string, callback: Function) => provider.on(event, callback),
  removeListener: (event: string, callback: Function) => provider.removeListener(event, callback)
};

// Listen for messages from extension
window.addEventListener('message', (event: MessageEvent<ProviderMessage>) => {
  if (event.data?.type === 'FREOBUS_STATE_UPDATE') {
    provider._updateState(event.data.state!);
  }
});

// Notify extension that provider is ready
window.postMessage({ type: 'FREOBUS_PROVIDER_READY' }, '*'); 