'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// (global type declarations removed; now in src/types/global.d.ts)

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isFreoWallet: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  autoConnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  isConnected: false,
  isFreoWallet: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  autoConnect: async () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFreoWallet, setIsFreoWallet] = useState(false);

  // Auto-connect logic for SSO
  const autoConnect = async () => {
    if (typeof window !== 'undefined' && window.freoBus) {
      setIsFreoWallet(true);
      try {
        if (window.freoBus.isConnected()) {
          const acc = await window.freoBus.getAccount();
          setAccount(acc);
          setIsConnected(true);
        }
      } catch (err) {
        setAccount(null);
        setIsConnected(false);
      }
    } else if (typeof window !== 'undefined' && window.ethereum) {
      setIsFreoWallet(!!window.ethereum.isFreoWallet);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        setAccount(null);
        setIsConnected(false);
      }
    }
  };

  useEffect(() => {
    autoConnect();
    // Listen for account changes (FreoWallet or MetaMask)
    if (typeof window !== 'undefined') {
      if (window.freoBus) {
        window.freoBus.on('accountsChanged', autoConnect);
        return () => window.freoBus?.removeListener('accountsChanged', autoConnect);
      } else if (window.ethereum) {
        window.ethereum.on('accountsChanged', autoConnect);
        return () => window.ethereum?.removeListener('accountsChanged', autoConnect);
      }
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.freoBus) {
      setIsFreoWallet(true);
      try {
        await window.freoBus.connect();
        const acc = await window.freoBus.getAccount();
        setAccount(acc);
        setIsConnected(true);
      } catch (error) {
        setAccount(null);
        setIsConnected(false);
      }
    } else if (typeof window !== 'undefined' && window.ethereum) {
      setIsFreoWallet(!!window.ethereum.isFreoWallet);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        setAccount(null);
        setIsConnected(false);
      }
    } else {
      setAccount(null);
      setIsConnected(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    // Optionally call window.freoBus.disconnect() if available
    if (typeof window !== 'undefined' && window.freoBus) {
      window.freoBus.disconnect?.();
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        isFreoWallet,
        connectWallet,
        disconnectWallet,
        autoConnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 