import { useState, useEffect, createContext, useContext } from 'react';
import { WalletBridge } from './bridge';
import { WalletBridgeConfig } from './types';

const WalletContext = createContext<{
  bridge: WalletBridge | null;
  isConnected: boolean;
  accounts: string[];
  chainId: string;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
}>({
  bridge: null,
  isConnected: false,
  accounts: [],
  chainId: '',
  connect: async () => false,
  disconnect: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [bridge, setBridge] = useState<WalletBridge | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [chainId, setChainId] = useState('');
  
  useEffect(() => {
    const initBridge = async () => {
      const config: WalletBridgeConfig = {
        platformOrigin: window.location.origin,
        enableHardwareAuth: false,
        enableEIP4361: true,
        maxRetryAttempts: 5,
        backoffMultiplier: 1.5,
        initialBackoffDelay: 1000
      };
      
      const walletBridge = new WalletBridge(config);
      await walletBridge.initialize();
      setBridge(walletBridge);
      
      // Set up event listeners
      walletBridge.on('accountsChanged', setAccounts);
      walletBridge.on('chainChanged', setChainId);
      walletBridge.on('connect', () => setIsConnected(true));
      walletBridge.on('disconnect', () => setIsConnected(false));
    };
    
    initBridge();
    
    return () => {
      // Clean up event listeners when component unmounts
      bridge?.removeAllListeners();
    };
  }, []);
  
  const connect = async () => {
    if (!bridge) return false;
    try {
      const result = await bridge.connect();
      return result;
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    }
  };
  
  const disconnect = async () => {
    if (!bridge) return;
    try {
      await bridge.disconnect();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };
  
  return (
    <WalletContext.Provider
      value={{ bridge, isConnected, accounts, chainId, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext); 