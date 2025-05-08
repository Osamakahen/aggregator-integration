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
    freoBus?: {
      isConnected: () => boolean;
      getAccount: () => Promise<string>;
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
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
    // Check for FreoBus on load
    if (typeof window !== 'undefined' && window.freoBus && window.freoBus.isConnected()) {
      window.freoBus.getAccount().then((account: string) => {
        setAccount(account);
        setIsConnected(true);
        setConnectionStatus('connected');
      });
    }

    // Listen for FreoBus events
    const handleFreoBusConnect = async () => {
      if (window.freoBus) {
        const account = await window.freoBus.getAccount();
        setAccount(account);
        setIsConnected(true);
        setConnectionStatus('connected');
      }
    };

    const handleFreoBusDisconnect = () => {
      setAccount(null);
      setIsConnected(false);
      setConnectionStatus('idle');
    };

    window.freoBus?.on('FREOBUS_CONNECT', handleFreoBusConnect);
    window.freoBus?.on('FREOBUS_DISCONNECT', handleFreoBusDisconnect);

    return () => {
      window.freoBus?.removeListener('FREOBUS_CONNECT', handleFreoBusConnect);
      window.freoBus?.removeListener('FREOBUS_DISCONNECT', handleFreoBusDisconnect);
    };
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.freoBus) {
      try {
        setConnectionStatus('connecting');
        setError(null);
        await window.freoBus.connect(); // Should trigger FREOBUS_CONNECT event
      } catch (error) {
        setError('Failed to connect wallet via FreoBus');
        setConnectionStatus('error');
      }
      return;
    }
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
        setError('Failed to connect wallet');
        setConnectionStatus('error');
      }
    } else {
      setError('Please install FreoWallet extension');
      setConnectionStatus('error');
    }
  };

  const disconnectWallet = () => {
    if (typeof window !== 'undefined' && window.freoBus) {
      window.freoBus.disconnect(); // Should trigger FREOBUS_DISCONNECT event
      return;
    }
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