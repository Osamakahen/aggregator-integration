'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  [key: string]: any;
};

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isFreoWallet: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  error: string | null;
  chainId: string | null;
  balance: string | null;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  isConnected: false,
  isFreoWallet: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  connectionStatus: 'idle',
  error: null,
  chainId: null,
  balance: null
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFreoWallet, setIsFreoWallet] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Check for FreoWallet extension
  useEffect(() => {
    const checkFreoWallet = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const hasFreoWallet = !!((window.ethereum as any).isFreoWallet);
        setIsFreoWallet(hasFreoWallet);
      }
    };
    checkFreoWallet();
  }, []);

  // Helper function to update wallet state
  const updateWalletState = useCallback(async (account: string | null) => {
    if (!account) {
      setAccount(null);
      setIsConnected(false);
      setConnectionStatus('idle');
      setChainId(null);
      setBalance(null);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(account);
      
      setAccount(account);
      setIsConnected(true);
      setConnectionStatus('connected');
      setChainId(network.chainId.toString());
      setBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Error updating wallet state:', error);
      setError('Failed to update wallet state');
      setConnectionStatus('error');
    }
  }, []);

  // Handle wallet events
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        updateWalletState(null);
      } else {
        updateWalletState(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      if (account) {
        updateWalletState(account);
      }
    };

    const handleDisconnect = () => {
      updateWalletState(null);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('disconnect', handleDisconnect);
    };
  }, [account, updateWalletState]);

  // Auto-connect on load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (Array.isArray(accounts) && accounts.length > 0) {
            await updateWalletState(accounts[0]);
          } else {
            await updateWalletState(null);
          }
        } catch (error) {
          console.error('Auto-connect failed:', error);
        }
      }
    };

    checkConnection();
  }, [updateWalletState]);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setConnectionStatus('connecting');
        setError(null);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (Array.isArray(accounts) && accounts.length > 0) {
          await updateWalletState(accounts[0]);
        } else {
          setError('No accounts returned from wallet');
          setConnectionStatus('error');
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
    updateWalletState(null);
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
        error,
        chainId,
        balance
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 