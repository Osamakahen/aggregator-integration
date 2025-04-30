import { EventEmitter } from 'events';
import type { WalletContextType, Network, Account, TransactionRequest, WalletState, ConnectedSite, WalletBridgeConfig, Session, UnifiedSession, SessionProof, Port } from './types';

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

const DEFAULT_NETWORKS: Network[] = [
  {
    chainId: '1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    currencySymbol: 'ETH',
    blockExplorerUrl: 'https://etherscan.io'
  }
];

export class WalletBridge extends EventEmitter {
  private port: Port | null = null;
  private platformOrigin: string;
  private state: WalletState = {
    isUnlocked: false,
    accounts: [],
    networks: DEFAULT_NETWORKS,
    selectedNetwork: DEFAULT_NETWORKS[0],
    connectedSites: {}
  };

  constructor(config: WalletBridgeConfig) {
    super();
    this.platformOrigin = config.platformOrigin;
    this.setupMessageListeners();
  }

  private setupMessageListeners() {
    if (!this.port) return;

    this.port.onMessage.addListener((message) => {
      switch (message.type) {
        case 'accountsChanged':
          this.state.accounts = message.accounts;
          this.emit('accountsChanged', message.accounts);
          break;
        case 'networksChanged':
          this.state.networks = message.networks;
          this.emit('networksChanged', message.networks);
          break;
        case 'selectedNetworkChanged':
          this.state.selectedNetwork = message.network;
          this.emit('selectedNetworkChanged', message.network);
          break;
        case 'unlock':
          this.state.isUnlocked = true;
          this.emit('unlock');
          break;
        case 'lock':
          this.state.isUnlocked = false;
          this.emit('lock');
          break;
      }
    });
  }

  public setPort(port: Port): void {
    this.port = port;
    this.setupMessageListeners();
  }

  public async initialize(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      this.port = chrome.runtime.connect({ name: 'wallet' });
      this.setupMessageListeners();
    }
  }

  public async connect(): Promise<boolean> {
    if (this.state.isUnlocked) return true;
    
    try {
      this.state.isUnlocked = true;
      this.emit('connect');
      return true;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.state.isUnlocked) return;
    
    try {
      this.state.isUnlocked = false;
      this.state.accounts = [];
      this.emit('disconnect');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async getAccounts(): Promise<string[]> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to get accounts');
    }
    return this.state.accounts.map(account => account.address);
  }

  public async requestAccounts(): Promise<string[]> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    
    try {
      const newAccounts: Account[] = []; // Replace with actual account fetching
      this.state.accounts = newAccounts;
      return newAccounts.map(account => account.address);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async addNetwork(network: Network): Promise<void> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    
    try {
      this.state.networks.push(network);
      this.emit('networksChanged', this.state.networks);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async addAccount(account: string): Promise<void> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    
    try {
      const newAccount: Account = {
        address: account,
        name: `Account ${this.state.accounts.length + 1}`,
        index: this.state.accounts.length,
        balances: {}
      };
      this.state.accounts.push(newAccount);
      this.emit('accountsChanged', this.state.accounts);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async selectAccount(account: string): Promise<void> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    
    try {
      const selectedAccount = this.state.accounts.find(a => a.address === account);
      if (!selectedAccount) {
        throw new Error('Account not found');
      }
      this.emit('accountsChanged', this.state.accounts);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async selectNetwork(network: Network): Promise<void> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    
    try {
      this.state.selectedNetwork = network;
      this.emit('selectedNetworkChanged', network);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async unlock(): Promise<void> {
    try {
      this.state.isUnlocked = true;
      this.emit('unlock');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async sendMessage(message: any): Promise<any> {
    if (!this.port) {
      throw new Error('Port not initialized');
    }

    return new Promise((resolve, reject) => {
      this.port!.postMessage(message);
      const listener = (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
        this.port!.onMessage.removeListener(listener);
      };
      this.port!.onMessage.addListener(listener);
    });
  }

  public async registerSessionLink(walletSessionId: string, platformSessionId: string): Promise<void> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    
    await this.sendMessage({
      type: 'registerSessionLink',
      walletSessionId,
      platformSessionId
    });
  }

  public async validateSession(sessionId: string): Promise<boolean> {
    if (!this.state.isUnlocked) return false;
    
    try {
      const response = await this.sendMessage({
        type: 'validateSession',
        sessionId
      });
      return response.valid;
    } catch (error) {
      return false;
    }
  }

  public async refreshSession(sessionId: string, newExpiry: number): Promise<void> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    
    await this.sendMessage({
      type: 'refreshSession',
      sessionId,
      expiry: newExpiry
    });
  }

  public async terminateSession(sessionId: string): Promise<void> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    
    await this.sendMessage({
      type: 'terminateSession',
      sessionId
    });
  }

  public async signMessage(message: string): Promise<string> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    
    const response = await this.sendMessage({
      type: 'signMessage',
      message
    });
    return response.signature;
  }

  public removeAllListeners(event?: string | symbol): this {
    if (this.port) {
      this.port.onDisconnect.removeListener(() => {});
    }
    return super.removeAllListeners(event);
  }
} 