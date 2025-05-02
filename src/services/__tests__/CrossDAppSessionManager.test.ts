import { CrossDAppSessionManager } from '../CrossDAppSessionManager';
import { UnifiedSession } from '../../core/session/types';

// Define types for mocking
interface MockBroadcastChannel {
  postMessage: jest.Mock;
  close: jest.Mock;
}

describe('CrossDAppSessionManager', () => {
  let sessionManager: CrossDAppSessionManager;
  let mockSession: UnifiedSession;
  let messageHandler: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    messageHandler = jest.fn();
    
    // Reset singleton instance
    CrossDAppSessionManager.resetInstance();
    
    // Mock BroadcastChannel with proper types
    const mockBroadcastChannel = jest.fn(() => ({
      postMessage: messageHandler,
      close: jest.fn()
    }));
    
    // Safely cast window and assign mock
    (window as unknown as { BroadcastChannel: typeof mockBroadcastChannel }).BroadcastChannel = mockBroadcastChannel;

    sessionManager = CrossDAppSessionManager.getInstance();
    mockSession = {
      id: 'test-session-id',
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

  describe('Session Management', () => {
    it('should register a new session', async () => {
      const origin = 'https://test-dapp.com';
      await sessionManager.registerDApp(origin, mockSession);

      expect(sessionManager.getConnectedDApps()).toContain(origin);
      expect(sessionManager.getActiveSession()).toEqual(mockSession);
    });

    it('should unregister a session', async () => {
      const origin = 'https://test-dapp.com';
      await sessionManager.registerDApp(origin, mockSession);
      await sessionManager.unregisterDApp(origin);

      expect(sessionManager.getConnectedDApps()).not.toContain(origin);
    });
  });

  describe('Cross-Origin Communication', () => {
    it('should broadcast session updates', async () => {
      const origin = 'https://test-dapp.com';
      await sessionManager.registerDApp(origin, mockSession);

      expect(messageHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SESSION_UPDATE',
          sessionId: mockSession.id,
          origin
        })
      );
    });

    it('should handle incoming messages', async () => {
      const mockMessage = {
        type: 'SESSION_UPDATE',
        sessionId: mockSession.id,
        origin: 'https://test-dapp.com',
        data: { timestamp: Date.now() }
      };

      // Simulate receiving a message
      const channel = new BroadcastChannel('test-channel');
      channel.onmessage?.({ data: mockMessage } as MessageEvent);

      expect(sessionManager.getConnectedDApps()).toContain(mockMessage.origin);
    });
  });

  describe('Error Handling', () => {
    it('should handle broadcast errors gracefully', async () => {
      const errorHandler = jest.fn();
      sessionManager.on('error', errorHandler);

      // Mock BroadcastChannel to throw with proper types
      const mockBroadcastChannelWithError = jest.fn(() => ({
        postMessage: jest.fn(() => { throw new Error('Broadcast failed'); }),
        close: jest.fn()
      }));
      
      // Safely cast window and assign mock
      (window as unknown as { BroadcastChannel: typeof mockBroadcastChannelWithError }).BroadcastChannel = mockBroadcastChannelWithError;

      const origin = 'https://test-dapp.com';
      await sessionManager.registerDApp(origin, mockSession);

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Broadcast failed'
        })
      );
    });

    it('should handle invalid messages', async () => {
      const invalidMessageHandler = jest.fn();
      sessionManager.on('invalidMessage', invalidMessageHandler);

      const channel = new BroadcastChannel('test-channel');
      channel.onmessage?.({ 
        data: { 
          type: 'INVALID_TYPE',
          sessionId: 'invalid-session',
          origin: 'https://test-dapp.com'
        }
      } as MessageEvent);

      expect(invalidMessageHandler).toHaveBeenCalled();
    });
  });

  describe('Activity Monitoring', () => {
    it('should track session activity', async () => {
      const origin = 'https://test-dapp.com';
      await sessionManager.registerDApp(origin, mockSession);

      jest.advanceTimersByTime(1000);
      sessionManager.updateActivity();

      // Verify activity was updated by checking if session is still valid
      const activeSession = sessionManager.getActiveSession();
      expect(activeSession).not.toBeNull();
      expect(activeSession?.expiry).toBeGreaterThan(Date.now());
    });

    it('should terminate inactive sessions', async () => {
      const origin = 'https://test-dapp.com';
      await sessionManager.registerDApp(origin, mockSession);

      jest.advanceTimersByTime(31 * 60 * 1000); // 31 minutes
      expect(sessionManager.getActiveSession()).toBeNull();
    });
  });
}); 