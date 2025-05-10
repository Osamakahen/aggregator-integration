import { EventEmitter } from 'events';
import { 
  CrossDAppSession, 
  DAppPermissions, 
  SessionShareRequest, 
  SessionShareResponse,
  Account 
} from './types';

export class SessionManager extends EventEmitter {
  private sessions: Map<string, CrossDAppSession>;
  private readonly SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    super();
    this.sessions = new Map();
  }

  public async createSession(
    origin: string,
    accounts: Account[],
    chainId: string,
    permissions: DAppPermissions
  ): Promise<CrossDAppSession> {
    const sessionId = this.generateSessionId();
    const now = Date.now();

    const session: CrossDAppSession = {
      id: sessionId,
      origin,
      accounts,
      chainId,
      permissions,
      createdAt: now,
      expiresAt: now + this.SESSION_EXPIRY,
      metadata: {}
    };

    this.sessions.set(sessionId, session);
    this.emit('sessionCreated', session);
    return session;
  }

  public async shareSession(request: SessionShareRequest): Promise<SessionShareResponse> {
    const sourceSession = this.sessions.get(request.sessionId);
    if (!sourceSession) {
      return { success: false, error: 'Session not found' };
    }

    if (this.isSessionExpired(sourceSession)) {
      this.sessions.delete(request.sessionId);
      return { success: false, error: 'Session expired' };
    }

    // Create a new session for the target dApp with restricted permissions
    const targetPermissions: DAppPermissions = {
      ...sourceSession.permissions,
      ...request.permissions
    };

    const targetSession = await this.createSession(
      request.targetOrigin,
      sourceSession.accounts,
      sourceSession.chainId,
      targetPermissions
    );

    this.emit('sessionShared', {
      sourceSessionId: request.sessionId,
      targetSessionId: targetSession.id,
      targetOrigin: request.targetOrigin
    });

    return {
      success: true,
      sessionId: targetSession.id
    };
  }

  public getSession(sessionId: string): CrossDAppSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session && this.isSessionExpired(session)) {
      this.sessions.delete(sessionId);
      return undefined;
    }
    return session;
  }

  public async terminateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    this.sessions.delete(sessionId);
    this.emit('sessionTerminated', session);
    return true;
  }

  public async updateSessionPermissions(
    sessionId: string,
    permissions: Partial<DAppPermissions>
  ): Promise<CrossDAppSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session || this.isSessionExpired(session)) {
      return null;
    }

    const updatedSession: CrossDAppSession = {
      ...session,
      permissions: {
        ...session.permissions,
        ...permissions
      }
    };

    this.sessions.set(sessionId, updatedSession);
    this.emit('sessionUpdated', updatedSession);
    return updatedSession;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isSessionExpired(session: CrossDAppSession): boolean {
    return Date.now() > session.expiresAt;
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
        this.emit('sessionExpired', session);
      }
    }
  }
} 