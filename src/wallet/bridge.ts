import { EventEmitter } from 'events';
import type { WalletConfig, Network, Account, TransactionRequest, WalletState, ConnectedSite, WalletBridgeConfig, Session, UnifiedSession, SessionProof, Port } from './types';

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
  private config: WalletBridgeConfig;
  private sessions: Map<string, Session>;
  private accounts: Account[] = [];
  private chainId: string = '';
  private port: Port | null = null;
  private platformOrigin: string;
  private state: WalletState = {
    isUnlocked: false,
    accounts: [],
    networks: DEFAULT_NETWORKS,
    selectedNetwork: DEFAULT_NETWORKS[0],
    connectedSites: {}
  };
  private messageHandlers: Map<string, (message: any) => Promise<any>> = new Map();

  constructor(config: WalletBridgeConfig) {
    super();
    this.config = config;
    this.sessions = new Map();
    this.platformOrigin = config.platformOrigin;
    this.setupMessageHandlers();
  }

  public setPort(port: Port): void {
    this.port = port;
  }

  public getPort(): Port | null {
    return this.port;
  }

  public getPlatformOrigin(): string {
    return this.platformOrigin;
  }

  private setupMessageHandlers() {
    this.messageHandlers.set('accountsChanged', async (message) => {
      try {
        this.state.accounts = message.accounts;
        this.accounts = message.accounts;
        this.emit('accountsChanged', message.accounts);
        return { success: true };
      } catch (error) {
        this.emit('error', error);
        return { success: false, error };
      }
    });

    this.messageHandlers.set('networkChanged', async (message) => {
      try {
        this.state.selectedNetwork = message.network;
        this.chainId = message.network.chainId;
        this.emit('chainChanged', message.network.chainId);
        return { success: true };
      } catch (error) {
        this.emit('error', error);
        return { success: false, error };
      }
    });

    this.messageHandlers.set('unlock', async () => {
      try {
        this.state.isUnlocked = true;
        this.emit('unlock');
        return { success: true };
      } catch (error) {
        this.emit('error', error);
        return { success: false, error };
      }
    });

    this.messageHandlers.set('lock', async () => {
      try {
        this.state.isUnlocked = false;
        this.emit('lock');
        return { success: true };
      } catch (error) {
        this.emit('error', error);
        return { success: false, error };
      }
    });

    this.messageHandlers.set('connect', async (message) => {
      try {
        const origin = message.origin || 'unknown';
        this.state.connectedSites[origin] = message.connection;
        this.emit('connect');
        return { success: true };
      } catch (error) {
        this.emit('error', error);
        return { success: false, error };
      }
    });

    this.messageHandlers.set('disconnect', async (message) => {
      try {
        const origin = message.origin || 'unknown';
        delete this.state.connectedSites[origin];
        this.emit('disconnect');
        return { success: true };
      } catch (error) {
        this.emit('error', error);
        return { success: false, error };
      }
    });
  }

  public async handleMessage(message: any): Promise<any> {
    const handler = this.messageHandlers.get(message.type);
    if (!handler) {
      throw new Error(`No handler found for message type: ${message.type}`);
    }
    return handler(message);
  }

  public async connect(): Promise<boolean> {
    if (this.state.isUnlocked) return true;
    
    try {
      this.state.isUnlocked = true;
      this.emit('connect');
      return true;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.state.isUnlocked) return;
    
    try {
      this.state.isUnlocked = false;
      this.accounts = [];
      this.emit('disconnect');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async getAccounts(): Promise<Account[]> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to get accounts');
    }
    return this.state.accounts;
  }

  public async requestAccounts(): Promise<Account[]> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    
    try {
      const newAccounts: Account[] = []; // Replace with actual account fetching
      this.accounts = newAccounts;
      this.state.accounts = newAccounts;
      return newAccounts;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async signMessage(message: string): Promise<string> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to sign a message');
    }

    if (!this.state.selectedAccount) {
      throw new Error('No account selected');
    }

    // TODO: Implement actual message signing
    return '0x...'; // Replace with actual signature
  }

  public async signTransaction(tx: TransactionRequest): Promise<string> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to sign a transaction');
    }

    if (!this.state.selectedAccount) {
      throw new Error('No account selected');
    }

    if (tx.chainId !== this.state.selectedNetwork.chainId) {
      throw new Error('Transaction chainId does not match selected network');
    }

    // TODO: Implement actual transaction signing
    return '0x...'; // Replace with actual signed transaction
  }

  public async sendTransaction(tx: TransactionRequest): Promise<string> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to send a transaction');
    }

    if (!this.state.selectedAccount) {
      throw new Error('No account selected');
    }

    if (tx.chainId !== this.state.selectedNetwork.chainId) {
      throw new Error('Transaction chainId does not match selected network');
    }

    // TODO: Implement actual transaction sending
    return '0x...'; // Replace with actual transaction hash
  }

  async switchChain(chainId: string): Promise<boolean> {
    if (!this.state.isUnlocked) throw new Error('Wallet not connected');
    try {
      this.chainId = chainId;
      const network = this.state.networks.find(n => n.chainId === chainId);
      if (network) {
        this.state.selectedNetwork = network;
        this.emit('chainChanged', chainId);
        return true;
      }
      return false;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async getBalance(address: string): Promise<string> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to get balance');
    }

    const account = this.state.accounts.find(a => a.address === address);
    if (!account) {
      throw new Error('Account not found');
    }

    // TODO: Implement actual balance fetching
    return account.balance || '0';
  }

  public async getNetworks(): Promise<Network[]> {
    return this.state.networks;
  }

  public async addNetwork(network: Network): Promise<void> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to add a network');
    }

    const existingNetwork = this.state.networks.find(n => n.chainId === network.chainId);
    if (existingNetwork) {
      throw new Error('Network with this chainId already exists');
    }

    this.state.networks.push(network);
    this.emit('networkAdded', network);
  }

  public async removeNetwork(chainId: string): Promise<void> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to remove a network');
    }

    const index = this.state.networks.findIndex(n => n.chainId === chainId);
    if (index === -1) {
      throw new Error('Network not found');
    }

    if (this.state.selectedNetwork.chainId === chainId) {
      throw new Error('Cannot remove the currently selected network');
    }

    this.state.networks.splice(index, 1);
    this.emit('networkRemoved', chainId);
  }

  public async selectNetwork(chainId: string): Promise<void> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to select a network');
    }

    const network = this.state.networks.find(n => n.chainId === chainId);
    if (!network) {
      throw new Error('Network not found');
    }

    this.state.selectedNetwork = network;
    this.chainId = chainId;
    this.emit('networkChanged', network);
  }

  public async addAccount(name?: string): Promise<Account> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to add an account');
    }

    const newAccount: Account = {
      address: '0x...', // Replace with actual address generation
      name: name || `Account ${this.state.accounts.length + 1}`,
      index: this.state.accounts.length,
      balances: {},
      balance: '0'
    };

    this.state.accounts.push(newAccount);
    this.emit('accountAdded', newAccount);
    return newAccount;
  }

  public async removeAccount(address: string): Promise<void> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to remove an account');
    }

    const index = this.state.accounts.findIndex(a => a.address === address);
    if (index === -1) {
      throw new Error('Account not found');
    }

    this.state.accounts.splice(index, 1);
    this.emit('accountRemoved', address);
  }

  public async selectAccount(address: string): Promise<void> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to select an account');
    }

    const account = this.state.accounts.find(a => a.address === address);
    if (!account) {
      throw new Error('Account not found');
    }

    this.state.selectedAccount = account;
    this.emit('accountSelected', account);
  }

  public async getSelectedAccount(): Promise<Account | undefined> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to get selected account');
    }
    return this.state.selectedAccount;
  }

  public async isUnlocked(): Promise<boolean> {
    return this.state.isUnlocked;
  }

  public async unlock(password: string): Promise<boolean> {
    try {
      // TODO: Implement actual password verification
      this.state.isUnlocked = true;
      this.emit('unlock');
      return true;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  public async lock(): Promise<void> {
    try {
      this.state.isUnlocked = false;
      this.emit('lock');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public async create(password: string): Promise<void> {
    try {
      // TODO: Implement actual wallet creation
      this.state.isUnlocked = true;
      this.emit('walletCreated');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  public registerSessionLink(walletSessionId: string, platformSessionId: string): void {
    this.sessions.set(walletSessionId, {
      expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      linkedTo: platformSessionId
    });
  }

  public validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    return session !== undefined && session.expiry > Date.now();
  }

  public refreshSession(sessionId: string, newExpiry: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.expiry = newExpiry;
      this.sessions.set(sessionId, session);
    }
  }

  public async terminateSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    localStorage.removeItem('freobus_current_session');
    this.persistState();
  }

  public setupPortConnection(port: Port): void {
    this.setPort(port);
    
    port.onMessage.addListener(async (message) => {
      try {
        const response = await this.handleMessage(message);
        port.postMessage({ ...response, id: message.id });
      } catch (error) {
        port.postMessage({ success: false, error, id: message.id });
      }
    });

    port.onDisconnect.addListener(() => {
      this.port = null;
      this.emit('portDisconnected');
    });
  }

  public async sendMessage(message: any): Promise<any> {
    if (!this.port) {
      throw new Error('No port connection available');
    }
    
    const port = this.port as Port;
    return new Promise((resolve, reject) => {
      const messageId = Date.now().toString();
      
      const responseHandler = (response: any) => {
        if (response.id === messageId) {
          port.onMessage.removeListener(responseHandler);
          if (response.success) {
            resolve(response);
          } else {
            reject(response.error);
          }
        }
      };
      
      port.onMessage.addListener(responseHandler);
      port.postMessage({ ...message, id: messageId });
    });
  }

  public async createUnifiedSession(platformSessionId: string): Promise<UnifiedSession> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to create a session');
    }

    const walletSessionId = Date.now().toString();
    const session: UnifiedSession = {
      id: platformSessionId,
      userId: this.state.accounts[0]?.address || '',
      walletAddress: this.state.accounts[0]?.address || '',
      walletSessionId,
      expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      createdAt: Date.now()
    };

    this.registerSessionLink(walletSessionId, platformSessionId);
    await this.persistSession(session);
    return session;
  }

  public async validateSessionProof(proof: SessionProof): Promise<boolean> {
    const session = this.sessions.get(proof.sessionId);
    if (!session) {
      return false;
    }

    if (session.expiry < Date.now()) {
      this.terminateSession(proof.sessionId);
      return false;
    }

    // TODO: Implement actual signature verification
    return true;
  }

  public async refreshUnifiedSession(sessionId: string, newExpiry: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    this.refreshSession(sessionId, newExpiry);
  }

  public async terminateUnifiedSession(sessionId: string): Promise<void> {
    this.terminateSession(sessionId);
  }

  public async getConnectedSites(): Promise<Record<string, ConnectedSite>> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to get connected sites');
    }
    return this.state.connectedSites;
  }

  public async connectSite(origin: string, chainId: string, accounts: string[]): Promise<void> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to connect a site');
    }

    this.state.connectedSites[origin] = {
      chainId,
      accounts,
      lastConnected: Date.now()
    };

    this.emit('siteConnected', { origin, chainId, accounts });
  }

  public async disconnectSite(origin: string): Promise<void> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to disconnect a site');
    }

    if (!this.state.connectedSites[origin]) {
      throw new Error('Site not connected');
    }

    delete this.state.connectedSites[origin];
    this.emit('siteDisconnected', origin);
  }

  public async updateConnectedSite(origin: string, chainId: string, accounts: string[]): Promise<void> {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to update a connected site');
    }

    if (!this.state.connectedSites[origin]) {
      throw new Error('Site not connected');
    }

    this.state.connectedSites[origin] = {
      chainId,
      accounts,
      lastConnected: Date.now()
    };

    this.emit('siteUpdated', { origin, chainId, accounts });
  }

  private async loadPersistedState(): Promise<void> {
    try {
      const persistedState = localStorage.getItem('freobus_wallet_state');
      if (persistedState) {
        const state = JSON.parse(persistedState);
        if (state.sessions) {
          this.sessions = new Map(Object.entries(state.sessions));
        }
        if (state.connectedSites) {
          this.state.connectedSites = state.connectedSites;
        }
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  private persistState(): void {
    try {
      const state = {
        sessions: Object.fromEntries(this.sessions),
        connectedSites: this.state.connectedSites
      };
      localStorage.setItem('freobus_wallet_state', JSON.stringify(state));
    } catch (error) {
      this.emit('error', error);
    }
  }

  public async autoConnect(): Promise<boolean> {
    try {
      const persistedSession = await this.getPersistedSession();
      if (persistedSession && await this.validateSession(persistedSession.id)) {
        await this.connect();
        this.emit('autoConnected', persistedSession);
        return true;
      }
      return false;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  private async getPersistedSession(): Promise<UnifiedSession | null> {
    try {
      const sessionData = localStorage.getItem('freobus_current_session');
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      return null;
    } catch (error) {
      this.emit('error', error);
      return null;
    }
  }

  public async persistSession(session: UnifiedSession): Promise<void> {
    try {
      localStorage.setItem('freobus_current_session', JSON.stringify(session));
      this.persistState();
    } catch (error) {
      this.emit('error', error);
    }
  }
} 