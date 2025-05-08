export interface Network {
  chainId: string;
  name: string;
  rpcUrl: string;
  currencySymbol: string;
  blockExplorerUrl: string;
}

export interface Account {
  address: string;
  name: string;
  index: number;
  balances: Record<string, string>;
  balance?: string;
}

export interface ConnectedSite {
  chainId: string;
  accounts: string[];
  lastConnected: number;
}

export interface WalletState {
  isUnlocked: boolean;
  accounts: Account[];
  networks: Network[];
  selectedNetwork: Network;
  selectedAccount?: Account;
  connectedSites: Record<string, ConnectedSite>;
}

export interface TransactionRequest {
  from: string;
  to: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  nonce?: number;
  chainId?: string;
}

export interface TransactionResponse {
  hash: string;
  from: string;
  to: string;
  value: string;
  data: string;
  gas: string;
  gasPrice: string;
  nonce: number;
  chainId: string;
}

export interface TransactionReceipt {
  hash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  contractAddress?: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  effectiveGasPrice: string;
  status: boolean;
  logs: TransactionLog[];
}

export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  blockHash: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  confirmations?: number;
  error?: string;
}

export interface FreoWalletIntegration {
  isConnected: boolean;
  accounts: string[];
  chainId: string;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (tx: TransactionRequest) => Promise<string>;
  sendTransaction: (tx: TransactionRequest) => Promise<string>;
  switchChain: (chainId: string) => Promise<boolean>;
  getBalance: (address: string) => Promise<string>;
}

export interface WalletConfig {
  enableHardwareAuth: boolean;
  enableEIP4361: boolean;
  maxRetryAttempts: number;
  backoffMultiplier: number;
  initialBackoffDelay: number;
  autoConnect: boolean;
  persistConnection: boolean;
}

export interface WalletError extends Error {
  code: string;
  details?: Record<string, unknown>;
}

export interface WalletBridgeConfig {
  platformOrigin: string;
  autoConnect?: boolean;
  persistConnection?: boolean;
  enableHardwareAuth?: boolean;
  enableEIP4361?: boolean;
  maxRetryAttempts?: number;
  backoffMultiplier?: number;
  initialBackoffDelay?: number;
}

export interface Session {
  expiry: number;
  linkedTo?: string;
}

export interface UnifiedSession {
  id: string;
  userId: string;
  walletAddress: string;
  walletSessionId: string;
  expiry: number;
  createdAt: number;
}

export interface PortMessage {
  type: string;
  payload: unknown;
}

export interface Port {
  postMessage: (message: PortMessage) => void;
  onMessage: {
    addListener: (callback: (message: PortMessage) => void) => void;
    removeListener: (callback: (message: PortMessage) => void) => void;
  };
  onDisconnect: {
    addListener: (callback: () => void) => void;
    removeListener: (callback: () => void) => void;
  };
}

export interface SessionProof {
  signature: string;
  timestamp: number;
  sessionId: string;
}

export interface CrossDAppSession {
  id: string;
  origin: string;
  accounts: Account[];
  chainId: string;
  permissions: DAppPermissions;
  createdAt: number;
  expiresAt: number;
  metadata: Record<string, any>;
}

export interface DAppPermissions {
  canSignTransactions: boolean;
  canReadAccounts: boolean;
  canSwitchNetworks: boolean;
  allowedMethods: string[];
  allowedNetworks: string[];
}

export interface SessionShareRequest {
  targetOrigin: string;
  sessionId: string;
  permissions: Partial<DAppPermissions>;
}

export interface SessionShareResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export interface DAppAdapter {
  name: string;
  version: string;
  supportedNetworks: string[];
  initialize(): Promise<void>;
  isSupported(): boolean;
  getBalance(address: string): Promise<string>;
  getTokenBalance(tokenAddress: string, address: string): Promise<string>;
  getTransactionHistory(address: string): Promise<TransactionResponse[]>;
  estimateGas(transaction: TransactionRequest): Promise<string>;
  getGasPrice(): Promise<string>;
  getNonce(address: string): Promise<number>;
}

export interface DAppAdapterConfig {
  type: 'uniswap' | 'opensea' | 'aave';
  rpcUrl: string;
  chainId: string;
  contracts: Record<string, string>;
  apiKey?: string;
}

export interface DAppAdapterFactory {
  createAdapter(config: DAppAdapterConfig): Promise<DAppAdapter>;
} 