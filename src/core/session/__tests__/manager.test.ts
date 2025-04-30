import { SessionManager } from '../manager';
import { UnifiedSession } from '../types';

describe('SessionManager', () => {
  let manager: SessionManager;
  let mockSession: UnifiedSession;

  beforeEach(() => {
    jest.useFakeTimers();
    // Reset the singleton instance
    (SessionManager as any).instance = null;
    manager = SessionManager.getInstance({
      maxConcurrentSessions: 1 // Set max sessions to 1 for testing
    });
    mockSession = {
      id: 'test-session',
      userId: 'user123',
      walletAddress: '0x123',
      walletSessionId: 'wallet-session-123',
      expiry: Date.now() + 3600000,
      createdAt: Date.now()
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('registerDApp', () => {
    it('should register a dApp and update session state', async () => {
      const origin = 'https://test-dapp.com';
      await manager.registerDApp(origin, mockSession);

      expect(manager.getConnectedDApps()).toContain(origin);
      expect(manager.getActiveSession()).toEqual(mockSession);
    });

    it('should throw error when max concurrent sessions reached', async () => {
      await manager.registerDApp('https://dapp1.com', mockSession);
      
      await expect(
        manager.registerDApp('https://dapp2.com', mockSession)
      ).rejects.toThrow('Maximum concurrent sessions reached');
    });
  });

  describe('unregisterDApp', () => {
    it('should unregister a dApp and update state', async () => {
      const origin = 'https://test-dapp.com';
      await manager.registerDApp(origin, mockSession);
      await manager.unregisterDApp(origin);

      expect(manager.getConnectedDApps()).not.toContain(origin);
    });
  });

  describe('validateSession', () => {
    it('should return true for valid session', async () => {
      const origin = 'https://test-dapp.com';
      await manager.registerDApp(origin, mockSession);

      const isValid = await manager.validateSession(mockSession.id, origin);
      expect(isValid).toBe(true);
    });

    it('should return false for invalid session', async () => {
      const isValid = await manager.validateSession('invalid-session', 'https://test-dapp.com');
      expect(isValid).toBe(false);
    });
  });

  describe('terminateSession', () => {
    it('should terminate session and clear state', async () => {
      const origin = 'https://test-dapp.com';
      await manager.registerDApp(origin, mockSession);
      await manager.terminateSession(mockSession.id);

      expect(manager.getActiveSession()).toBeNull();
      expect(manager.getConnectedDApps()).toHaveLength(0);
    });
  });

  describe('activity monitoring', () => {
    it('should update last activity timestamp', () => {
      const initialTime = Date.now();
      jest.advanceTimersByTime(1000); // Advance time by 1 second
      manager.updateActivity();
      
      expect(manager['state'].lastActivity).toBeGreaterThan(initialTime);
    });

    it('should terminate session on inactivity', async () => {
      const origin = 'https://test-dapp.com';
      await manager.registerDApp(origin, mockSession);
      
      jest.advanceTimersByTime(31 * 60 * 1000); // Advance time by 31 minutes
      expect(manager.getActiveSession()).toBeNull();
    });
  });
}); 