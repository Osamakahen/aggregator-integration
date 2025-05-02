import { ErrorRecoveryService } from '../ErrorRecoveryService';

describe('ErrorRecoveryService', () => {
  let service: ErrorRecoveryService;
  let recoveryAttemptHandler: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    recoveryAttemptHandler = jest.fn();
    
    // Reset singleton instance
    ErrorRecoveryService.resetInstance();
    service = ErrorRecoveryService.getInstance();
    service.on('recoveryAttempt', recoveryAttemptHandler);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Error Handling', () => {
    it('should handle and track errors', async () => {
      const errorHandler = jest.fn();
      service.on('errorOccurred', errorHandler);

      await service.handleError('session', 'Session expired');
      
      expect(errorHandler).toHaveBeenCalled();
      expect(service.getActiveErrors()).toHaveLength(1);
    });

    it('should clear errors', () => {
      const error = {
        type: 'session',
        message: 'Session expired'
      };

      service.handleError(error.type, error.message);
      const activeErrors = service.getActiveErrors();
      service.clearError(activeErrors[0].id);

      expect(service.getActiveErrors()).toHaveLength(0);
    });
  });

  describe('Recovery Strategies', () => {
    it('should use default recovery strategies', async () => {
      const error = {
        type: 'session',
        message: 'Session error',
        data: { sessionId: 'test-session' }
      };

      // Mock the recovery attempt to resolve after delay
      recoveryAttemptHandler.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(resolve, 100);
        });
      });

      const handleErrorPromise = service.handleError(error.type, error.message);
      
      // Fast-forward through all retries
      jest.runAllTimers();
      await handleErrorPromise;
      
      // Should attempt recovery 3 times for session errors
      expect(recoveryAttemptHandler).toHaveBeenCalledTimes(3);
    });

    it('should allow custom recovery strategies', async () => {
      const customStrategy = {
        maxRetries: 1,
        backoffMultiplier: 1,
        initialDelay: 100,
        maxDelay: 100,
        handler: jest.fn().mockResolvedValue(undefined)
      };

      service.setRecoveryStrategy('custom', customStrategy);

      const handleErrorPromise = service.handleError('custom', 'Custom error');
      
      // Fast-forward through retry
      jest.runAllTimers();
      await handleErrorPromise;
      
      // Should attempt recovery only once
      expect(recoveryAttemptHandler).toHaveBeenCalledTimes(1);
      expect(customStrategy.handler).toHaveBeenCalled();
    });
  });

  describe('Recovery Actions', () => {
    it('should attempt session recovery', async () => {
      const mockSessionManager = {
        validateSession: jest.fn().mockResolvedValue(true)
      };

      jest.mock('../CrossDAppSessionManager', () => ({
        CrossDAppSessionManager: {
          getInstance: () => mockSessionManager
        }
      }));

      const recoverySucceededHandler = jest.fn();
      service.on('recoverySucceeded', recoverySucceededHandler);

      await service.handleError('session', 'Session expired', {
        sessionId: 'test-session'
      });

      expect(recoverySucceededHandler).toHaveBeenCalled();
    });

    it('should attempt wallet recovery', async () => {
      const mockWalletBridge = {
        connect: jest.fn().mockResolvedValue(true)
      };

      const recoverySucceededHandler = jest.fn();
      service.on('recoverySucceeded', recoverySucceededHandler);

      await service.handleError('wallet', 'Wallet disconnected', {
        walletBridge: mockWalletBridge
      });

      expect(recoverySucceededHandler).toHaveBeenCalled();
      expect(mockWalletBridge.connect).toHaveBeenCalled();
    });

    it('should handle network recovery', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true
      });

      const recoverySucceededHandler = jest.fn();
      service.on('recoverySucceeded', recoverySucceededHandler);

      await service.handleError('network', 'Network disconnected');

      expect(recoverySucceededHandler).toHaveBeenCalled();
    });
  });

  describe('Error Tracking', () => {
    it('should track errors and their recovery attempts', async () => {
      const error = {
        type: 'session',
        message: 'Test error'
      };
      const handleErrorPromise = service.handleError(error.type, error.message);
      jest.runAllTimers();
      await handleErrorPromise;

      const activeErrors = service.getActiveErrors();
      expect(activeErrors).toHaveLength(1);
      expect(activeErrors[0].type).toBe(error.type);
      expect(activeErrors[0].message).toBe(error.message);
    });

    it('should clear tracked errors', async () => {
      const error = {
        type: 'session',
        message: 'Test error'
      };
      const handleErrorPromise = service.handleError(error.type, error.message);
      jest.runAllTimers();
      await handleErrorPromise;

      const activeErrors = service.getActiveErrors();
      service.clearError(activeErrors[0].id);

      expect(service.getActiveErrors()).toHaveLength(0);
    });
  });

  describe('Error Events', () => {
    it('should emit appropriate events during recovery process', async () => {
      const events = {
        errorOccurred: jest.fn(),
        recoveryAttemptFailed: jest.fn(),
        recoveryFailed: jest.fn()
      };

      service.on('errorOccurred', events.errorOccurred);
      service.on('recoveryAttemptFailed', events.recoveryAttemptFailed);
      service.on('recoveryFailed', events.recoveryFailed);

      // Mock recovery attempt to always fail
      recoveryAttemptHandler.mockRejectedValue(new Error('Recovery failed'));

      const error = {
        type: 'session',
        message: 'Test error'
      };
      const handleErrorPromise = service.handleError(error.type, error.message);
      
      // Fast-forward through all retries
      jest.runAllTimers();
      await handleErrorPromise;

      expect(events.errorOccurred).toHaveBeenCalled();
      expect(events.recoveryAttemptFailed).toHaveBeenCalled();
      expect(events.recoveryFailed).toHaveBeenCalled();
    });
  });
}); 