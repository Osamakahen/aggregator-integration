import { EventEmitter } from 'events';
import type { WalletConfig, Network, Account, TransactionRequest, WalletState, ConnectedSite, WalletBridgeConfig } from './types';

const DEFAULT_NETWORKS: Network[] = [
  {
    chainId: "0x1",
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/6131105f1e4c4841a297c5392effa977",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://etherscan.io"
  },
  {
    chainId: "0xaa36a7",
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/6131105f1e4c4841a297c5392effa977",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://sepolia.etherscan.io"
  }
];

export class WalletBridge extends EventEmitter {
  private platformOrigin: string;
  private config: WalletConfig;
  private state: WalletState;
  private port: chrome.runtime.Port | null = null;
  private isConnected: boolean = false;
  private accounts: string[] = [];
  private chainId: string = '';

  constructor(config: WalletBridgeConfig) {
    super();
    this.platformOrigin = config.platformOrigin;
    this.config = {
      enableHardwareAuth: config?.enableHardwareAuth ?? false,
      enableEIP4361: config?.enableEIP4361 ?? true,
      maxRetryAttempts: config?.maxRetryAttempts ?? 5,
      backoffMultiplier: config?.backoffMultiplier ?? 1.5,
      initialBackoffDelay: config?.initialBackoffDelay ?? 1000,
      autoConnect: config?.autoConnect ?? true,
      persistConnection: config?.persistConnection ?? true
    };
    this.state = {
      isUnlocked: false,
      accounts: [],
      networks: DEFAULT_NETWORKS,
      selectedNetwork: DEFAULT_NETWORKS[0],
      connectedSites: {}
    };
  }

  async initialize(): Promise<boolean> {
    try {
      // Initialize wallet connection
      this.isConnected = true;
      this.emit('connect');
      return true;
    } catch (error) {
      console.error('Failed to initialize wallet bridge:', error);
      return false;
    }
  }

  private setupMessageListeners() {
    if (!this.port) return;

    this.port.onMessage.addListener((message: any) => {
      switch (message.type) {
        case 'accountsChanged':
          this.state.accounts = message.accounts;
          this.accounts = message.accounts;
          this.emit('accountsChanged', message.accounts);
          break;
        case 'networkChanged':
          this.state.selectedNetwork = message.network;
          this.chainId = message.network.chainId;
          this.emit('chainChanged', message.network.chainId);
          break;
        case 'unlock':
          this.state.isUnlocked = true;
          this.emit('unlock');
          break;
        case 'lock':
          this.state.isUnlocked = false;
          this.emit('lock');
          break;
        case 'connect':
          this.state.connectedSites[this.platformOrigin] = message.connection;
          this.emit('connect');
          break;
        case 'disconnect':
          delete this.state.connectedSites[this.platformOrigin];
          this.emit('disconnect');
          break;
      }
    });

    this.port.onDisconnect.addListener(() => {
      this.port = null;
      this.emit('disconnect');
    });
  }

  async connect(): Promise<boolean> {
    try {
      // Implement wallet connection logic
      this.isConnected = true;
      this.accounts = ['0x123...']; // Replace with actual account
      this.chainId = '0x1'; // Replace with actual chain ID
      this.state.accounts = this.accounts;
      this.state.selectedNetwork = this.state.networks.find(n => n.chainId === this.chainId) || DEFAULT_NETWORKS[0];
      this.emit('accountsChanged', this.accounts);
      this.emit('chainChanged', this.chainId);
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.accounts = [];
    this.chainId = '';
    this.state.accounts = [];
    this.state.selectedNetwork = DEFAULT_NETWORKS[0];
    this.emit('disconnect');
  }

  async signMessage(message: string): Promise<string> {
    if (!this.isConnected) throw new Error('Wallet not connected');
    // Implement message signing
    return '0x...'; // Replace with actual signature
  }

  async signTransaction(tx: any): Promise<string> {
    if (!this.isConnected) throw new Error('Wallet not connected');
    // Implement transaction signing
    return '0x...'; // Replace with actual signed transaction
  }

  async sendTransaction(tx: any): Promise<string> {
    if (!this.isConnected) throw new Error('Wallet not connected');
    // Implement transaction sending
    return '0x...'; // Replace with actual transaction hash
  }

  async switchChain(chainId: string): Promise<boolean> {
    if (!this.isConnected) throw new Error('Wallet not connected');
    try {
      this.chainId = chainId;
      this.state.selectedNetwork = this.state.networks.find(n => n.chainId === chainId) || DEFAULT_NETWORKS[0];
      this.emit('chainChanged', chainId);
      return true;
    } catch (error) {
      console.error('Failed to switch chain:', error);
      return false;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.isConnected) throw new Error('Wallet not connected');
    // Implement balance fetching
    return '0.0'; // Replace with actual balance
  }

  async addNetwork(network: Network): Promise<void> {
    if (!this.port) throw new Error('Not connected');

    await this.sendMessage({
      type: 'addNetwork',
      network
    });
  }

  async addAccount(name?: string): Promise<Account> {
    if (!this.port) throw new Error('Not connected');

    const response = await this.sendMessage({
      type: 'addAccount',
      name
    });

    return response.account;
  }

  async selectAccount(address: string): Promise<void> {
    if (!this.port) throw new Error('Not connected');

    await this.sendMessage({
      type: 'selectAccount',
      address
    });
  }

  async isUnlocked(): Promise<boolean> {
    if (!this.port) return false;

    const response = await this.sendMessage({
      type: 'isUnlocked'
    });

    return response.isUnlocked;
  }

  async unlock(password: string): Promise<boolean> {
    if (!this.port) return false;

    const response = await this.sendMessage({
      type: 'unlock',
      password
    });

    return response.success;
  }

  async create(password: string): Promise<void> {
    if (!this.port) throw new Error('Not connected');

    await this.sendMessage({
      type: 'createWallet',
      password
    });
  }

  private async sendMessage(message: any): Promise<any> {
    if (!this.port) throw new Error('Not connected to extension');

    return new Promise((resolve, reject) => {
      const messageId = Date.now().toString();
      const timeout = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, 30000);

      const listener = (response: any) => {
        if (response.messageId === messageId) {
          clearTimeout(timeout);
          this.port?.onMessage.removeListener(listener);
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        }
      };

      this.port.onMessage.addListener(listener);
      this.port.postMessage({ ...message, messageId });
    });
  }
} 