'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      isFreoWallet?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      send: (method: string, params: unknown[]) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isFreoWallet: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  isConnected: false,
  isFreoWallet: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  connectionStatus: 'idle',
  error: null
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFreoWallet, setIsFreoWallet] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setIsFreoWallet(!!window.ethereum.isFreoWallet);
        
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            setConnectionStatus('connected');
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
          setError('Failed to check wallet status');
          setConnectionStatus('error');
        }
      }
    };

    checkWallet();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setConnectionStatus('connected');
        } else {
          setAccount(null);
          setIsConnected(false);
          setConnectionStatus('idle');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setConnectionStatus('connecting');
        setError(null);
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setError('Failed to connect wallet');
        setConnectionStatus('error');
      }
    } else {
      setError('Please install FreoWallet extension');
      setConnectionStatus('error');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setConnectionStatus('idle');
    setError(null);
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        isFreoWallet,
        connectWallet,
        disconnectWallet,
        connectionStatus,
        error
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 