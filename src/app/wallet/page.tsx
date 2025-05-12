'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';

const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/freobus-wallet';

const WalletPage: React.FC = () => {
  const { account, connectWallet, isConnected } = useWallet();
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.ethereum &&
      'isFreoWallet' in window.ethereum &&
      (window.ethereum as any).isFreoWallet
    ) {
      setIsExtensionInstalled(true);
    }
  }, []);

  if (!isExtensionInstalled) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center">
        <div className="bg-[#2A2A2A] p-8 rounded-lg text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Get Your FreoWallet</h1>
          <p className="mb-6">To use wallet features, please install the FreoWallet browser extension.</p>
          <button
            className="px-8 py-4 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFE55C] transition-colors font-semibold"
            onClick={() => window.open(CHROME_STORE_URL, '_blank')}
          >
            Install FreoWallet Extension
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Wallet</h1>
        <div className="bg-[#2D2D2D] rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Account Details</h2>
          {isConnected && account ? (
            <div>
              <p className="mb-4">Account Address: {account}</p>
              {/* Add more wallet functionality here */}
            </div>
          ) : (
            <div>
              <p className="mb-4">Connect your wallet to view your account details</p>
              <button
                onClick={connectWallet}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage; 