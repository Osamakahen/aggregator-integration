import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { WalletBridge } from './bridge';
import { WalletBridgeConfig } from './types';

interface WalletContextType {
  bridge: WalletBridge | null;
  isConnected: boolean;
  accounts: string[];
  chainId: string;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
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
      await walletBridge.connect();
      setBridge(walletBridge);
      
      walletBridge.on('accountsChanged', setAccounts);
      walletBridge.on('chainChanged', setChainId);
      walletBridge.on('connect', () => setIsConnected(true));
      walletBridge.on('disconnect', () => setIsConnected(false));
    };
    
    initBridge();
    
    return () => {
      bridge?.removeAllListeners();
    };
  }, [bridge]);

  const connect = async () => {
    if (!bridge) return false;
    try {
      return await bridge.connect();
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    }
  };

  const disconnect = async () => {
    if (!bridge) return;
    try {
      await bridge.disconnect();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  const value = React.useMemo(() => ({
    bridge,
    isConnected,
    accounts,
    chainId,
    connect,
    disconnect
  }), [bridge, isConnected, accounts, chainId]);

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