declare interface Window {
  freoBus?: {
    connect(): Promise<void>;
    isInstalled: boolean;
  }
} 