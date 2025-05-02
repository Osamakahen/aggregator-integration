import { EventEmitter } from 'events';

interface ErrorRecord {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  context: {
    sessionId?: string;
    walletBridge?: {
      connect: () => Promise<boolean>;
    };
  };
  retryCount: number;
}

interface RecoveryStrategy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
}

export class ErrorRecoveryService extends EventEmitter {
  private static instance: ErrorRecoveryService;
  private errors: Map<string, ErrorRecord> = new Map();
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private isRecovering = false;

  // Add static method for testing
  public static resetInstance(): void {
    ErrorRecoveryService.instance = undefined as unknown as ErrorRecoveryService;
  }

  private constructor() {
    super();
    this.setupDefaultStrategies();
  }

  public static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  private setupDefaultStrategies(): void {
    // Session-related errors
    this.recoveryStrategies.set('session', {
      maxRetries: 3,
      backoffMultiplier: 1.5,
      initialDelay: 1000,
      maxDelay: 10000
    });

    // Network-related errors
    this.recoveryStrategies.set('network', {
      maxRetries: 5,
      backoffMultiplier: 2,
      initialDelay: 500,
      maxDelay: 15000
    });

    // Wallet connection errors
    this.recoveryStrategies.set('wallet', {
      maxRetries: 3,
      backoffMultiplier: 1.5,
      initialDelay: 2000,
      maxDelay: 20000
    });
  }

  public async handleError(type: string, message: string, context: Record<string, unknown> = {}): Promise<boolean> {
    const errorId = `${type}_${Date.now()}`;
    const error: ErrorRecord = {
      id: errorId,
      timestamp: Date.now(),
      type,
      message,
      context,
      retryCount: 0
    };

    this.errors.set(errorId, error);
    this.emit('errorOccurred', error);

    return this.attemptRecovery(error);
  }

  private async attemptRecovery(error: ErrorRecord): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(error.type);
    if (!strategy) {
      this.emit('recoveryFailed', { error, reason: 'No recovery strategy found' });
      return false;
    }

    while (error.retryCount < strategy.maxRetries) {
      try {
        const delay = Math.min(
          strategy.initialDelay * Math.pow(strategy.backoffMultiplier, error.retryCount),
          strategy.maxDelay
        );

        await this.wait(delay);
        const recovered = await this.executeRecoveryAction(error);
        
        if (recovered) {
          this.emit('recoverySucceeded', error);
          this.errors.delete(error.id);
          return true;
        }

        error.retryCount++;
      } catch (_error) {
        error.retryCount++;
        this.emit('recoveryAttemptFailed', { error, attempt: error.retryCount });
      }
    }

    this.emit('recoveryFailed', { error, reason: 'Max retries exceeded' });
    return false;
  }

  private async executeRecoveryAction(error: ErrorRecord): Promise<boolean> {
    switch (error.type) {
      case 'session':
        return this.recoverSession(error);
      case 'network':
        return this.recoverNetwork(error);
      case 'wallet':
        return this.recoverWallet(error);
      default:
        return false;
    }
  }

  private async recoverSession(error: ErrorRecord): Promise<boolean> {
    try {
      // Attempt to restore session
      const sessionManager = (await import('./CrossDAppSessionManager')).CrossDAppSessionManager.getInstance();
      if (error.context.sessionId) {
        return await sessionManager.validateSession(error.context.sessionId, window.location.origin);
      }
      return false;
    } catch {
      return false;
    }
  }

  private async recoverNetwork(error: ErrorRecord): Promise<boolean> {
    try {
      // Attempt to reconnect to network
      await new Promise(resolve => setTimeout(resolve, 1000));
      return navigator.onLine;
    } catch (_error) {
      return false;
    }
  }

  private async recoverWallet(error: ErrorRecord): Promise<boolean> {
    try {
      // Attempt to reconnect wallet
      const walletBridge = error.context.walletBridge;
      if (walletBridge) {
        return await walletBridge.connect();
      }
      return false;
    } catch {
      return false;
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getActiveErrors(): ErrorRecord[] {
    return Array.from(this.errors.values());
  }

  public clearError(errorId: string): void {
    this.errors.delete(errorId);
  }

  public setRecoveryStrategy(type: string, strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(type, strategy);
  }
} 