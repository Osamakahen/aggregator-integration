import React, { useState } from 'react';

interface FreoWalletOnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const CHROME_WEBSTORE_URL =
  'https://chrome.google.com/webstore/detail/freobus-wallet';

export default function FreoWalletOnboardingModal({ open, onClose }: FreoWalletOnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!open) return null;

  const handleContinue = async () => {
    setChecking(true);
    // Simulate extension detection
    setTimeout(() => {
      const detected = typeof window !== 'undefined' && (window as any).ethereum && (window as any).ethereum.isFreoWallet;
      setExtensionDetected(!!detected);
      setStep(2);
      setChecking(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white text-black rounded-lg shadow-lg p-8 max-w-md w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">Get Your FreoWallet</h2>
        {step === 1 && (
          <>
            <ol className="list-decimal pl-5 mb-4 space-y-2">
              <li>
                <a
                  href={CHROME_WEBSTORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Install the FreoWallet browser extension
                </a>
              </li>
              <li>After installation, click Continue below.</li>
            </ol>
            <button
              className="w-full py-2 bg-[#FFD700] text-black rounded font-semibold hover:bg-[#FFE55C] transition-colors"
              onClick={handleContinue}
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Continue'}
            </button>
          </>
        )}
        {step === 2 && !extensionDetected && (
          <>
            <p className="mb-4 text-red-600">FreoWallet extension not detected. Please install it and try again.</p>
            <button
              className="w-full py-2 bg-gray-300 text-black rounded font-semibold hover:bg-gray-400 transition-colors"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </>
        )}
        {step === 2 && extensionDetected && (
          <>
            <ol className="list-decimal pl-5 mb-4 space-y-2">
              <li>Open the FreoWallet extension and create your wallet (set username and password).</li>
              <li>Once your wallet is created, click Connect Wallet in the app navigation.</li>
            </ol>
            <button
              className="w-full py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors"
              onClick={onClose}
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
} 