interface Window {
  freoBus?: {
    isInstalled: boolean;
    version: string;
    connect: () => Promise<void>;
    createWallet: () => Promise<void>;
    // Add other methods as needed
  }
}

export {}; 