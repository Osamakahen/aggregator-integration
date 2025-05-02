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
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  isConnected: false,
  isFreoWallet: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFreoWallet, setIsFreoWallet] = useState(false);

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setIsFreoWallet(!!window.ethereum.isFreoWallet);
        
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
        }
      }
    };

    checkWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.log('Please install a Web3 wallet');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        isFreoWallet,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 