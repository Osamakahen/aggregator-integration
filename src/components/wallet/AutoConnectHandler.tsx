import React, { useEffect, useState } from 'react';
import { useWallet } from '../../wallet/hooks';
import { UnifiedSession } from '../../wallet/types';

interface AutoConnectHandlerProps {
  onSessionEstablished?: (session: UnifiedSession) => void;
  onSessionTerminated?: () => void;
}

export const AutoConnectHandler: React.FC<AutoConnectHandlerProps> = ({
  onSessionEstablished,
  onSessionTerminated
}) => {
  const { isConnected, currentSession, createSession, terminateSession } = useWallet();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        if (isConnected && !currentSession) {
          const session = await createSession();
          onSessionEstablished?.(session);
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, [isConnected, currentSession, createSession, onSessionEstablished]);

  useEffect(() => {
    if (!isConnected && currentSession) {
      terminateSession().then(() => {
        onSessionTerminated?.();
      });
    }
  }, [isConnected, currentSession, terminateSession, onSessionTerminated]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null;
}; 