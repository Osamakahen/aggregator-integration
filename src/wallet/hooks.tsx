import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { WalletBridge } from './bridge';
import { WalletContextType, Network } from './types';

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [bridge, setBridge] = useState<WalletBridge | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);

  useEffect(() => {
    const initBridge = async () => {
      const walletBridge = new WalletBridge({
        platformOrigin: window.location.origin
      });
      await walletBridge.initialize();
      setBridge(walletBridge);
      
      walletBridge.on('accountsChanged', setAccounts);
      walletBridge.on('networksChanged', setNetworks);
      walletBridge.on('selectedNetworkChanged', setSelectedNetwork);
      walletBridge.on('unlock', () => setIsUnlocked(true));
      walletBridge.on('lock', () => setIsUnlocked(false));
    };
    
    initBridge();
    
    return () => {
      bridge?.removeAllListeners();
    };
  }, [bridge]);

  const connect = async () => {
    if (!bridge) return;
    await bridge.connect();
  };

  const disconnect = async () => {
    if (!bridge) return;
    await bridge.disconnect();
  };

  const getAccounts = async () => {
    if (!bridge) return [];
    return bridge.getAccounts();
  };

  const requestAccounts = async () => {
    if (!bridge) return [];
    return bridge.requestAccounts();
  };

  const addNetwork = async (network: Network) => {
    if (!bridge) return;
    await bridge.addNetwork(network);
  };

  const addAccount = async (account: string) => {
    if (!bridge) return;
    await bridge.addAccount(account);
  };

  const selectAccount = async (account: string) => {
    if (!bridge) return;
    await bridge.selectAccount(account);
  };

  const selectNetwork = async (network: Network) => {
    if (!bridge) return;
    await bridge.selectNetwork(network);
  };

  const unlock = async () => {
    if (!bridge) return;
    await bridge.unlock();
  };

  const sendMessage = async (message: any) => {
    if (!bridge) return null;
    return bridge.sendMessage(message);
  };

  const value = React.useMemo(() => ({
    isUnlocked,
    isConnected: isUnlocked,
    chainId: selectedNetwork?.chainId || '',
    accounts,
    networks,
    selectedNetwork,
    connect,
    disconnect,
    getAccounts,
    requestAccounts,
    addNetwork,
    addAccount,
    selectAccount,
    selectNetwork,
    unlock,
    sendMessage
  }), [isUnlocked, accounts, networks, selectedNetwork]);

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