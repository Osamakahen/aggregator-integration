import { EventEmitter } from 'events';
import { UnifiedSession } from '../wallet/types';

interface CrossDAppMessage {
  type: 'SESSION_UPDATE' | 'SESSION_TERMINATE' | 'SESSION_VALIDATE';
  sessionId: string;
  origin: string;
  data?: Record<string, unknown>;
}

interface PortMessage {
  type: string;
  id?: string;
  accounts?: Account[];
  network?: Network;
  origin?: string;
  connection?: ConnectedSite;
  success?: boolean;
  error?: unknown;
  [key: string]: unknown;
}

interface Account {
  address: string;
  name?: string;
}

interface Network {
  chainId: string;
  name: string;
  rpcUrl: string;
}

interface ConnectedSite {
  chainId: string;
  accounts: string[];
  lastConnected: number;
}

interface State {
  accounts: Account[];
  selectedNetwork?: Network;
  connectedSites: Record<string, ConnectedSite>;
}

interface Port {
  onMessage: {
    addListener: (listener: (message: PortMessage) => void) => void;
    removeListener: (listener: (message: PortMessage) => void) => void;
  };
  onDisconnect: {
    addListener: (listener: () => void) => void;
  };
  postMessage: (message: Record<string, unknown>) => void;
}

export class CrossDAppSessionManager extends EventEmitter {
  private static instance: CrossDAppSessionManager;
  private broadcastChannel: BroadcastChannel;
  private activeSession: UnifiedSession | null = null;
  private connectedDApps: Set<string> = new Set();
  private port: Port | null = null;
  private messageHandlers: Map<string, (message: PortMessage) => Promise<Record<string, unknown>>> = new Map();
  private state: State = {
    accounts: [],
    connectedSites: {}
  };
  private chainId: string = '';

  private constructor() {
    super();
    this.broadcastChannel = new BroadcastChannel('freobus_session_channel');
    this.setupMessageHandlers();
  }

  public static getInstance(): CrossDAppSessionManager {
    if (!CrossDAppSessionManager.instance) {
      CrossDAppSessionManager.instance = new CrossDAppSessionManager();
    }
    return CrossDAppSessionManager.instance;
  }

  private setupMessageHandlers(): void {
    this.broadcastChannel.onmessage = (event: MessageEvent<CrossDAppMessage>) => {
      const { type, sessionId, origin, data } = event.data;
      
      switch (type) {
        case 'SESSION_UPDATE':
          this.handleSessionUpdate(sessionId, origin, data);
          break;
        case 'SESSION_TERMINATE':
          this.handleSessionTerminate(sessionId, origin);
          break;
        case 'SESSION_VALIDATE':
          this.handleSessionValidate(sessionId, origin);
          break;
      }
    };

    window.addEventListener('beforeunload', () => {
      this.broadcastChannel.close();
    });

    this.messageHandlers.set('accountsChanged', async (message: PortMessage) => {
      try {
        if (message.accounts) {
          this.state.accounts = message.accounts;
          this.emit('accountsChanged', message.accounts);
        }
        return { success: true };
      } catch (error) {
        this.emit('error', error);
        return { success: false, error };
      }
    });

    this.messageHandlers.set('networkChanged', async (message: PortMessage) => {
      try {
        if (message.network) {
          this.state.selectedNetwork = message.network;
          this.chainId = message.network.chainId;
          this.emit('chainChanged', message.network.chainId);
        }
        return { success: true };
      } catch (error) {
        this.emit('error', error);
        return { success: false, error };
      }
    });

    this.messageHandlers.set('connect', async (message: PortMessage) => {
      try {
        const origin = message.origin || 'unknown';
        if (message.connection) {
          this.state.connectedSites[origin] = message.connection;
          this.emit('connect');
        }
        return { success: true };
      } catch (error) {
        this.emit('error', error);
        return { success: false, error };
      }
    });

    this.messageHandlers.set('disconnect', async (message: PortMessage) => {
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

  public setupPortConnection(port: Port): void {
    this.setPort(port);
    
    port.onMessage.addListener(async (message: PortMessage) => {
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

  public async sendMessage(message: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.port) {
      throw new Error('Port not initialized');
    }

    return new Promise((resolve) => {
      const messageId = Math.random().toString(36).substring(2, 15);
      const responseHandler = (response: PortMessage) => {
        if (response.id === messageId && this.port) {
          this.port.onMessage.removeListener(responseHandler);
          resolve(response);
        }
      };

      if (this.port) {
        this.port.onMessage.addListener(responseHandler);
        this.port.postMessage({ ...message, id: messageId });
      }
    });
  }

  public async registerDApp(origin: string, session: UnifiedSession): Promise<void> {
    this.connectedDApps.add(origin);
    this.activeSession = session;
    
    this.broadcastMessage({
      type: 'SESSION_UPDATE',
      sessionId: session.id,
      origin,
      data: { timestamp: Date.now() }
    });

    this.emit('dAppRegistered', { origin, session });
  }

  public async unregisterDApp(origin: string): Promise<void> {
    this.connectedDApps.delete(origin);
    
    if (this.activeSession) {
      this.broadcastMessage({
        type: 'SESSION_TERMINATE',
        sessionId: this.activeSession.id,
        origin
      });
    }

    this.emit('dAppUnregistered', origin);
  }

  public async validateSession(sessionId: string, origin: string): Promise<boolean> {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      return false;
    }

    const isValid = this.activeSession.expiry > Date.now();
    if (!isValid) {
      await this.terminateSession(sessionId);
      return false;
    }

    this.broadcastMessage({
      type: 'SESSION_VALIDATE',
      sessionId,
      origin
    });

    return true;
  }

  public async terminateSession(sessionId: string): Promise<void> {
    if (this.activeSession?.id === sessionId) {
      this.activeSession = null;
      this.connectedDApps.clear();
      
      this.broadcastMessage({
        type: 'SESSION_TERMINATE',
        sessionId,
        origin: window.location.origin
      });

      this.emit('sessionTerminated', sessionId);
    }
  }

  private handleSessionUpdate(sessionId: string, origin: string, data?: Record<string, unknown>): void {
    if (this.activeSession?.id === sessionId) {
      this.connectedDApps.add(origin);
      this.emit('sessionUpdated', { sessionId, origin, data });
    }
  }

  private handleSessionTerminate(sessionId: string, origin: string): void {
    if (this.activeSession?.id === sessionId) {
      this.connectedDApps.delete(origin);
      if (this.connectedDApps.size === 0) {
        this.activeSession = null;
      }
      this.emit('sessionTerminated', sessionId);
    }
  }

  private handleSessionValidate(sessionId: string, origin: string): void {
    if (this.activeSession?.id === sessionId) {
      this.emit('sessionValidated', { sessionId, origin });
    }
  }

  private broadcastMessage(message: CrossDAppMessage): void {
    this.broadcastChannel.postMessage(message);
  }

  public getConnectedDApps(): string[] {
    return Array.from(this.connectedDApps);
  }

  public getActiveSession(): UnifiedSession | null {
    return this.activeSession;
  }

  public updateActivity(): void {
    if (this.activeSession) {
      this.activeSession.expiry = Date.now() + 24 * 60 * 60 * 1000; // Extend by 24 hours
    }
  }

  private setPort(port: Port): void {
    this.port = port;
  }

  private async handleMessage(message: PortMessage): Promise<Record<string, unknown>> {
    const handler = this.messageHandlers.get(message.type);
    if (!handler) {
      throw new Error(`No handler found for message type: ${message.type}`);
    }
    return handler(message);
  }
} 