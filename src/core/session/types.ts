export interface UnifiedSession {
  id: string;
  userId: string;
  walletAddress: string;
  walletSessionId: string;
  expiry: number;
  createdAt: number;
  nonce?: number;
  chainId?: string;
}

export interface SessionProof {
  sessionId: string;
  signature: string;
  timestamp: number;
  nonce: number;
}

export interface SessionState {
  activeSession: UnifiedSession | null;
  connectedDApps: Set<string>;
  lastActivity: number;
}

export interface SessionConfig {
  maxSessionDuration: number;
  maxInactivityTime: number;
  refreshInterval: number;
  maxConcurrentSessions: number;
} 