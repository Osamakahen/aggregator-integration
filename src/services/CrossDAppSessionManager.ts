import { EventEmitter } from 'events';
import { UnifiedSession } from '../wallet/types';

interface CrossDAppMessage {
  type: 'SESSION_UPDATE' | 'SESSION_TERMINATE' | 'SESSION_VALIDATE';
  sessionId: string;
  origin: string;
  data?: any;
}

export class CrossDAppSessionManager extends EventEmitter {
  private static instance: CrossDAppSessionManager;
  private broadcastChannel: BroadcastChannel;
  private activeSession: UnifiedSession | null = null;
  private connectedDApps: Set<string> = new Set();

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

  private handleSessionUpdate(sessionId: string, origin: string, data: any): void {
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
} 