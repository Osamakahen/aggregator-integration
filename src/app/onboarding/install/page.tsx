'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InstallExtension() {
  const router = useRouter();
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);

  useEffect(() => {
    // Check if FreoBus extension is installed
    const checkExtension = () => {
      if (typeof window !== 'undefined' && window.freoBus) {
        setIsExtensionInstalled(true);
        // If extension is installed, wait briefly then redirect to wallet creation
        setTimeout(() => {
          router.push('/onboarding/create-wallet');
        }, 1500);
      }
    };

    const interval = setInterval(checkExtension, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const handleInstallClick = () => {
    // Open Chrome Web Store or relevant extension store
    window.open('https://chrome.google.com/webstore/detail/freobus-wallet', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Install FreoBus Wallet</h1>
        
        {!isExtensionInstalled ? (
          <>
            <div className="bg-[#2A2A2A] p-8 rounded-lg mb-8">
              <h2 className="text-2xl mb-4">Step 1: Install the Extension</h2>
              <p className="mb-6">To get started with FreoBus, you&apos;ll need to install our secure browser extension.</p>
              <button
                onClick={handleInstallClick}
                className="px-8 py-4 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFE55C] transition-colors font-semibold"
              >
                Install FreoBus Extension
              </button>
            </div>
            
            <div className="text-gray-400">
              <p>After installation:</p>
              <ol className="list-decimal list-inside mt-2">
                <li>Click the extension icon in your browser</li>
                <li>Return to this page</li>
                <li>You&apos;ll be automatically redirected to create your wallet</li>
              </ol>
            </div>
          </>
        ) : (
          <div className="bg-[#2A2A2A] p-8 rounded-lg">
            <h2 className="text-2xl mb-4">Extension Detected!</h2>
            <p>Redirecting you to wallet creation...</p>
            <div className="mt-4 animate-spin w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
} 