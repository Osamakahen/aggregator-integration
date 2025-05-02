import { utils } from 'ethers';
import { UnifiedSession, SessionProof } from './types';

export class SessionValidator {
  private static instance: SessionValidator;
  private usedNonces: Set<number> = new Set();
  private nonceExpiryTime: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cleanupExpiredNonces();
  }

  public static getInstance(): SessionValidator {
    if (!SessionValidator.instance) {
      SessionValidator.instance = new SessionValidator();
    }
    return SessionValidator.instance;
  }

  public validateSession(session: UnifiedSession): boolean {
    if (!session || !session.expiry) return false;
    return session.expiry > Date.now();
  }

  public async validateSessionProof(proof: SessionProof, message: string): Promise<boolean> {
    if (this.usedNonces.has(proof.nonce)) {
      return false;
    }

    try {
      await utils.verifyMessage(message, proof.signature);
      this.usedNonces.add(proof.nonce);
      setTimeout(() => this.usedNonces.delete(proof.nonce), this.nonceExpiryTime);
      return true;
    } catch {
      return false;
    }
  }

  public generateNonce(): number {
    const nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.usedNonces.add(nonce);
    setTimeout(() => this.usedNonces.delete(nonce), this.nonceExpiryTime);
    return nonce;
  }

  private cleanupExpiredNonces(): void {
    setInterval(() => {
      const now = Date.now();
      Array.from(this.usedNonces).forEach(nonce => {
        if (now - nonce > this.nonceExpiryTime) {
          this.usedNonces.delete(nonce);
        }
      });
    }, 60000); // Cleanup every minute
  }
} 