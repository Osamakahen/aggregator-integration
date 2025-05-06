'use client';

import React, { createContext, useContext, useState } from 'react';

interface WalletContextType {
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  account: string | null;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  account: null,
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async (): Promise<void> => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.log('Please install the FreoWallet extension.');
    }
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet...');
    setIsConnected(false);
    setAccount(null);
    console.log('Wallet disconnected');
  };

  return (
    <WalletContext.Provider value={{ isConnected, connectWallet, disconnectWallet, account }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext); 