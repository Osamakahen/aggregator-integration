import { EventEmitter } from 'events';
import { BroadcastChannel } from 'broadcast-channel';
import { UnifiedSession, SessionState, SessionConfig } from './types';
import { SessionValidator } from './validation';

type MessageType = 'SESSION_UPDATE' | 'SESSION_TERMINATE' | 'SESSION_VALIDATE';

interface CrossDAppMessage {
  type: MessageType;
  sessionId: string;
  origin: string;
  data?: Record<string, unknown>;
  signature?: string;
  nonce?: number;
}

export class SessionManager extends EventEmitter {
  private static instance: SessionManager;
  private broadcastChannel: BroadcastChannel;
  private state: SessionState;
  private validator: SessionValidator;
  private config: SessionConfig;
  private activityMonitor: NodeJS.Timeout | null = null;

  private constructor(config: Partial<SessionConfig> = {}) {
    super();
    this.validator = SessionValidator.getInstance();
    this.config = {
      maxSessionDuration: 24 * 60 * 60 * 1000, // 24 hours
      maxInactivityTime: 30 * 60 * 1000, // 30 minutes
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      maxConcurrentSessions: 5,
      ...config
    };
    
    this.state = {
      activeSession: null,
      connectedDApps: new Set(),
      lastActivity: Date.now()
    };

    this.broadcastChannel = new BroadcastChannel('freobus_session_channel');
    this.setupMessageHandlers();
    this.setupActivityMonitor();
  }

  public static getInstance(config?: Partial<SessionConfig>): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager(config);
    }
    return SessionManager.instance;
  }

  private setupMessageHandlers(): void {
    this.broadcastChannel.onmessage = async (event: MessageEvent<CrossDAppMessage>) => {
      const { type, sessionId, origin, data } = event.data;
      
      if (!await this.validateMessage(event.data)) {
        this.emit('invalidMessage', { origin, type });
        return;
      }

      switch (type) {
        case 'SESSION_UPDATE':
          await this.handleSessionUpdate(sessionId, origin, data);
          break;
        case 'SESSION_TERMINATE':
          await this.handleSessionTerminate(sessionId, origin);
          break;
        case 'SESSION_VALIDATE':
          await this.handleSessionValidate(sessionId, origin);
          break;
      }
    };

    window.addEventListener('beforeunload', () => {
      this.broadcastChannel.close();
      if (this.activityMonitor) {
        clearInterval(this.activityMonitor);
      }
    });
  }

  private setupActivityMonitor(): void {
    this.activityMonitor = setInterval(() => {
      const now = Date.now();
      if (now - this.state.lastActivity > this.config.maxInactivityTime) {
        this.terminateSession(this.state.activeSession?.id || '');
      }
    }, 60000); // Check every minute
  }

  private async validateMessage(message: CrossDAppMessage): Promise<boolean> {
    if (!message.signature || !message.nonce) return false;
    
    const messageString = JSON.stringify({
      type: message.type,
      sessionId: message.sessionId,
      origin: message.origin,
      data: message.data
    });

    return this.validator.validateSessionProof({
      sessionId: message.sessionId,
      signature: message.signature,
      timestamp: Date.now(),
      nonce: message.nonce
    }, messageString);
  }

  public async registerDApp(origin: string, session: UnifiedSession): Promise<void> {
    if (this.state.connectedDApps.size >= this.config.maxConcurrentSessions) {
      throw new Error('Maximum concurrent sessions reached');
    }

    this.state.connectedDApps.add(origin);
    this.state.activeSession = session;
    this.state.lastActivity = Date.now();
    
    const nonce = this.validator.generateNonce();
    const message: CrossDAppMessage = {
      type: 'SESSION_UPDATE',
      sessionId: session.id,
      origin,
      data: { timestamp: Date.now() },
      nonce
    };

    const signature = await this.signMessage(JSON.stringify(message));
    this.broadcastMessage({ ...message, signature });

    this.emit('dAppRegistered', { origin, session });
  }

  public async unregisterDApp(origin: string): Promise<void> {
    this.state.connectedDApps.delete(origin);
    
    if (this.state.activeSession) {
      const nonce = this.validator.generateNonce();
      const message: CrossDAppMessage = {
        type: 'SESSION_TERMINATE',
        sessionId: this.state.activeSession.id,
        origin,
        nonce
      };

      const signature = await this.signMessage(JSON.stringify(message));
      this.broadcastMessage({ ...message, signature });
    }

    this.emit('dAppUnregistered', origin);
  }

  public async validateSession(sessionId: string, origin: string): Promise<boolean> {
    if (!this.state.activeSession || this.state.activeSession.id !== sessionId) {
      return false;
    }

    const isValid = this.validator.validateSession(this.state.activeSession);
    if (!isValid) {
      await this.terminateSession(sessionId);
      return false;
    }

    const nonce = this.validator.generateNonce();
    const message: CrossDAppMessage = {
      type: 'SESSION_VALIDATE',
      sessionId,
      origin,
      nonce
    };

    const signature = await this.signMessage(JSON.stringify(message));
    this.broadcastMessage({ ...message, signature });

    return true;
  }

  public async terminateSession(sessionId: string): Promise<void> {
    if (this.state.activeSession?.id === sessionId) {
      this.state.activeSession = null;
      this.state.connectedDApps.clear();
      
      const nonce = this.validator.generateNonce();
      const message: CrossDAppMessage = {
        type: 'SESSION_TERMINATE',
        sessionId,
        origin: window.location.origin,
        nonce
      };

      const signature = await this.signMessage(JSON.stringify(message));
      this.broadcastMessage({ ...message, signature });

      this.emit('sessionTerminated', sessionId);
    }
  }

  private async handleSessionUpdate(sessionId: string, origin: string, data?: Record<string, unknown>): Promise<void> {
    if (this.state.activeSession?.id === sessionId) {
      this.state.connectedDApps.add(origin);
      this.state.lastActivity = Date.now();
      this.emit('sessionUpdated', { sessionId: sessionId, origin: origin, data: data });
    }
  }

  private async handleSessionTerminate(sessionId: string, origin: string): Promise<void> {
    if (this.state.activeSession?.id === sessionId) {
      this.state.connectedDApps.delete(origin);
      if (this.state.connectedDApps.size === 0) {
        this.state.activeSession = null;
      }
      this.emit('sessionTerminated', sessionId);
    }
  }

  private async handleSessionValidate(sessionId: string, origin: string): Promise<void> {
    if (this.state.activeSession?.id === sessionId) {
      this.state.lastActivity = Date.now();
      this.emit('sessionValidated', { sessionId: sessionId, origin: origin });
    }
  }

  private broadcastMessage(message: CrossDAppMessage): void {
    this.broadcastChannel.postMessage(message);
  }

  private async signMessage(_message: string): Promise<string> {
    // Implement actual message signing with wallet
    return '0x...';
  }

  public getConnectedDApps(): string[] {
    return Array.from(this.state.connectedDApps);
  }

  public getState(): SessionState {
    return this.state;
  }

  public getActiveSession(): UnifiedSession | null {
    return this.state.activeSession;
  }

  public updateActivity(): void {
    this.state.lastActivity = Date.now();
  }
} 