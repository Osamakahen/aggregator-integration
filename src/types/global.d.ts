export {};

declare global {
  interface Window {
    ethereum?: {
      isFreoWallet?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      send?: (method: string, params: any[]) => Promise<any>;
      on: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
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