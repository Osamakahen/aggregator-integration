import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { WalletBridge } from './bridge';
import { WalletBridgeConfig, UnifiedSession, Account } from './types';

interface WalletContextType {
  bridge: WalletBridge | null;
  isConnected: boolean;
  accounts: string[];
  chainId: string;
  currentSession: UnifiedSession | null;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  createSession: () => Promise<UnifiedSession>;
  terminateSession: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [bridge, setBridge] = useState<WalletBridge | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [chainId, setChainId] = useState('');
  const [currentSession, setCurrentSession] = useState<UnifiedSession | null>(null);

  const handleAccountsChanged = useCallback((newAccounts: Account[]) => {
    setAccounts(newAccounts.map(a => a.address));
  }, []);

  const handleChainChanged = useCallback((newChainId: string) => {
    setChainId(newChainId);
  }, []);

  const handleConnect = useCallback(() => {
    setIsConnected(true);
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setCurrentSession(null);
  }, []);

  const handleAutoConnected = useCallback((session: UnifiedSession) => {
    setIsConnected(true);
    setCurrentSession(session);
  }, []);

  useEffect(() => {
    const initBridge = async () => {
      const config: WalletBridgeConfig = {
        platformOrigin: window.location.origin,
        enableHardwareAuth: false,
        enableEIP4361: true,
        maxRetryAttempts: 5,
        backoffMultiplier: 1.5,
        initialBackoffDelay: 1000
      };
      
      const walletBridge = new WalletBridge(config);
      setBridge(walletBridge);
      
      walletBridge.on('accountsChanged', handleAccountsChanged);
      walletBridge.on('chainChanged', handleChainChanged);
      walletBridge.on('connect', handleConnect);
      walletBridge.on('disconnect', handleDisconnect);
      walletBridge.on('autoConnected', handleAutoConnected);

      // Try auto-connect
      const autoConnected = await walletBridge.autoConnect();
      if (autoConnected) {
        const accounts = await walletBridge.getAccounts();
        setAccounts(accounts.map(a => a.address));
      }
    };
    
    initBridge();
    
    return () => {
      bridge?.removeAllListeners();
    };
  }, [bridge, handleAccountsChanged, handleChainChanged, handleConnect, handleDisconnect, handleAutoConnected]);

  const connect = useCallback(async () => {
    if (!bridge) return false;
    try {
      const connected = await bridge.connect();
      if (connected) {
        const accounts = await bridge.getAccounts();
        setAccounts(accounts.map(a => a.address));
      }
      return connected;
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    }
  }, [bridge]);

  const disconnect = useCallback(async () => {
    if (!bridge) return;
    try {
      await bridge.disconnect();
      if (currentSession) {
        await bridge.terminateSession(currentSession.id);
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  }, [bridge, currentSession]);

  const createSession = useCallback(async () => {
    if (!bridge || !isConnected) {
      throw new Error('Wallet must be connected to create a session');
    }
    const session = await bridge.createUnifiedSession(Date.now().toString());
    setCurrentSession(session);
    return session;
  }, [bridge, isConnected]);

  const terminateSession = useCallback(async () => {
    if (!bridge || !currentSession) return;
    await bridge.terminateSession(currentSession.id);
    setCurrentSession(null);
  }, [bridge, currentSession]);

  const value = React.useMemo(() => ({
    bridge,
    isConnected,
    accounts,
    chainId,
    currentSession,
    connect,
    disconnect,
    createSession,
    terminateSession
  }), [bridge, isConnected, accounts, chainId, currentSession, connect, disconnect, createSession, terminateSession]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 