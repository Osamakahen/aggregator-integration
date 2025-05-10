import { ProviderState, ProviderMessage } from './types';

class BackgroundService {
  private state: ProviderState = {
    accounts: [],
    isConnected: false,
    chainId: '0x1' // Default to mainnet
  };

  private pendingRequests: Map<string, {
    resolve: (value: unknown) => void;
    reject: (reason: Error) => void;
  }> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message: ProviderMessage, sender, sendResponse) => {
      if (message.type === 'FREOBUS_REQUEST') {
        this.handleRequest(message, sender.tab?.id).then(sendResponse);
        return true; // Keep the message channel open for async response
      }
    });

    // Listen for messages from the injected provider
    chrome.runtime.onMessageExternal.addListener((message: ProviderMessage, sender, sendResponse) => {
      if (message.type === 'FREOBUS_PROVIDER_READY') {
        this.broadcastState(sender.tab?.id);
        sendResponse({ success: true });
      }
    });
  }

  private async handleRequest(message: ProviderMessage, tabId?: number): Promise<unknown> {
    if (!message.id || !message.payload) {
      throw new Error('Invalid request format');
    }

    try {
      const result = await this.processRequest(message.payload);
      this.pendingRequests.get(message.id)?.resolve(result);
      return { type: 'FREOBUS_RESPONSE', id: message.id, result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.pendingRequests.get(message.id)?.reject(new Error(errorMessage));
      return { type: 'FREOBUS_RESPONSE', id: message.id, error: errorMessage };
    } finally {
      this.pendingRequests.delete(message.id);
    }
  }

  private async processRequest(payload: { method: string; params?: unknown[] }): Promise<unknown> {
    switch (payload.method) {
      case 'eth_requestAccounts':
        return this.handleConnect();
      case 'eth_accounts':
        return this.state.accounts;
      case 'eth_chainId':
        return this.state.chainId;
      case 'wallet_disconnect':
        return this.handleDisconnect();
      default:
        throw new Error(`Method ${payload.method} not supported`);
    }
  }

  private async handleConnect(): Promise<string[]> {
    // TODO: Implement actual wallet connection logic
    const mockAccount = '0x' + '1'.repeat(40);
    this.state = {
      ...this.state,
      accounts: [mockAccount],
      isConnected: true
    };
    this.broadcastState();
    return this.state.accounts;
  }

  private async handleDisconnect(): Promise<void> {
    this.state = {
      ...this.state,
      accounts: [],
      isConnected: false
    };
    this.broadcastState();
  }

  private broadcastState(targetTabId?: number): void {
    const message: ProviderMessage = {
      type: 'FREOBUS_STATE_UPDATE',
      state: this.state
    };

    if (targetTabId) {
      chrome.tabs.sendMessage(targetTabId, message);
    } else {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, message).catch(() => {
              // Ignore errors for tabs that don't have our content script
            });
          }
        });
      });
    }
  }
}

// Initialize the background service
new BackgroundService(); 