"use client";

import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';

interface DAppProviderProps {
  children: React.ReactNode;
}

export const DAppProvider: React.FC<DAppProviderProps> = ({ children }) => {
  const { isConnected, account, chainId } = useWallet();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [isProviderReady, setIsProviderReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeProvider = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
          setProvider(web3Provider);
          setIsProviderReady(true);
          setError(null);
        } else {
          setError('No Web3 provider detected. Please install FreoWallet.');
          setIsProviderReady(false);
        }
      } catch (err) {
        console.error('Failed to initialize provider:', err);
        setError('Failed to initialize Web3 provider');
        setIsProviderReady(false);
      }
    };

    initializeProvider();
  }, []);

  // Handle chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // Handle account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Handle disconnect
        window.location.reload();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Provider Error</h3>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!isProviderReady) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800">Initializing Provider</h3>
        <p className="mt-2 text-sm text-yellow-600">Please wait while we set up your Web3 connection...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isConnected && account && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-medium text-green-800">Connected to FreoWallet</h3>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-green-600">
              <span className="font-medium">Account:</span> {account}
            </p>
            <p className="text-sm text-green-600">
              <span className="font-medium">Network:</span> {chainId}
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}; 