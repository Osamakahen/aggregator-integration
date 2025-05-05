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
    // Check if we're in development or preview environment
    const isDevOrPreview = process.env.NODE_ENV === 'development' || 
                          process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
    
    if (isDevOrPreview) {
      console.log('Starting mock wallet connection...');
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsConnected(true);
      setAccount('0x1234567890abcdef1234567890abcdef12345678');
      console.log('Mock wallet connected successfully');
      console.log('Account:', '0x1234567890abcdef1234567890abcdef12345678');
    } else {
      console.log('Connecting to actual wallet...');
      // Production behavior will be implemented when the wallet is available
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