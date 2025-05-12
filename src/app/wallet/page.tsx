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

  // If extension is detected, show a message to open the extension
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center">
      <div className="bg-[#2A2A2A] p-8 rounded-lg text-center max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4">FreoWallet Detected!</h1>
        <p className="mb-6">The FreoWallet extension is installed. Please open the extension from your browser toolbar to continue with wallet setup and management.</p>
        <img src="/freowallet-extension-icon.png" alt="FreoWallet Extension Icon" className="mx-auto mb-4" style={{ width: 64, height: 64 }} />
        <p className="text-gray-400 text-sm">Need help? <a href="https://chrome.google.com/webstore/detail/freobus-wallet" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Reinstall or learn more</a></p>
      </div>
    </div>
  );
};

export default WalletPage; 