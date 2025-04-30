import { SessionValidator } from '../validation';
import { UnifiedSession, SessionProof } from '../types';

describe('SessionValidator', () => {
  let validator: SessionValidator;
  let mockSession: UnifiedSession;
  let mockProof: SessionProof;

  beforeEach(() => {
    jest.useFakeTimers();
    validator = SessionValidator.getInstance();
    mockSession = {
      id: 'test-session',
      userId: 'user123',
      walletAddress: '0x123',
      walletSessionId: 'wallet-session-123',
      expiry: Date.now() + 3600000,
      createdAt: Date.now()
    };
    mockProof = {
      sessionId: 'test-session',
      signature: '0x123',
      timestamp: Date.now(),
      nonce: 12345
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('validateSession', () => {
    it('should return true for valid session', () => {
      const isValid = validator.validateSession(mockSession);
      expect(isValid).toBe(true);
    });

    it('should return false for expired session', () => {
      const expiredSession = {
        ...mockSession,
        expiry: Date.now() - 1000
      };
      const isValid = validator.validateSession(expiredSession);
      expect(isValid).toBe(false);
    });
  });

  describe('validateSessionProof', () => {
    it('should return true for valid proof', async () => {
      const message = 'test message';
      const isValid = await validator.validateSessionProof(mockProof, message);
      expect(isValid).toBe(true);
    });

    it('should return false for invalid signature', async () => {
      const invalidProof = {
        ...mockProof,
        signature: 'invalid-signature'
      };
      const isValid = await validator.validateSessionProof(invalidProof, 'test message');
      expect(isValid).toBe(false);
    });

    it('should return false for reused nonce', async () => {
      const message = 'test message';
      await validator.validateSessionProof(mockProof, message);
      const isValid = await validator.validateSessionProof(mockProof, message);
      expect(isValid).toBe(false);
    });
  });

  describe('generateNonce', () => {
    it('should generate unique nonces', () => {
      const nonce1 = validator.generateNonce();
      const nonce2 = validator.generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate nonces within valid range', () => {
      const nonce = validator.generateNonce();
      expect(nonce).toBeGreaterThanOrEqual(0);
      expect(nonce).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('cleanupExpiredNonces', () => {
    it('should remove expired nonces', () => {
      const nonce = validator.generateNonce();
      jest.advanceTimersByTime(6 * 60 * 1000); // Advance time by 6 minutes
      validator['cleanupExpiredNonces']();
      expect(validator['usedNonces'].has(nonce)).toBe(false);
    });
  });
}); 