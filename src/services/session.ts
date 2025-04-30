import { WalletBridge } from '../wallet/bridge';
import { WalletBridgeConfig } from '../wallet/types';

export interface UnifiedSession {
  platformSessionId: string;
  walletSessionId: string;
  unifiedSessionExpiry: number;
  userId: string;
  walletAddress: string;
}

export class UnifiedSessionService {
  private walletBridge: WalletBridge;
  private sessions: Map<string, UnifiedSession> = new Map();
  
  constructor(config: WalletBridgeConfig) {
    this.walletBridge = new WalletBridge(config);
  }
  
  async initialize(): Promise<boolean> {
    return this.walletBridge.connect();
  }
  
  async createUnifiedSession(userId: string, walletAddress: string): Promise<UnifiedSession> {
    // Generate unique session IDs
    const platformSessionId = this.generateSessionId();
    const walletSessionId = this.generateSessionId();
    
    // Create unified session
    const session: UnifiedSession = {
      platformSessionId,
      walletSessionId,
      unifiedSessionExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      userId,
      walletAddress
    };
    
    // Store the session
    this.sessions.set(platformSessionId, session);
    
    // Link the sessions with a cryptographic proof
    const linkingProof = await this.generateSessionLinkProof(
      platformSessionId,
      walletSessionId,
      userId,
      walletAddress
    );
    
    // Register the linking in the wallet bridge
    this.walletBridge.registerSessionLink(
      walletSessionId,
      platformSessionId
    );
    
    return session;
  }
  
  async validateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    // Check if session has expired
    if (Date.now() > session.unifiedSessionExpiry) {
      this.sessions.delete(sessionId);
      return false;
    }
    
    // Validate session with wallet bridge
    return this.walletBridge.validateSession(session.walletSessionId);
  }
  
  async refreshSession(sessionId: string): Promise<UnifiedSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Refresh the session expiry
    const newExpiry = Date.now() + 24 * 60 * 60 * 1000;
    session.unifiedSessionExpiry = newExpiry;
    
    // Refresh the wallet session
    this.walletBridge.refreshSession(session.walletSessionId, newExpiry);
    
    return session;
  }
  
  async terminateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    // Terminate the wallet session
    await this.walletBridge.terminateSession(session.walletSessionId);
    
    // Remove the session
    this.sessions.delete(sessionId);
  }
  
  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substring(2, 15);
  }
  
  private async generateSessionLinkProof(
    platformSessionId: string,
    walletSessionId: string,
    userId: string,
    walletAddress: string
  ): Promise<string> {
    // In a real implementation, this would use proper cryptographic signing
    const message = `Link platform session ${platformSessionId} for user ${userId} with wallet session ${walletSessionId} for address ${walletAddress}`;
    return await this.walletBridge.signMessage(message);
  }
} 