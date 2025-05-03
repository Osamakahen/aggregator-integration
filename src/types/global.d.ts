declare global {
  interface Window {
    ethereum?: {
      isFreoWallet?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      send: (method: string, params: unknown[]) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
    freoBus?: {
      isConnected: () => boolean;
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      getAccount: () => Promise<string>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export {}; 