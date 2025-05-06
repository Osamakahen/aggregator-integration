import React, { useState } from 'react';

interface FreoWalletOnboardingModalProps {
  open: boolean;
  onClose: () => void;
  isConnected: boolean;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
}

const CHROME_WEBSTORE_URL =
  'https://chrome.google.com/webstore/detail/freobus-wallet';

const FreoWalletOnboardingModal: React.FC<FreoWalletOnboardingModalProps> = ({
  open,
  onClose,
  isConnected,
  connectionStatus
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Welcome to FreoWallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {connectionStatus === 'connecting' ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Connecting to FreoWallet...</p>
          </div>
        ) : isConnected ? (
          <div className="text-center py-8">
            <div className="text-green-400 text-5xl mb-4">✓</div>
            <p className="text-white text-xl mb-4">Successfully Connected!</p>
            <p className="text-gray-400 mb-6">You can now interact with dApps using your FreoWallet.</p>
            <button
              onClick={onClose}
              className="bg-[#FFD700] text-black px-6 py-2 rounded font-semibold hover:bg-[#FFE55C] transition-colors"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-yellow-400 text-5xl mb-4">!</div>
            <p className="text-white text-xl mb-4">Install FreoWallet</p>
            <p className="text-gray-400 mb-6">
              To use this dApp, you need to install the FreoWallet browser extension.
            </p>
            <a
              href="https://chrome.google.com/webstore/detail/freobus-wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FFD700] text-black px-6 py-2 rounded font-semibold hover:bg-[#FFE55C] transition-colors inline-block"
            >
              Install Extension
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreoWalletOnboardingModal; 