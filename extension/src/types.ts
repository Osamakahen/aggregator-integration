export interface ProviderState {
  accounts: string[];
  isConnected: boolean;
  chainId: string | null;
}

export interface ProviderMessage {
  type: string;
  id?: string;
  payload?: {
    method: string;
    params?: unknown[];
  };
  state?: ProviderState;
  error?: string;
  result?: unknown;
}

export interface FreoBusProvider {
  isFreoWallet: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  enable: () => Promise<string[]>;
  on: (eventName: string, listener: Function) => void;
  removeListener: (eventName: string, listener: Function) => void;
  _updateState: (newState: Partial<ProviderState>) => void;
}

export interface FreoBusInterface {
  isConnected: () => boolean;
  getAccount: () => Promise<string | null>;
  connect: () => Promise<string>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: Function) => void;
  removeListener: (event: string, callback: Function) => void;
}

declare global {
  interface Window {
    ethereum: FreoBusProvider;
    freoBus: FreoBusInterface;
  }
} 