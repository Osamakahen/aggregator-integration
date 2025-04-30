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
  to?: string;
  from: string;
  nonce?: number;
  data?: string;
  value?: string | number;
  gasLimit?: string | number;
  gasPrice?: string | number;
  maxFeePerGas?: string | number;
  maxPriorityFeePerGas?: string | number;
  chainId: string;
}

export interface FreoWalletIntegration {
  isConnected: boolean;
  accounts: string[];
  chainId: string;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (tx: any) => Promise<string>;
  sendTransaction: (tx: any) => Promise<string>;
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
  details?: any;
}

export interface WalletBridgeConfig {
  platformOrigin: string;
  enableHardwareAuth?: boolean;
  enableEIP4361?: boolean;
  maxRetryAttempts?: number;
  backoffMultiplier?: number;
  initialBackoffDelay?: number;
} 