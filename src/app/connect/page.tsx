'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../context/WalletContext';

export default function ConnectWallet() {
  const router = useRouter();
  const { isFreoWallet, connectWallet, connectionStatus, error } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
      if (connectionStatus === 'connected') {
        router.push('/marketplace');
      }
    } catch (err) {
      console.error('Connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInstallClick = () => {
    window.open('https://chrome.google.com/webstore/detail/freobus-wallet', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Connect Your Wallet</h1>

        {!isFreoWallet ? (
          <div className="bg-[#2A2A2A] p-8 rounded-lg">
            <h2 className="text-2xl mb-4">FreoWallet Extension Required</h2>
            <p className="mb-6">Please install the FreoWallet extension to connect your wallet.</p>
            <button
              onClick={handleInstallClick}
              className="px-8 py-4 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFE55C] transition-colors font-semibold"
            >
              Install FreoWallet Extension
            </button>
          </div>
        ) : (
          <div className="bg-[#2A2A2A] p-8 rounded-lg">
            <h2 className="text-2xl mb-4">Connect with FreoWallet</h2>
            <p className="mb-6">Click below to connect your FreoWallet.</p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-8 py-4 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFE55C] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            {error && (
              <p className="mt-4 text-red-500">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 