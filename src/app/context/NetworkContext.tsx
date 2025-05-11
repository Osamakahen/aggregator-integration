'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface NetworkContextType {
  chainId: string | null;
  switchNetwork: (chainId: string) => Promise<void>;
}

interface SwitchNetworkError extends Error {
  code: number;
}

const NetworkContext = createContext<NetworkContextType>({
  chainId: null,
  switchNetwork: async () => {},
});

export const useNetwork = () => useContext(NetworkContext);

// Utility to ensure chainId is hex
function toHexChainId(chainId: string | number) {
  if (typeof chainId === 'number') return '0x' + chainId.toString(16);
  if (typeof chainId === 'string' && chainId.startsWith('0x')) return chainId;
  return '0x' + parseInt(chainId, 10).toString(16);
}

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chainId, setChainId] = useState<string | null>(null);

  useEffect(() => {
    const checkNetwork = async () => {
      if (typeof window !== 'undefined') {
        console.log('window.ethereum at detection:', window.ethereum);
        if (window.ethereum) {
          try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (typeof chainId === 'string') {
              setChainId(chainId);
            }
          } catch (error) {
            console.error('Error getting chain ID:', error);
          }
        }
      }
    };

    checkNetwork();

    const ethereum = window.ethereum;
    if (ethereum) {
      const handleChainChanged = (newChainId: unknown) => {
        if (typeof newChainId === 'string') {
          setChainId(newChainId);
        }
      };

      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const switchNetwork = async (targetChainId: string) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHexChainId(targetChainId) }],
      });
    } catch (error) {
      const switchError = error as SwitchNetworkError;
      if (switchError.code === 4902) {
        // Chain not added to wallet
        console.error('This network needs to be added to your wallet');
      } else {
        console.error('Error switching network:', error);
      }
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        chainId,
        switchNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}; 