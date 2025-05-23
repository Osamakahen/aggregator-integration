import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaBolt } from 'react-icons/fa';

interface AppCardProps {
  app: {
    id: string;
    name: string;
    description: string;
    logo: string;
    category: string;
    isVerified: boolean;
    rating: number;
    easyConnect: boolean;
    url: string;
    featured?: boolean;
  };
  featured?: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
}

export default function AppCard({ app, featured, isConnected, connectWallet, connectionStatus }: AppCardProps) {
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = async (e: React.MouseEvent, href?: string, external?: boolean) => {
    if (!isConnected) {
      e.preventDefault();
      setShowModal(true);
      return;
    }
    if (external && href) {
      window.open(href, '_blank');
    }
  };

  const handleConnect = async () => {
    await connectWallet();
    setShowModal(false);
  };

  // Use in-app navigation for Uniswap and OpenSea
  if (app.id === 'uniswap') {
    return (
      <>
        <Link href="/dapps/uniswap" className="block">
          <div onClick={(e) => handleCardClick(e)}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className={`relative bg-[#2A2A2A] rounded-xl p-4 shadow-lg border ${
                app.isVerified ? 'border-[#FFC107]/20' : 'border-gray-800'
              } ${featured ? 'ring-2 ring-[#FFC107]' : ''}`}
            >
              {featured && (
                <div className="absolute -top-2 -right-2 bg-[#FFC107] text-[#1E1E1E] px-2 py-1 rounded-full text-xs font-medium">
                  Featured
                </div>
              )}
              <div className="flex items-start space-x-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={app.logo}
                    alt={`${app.name} logo`}
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                  {app.isVerified && (
                    <div className="absolute -top-2 -right-2 bg-[#1E1E1E] rounded-full p-1">
                      <FaCheckCircle className="w-4 h-4 text-[#FFC107]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                    {app.easyConnect && (
                      <span className="flex items-center text-xs text-[#FFC107] bg-[#FFC107]/10 px-2 py-1 rounded-full">
                        <FaBolt className="w-3 h-3 mr-1" />
                        Easy Connect
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{app.description}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-xs text-gray-500">{app.category}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < app.rating ? 'text-[#FFC107]' : 'text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Link>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Connect your FreoWallet to continue</h2>
              <button
                className="w-full mb-3 px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFE55C] font-semibold"
                onClick={handleConnect}
                disabled={connectionStatus === 'connecting'}
              >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
              </button>
              <a
                href="https://chrome.google.com/webstore/detail/freobus-wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline mb-2"
              >
                Install FreoWallet Extension
              </a>
              <button
                className="mt-2 text-gray-500 hover:text-gray-700 text-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </>
    );
  }
  if (app.id === 'opensea') {
    return (
      <>
        <Link href="/dapps/opensea" className="block">
          <div onClick={(e) => handleCardClick(e)}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className={`relative bg-[#2A2A2A] rounded-xl p-4 shadow-lg border ${
                app.isVerified ? 'border-[#FFC107]/20' : 'border-gray-800'
              } ${featured ? 'ring-2 ring-[#FFC107]' : ''}`}
            >
              {featured && (
                <div className="absolute -top-2 -right-2 bg-[#FFC107] text-[#1E1E1E] px-2 py-1 rounded-full text-xs font-medium">
                  Featured
                </div>
              )}
              <div className="flex items-start space-x-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={app.logo}
                    alt={`${app.name} logo`}
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                  {app.isVerified && (
                    <div className="absolute -top-2 -right-2 bg-[#1E1E1E] rounded-full p-1">
                      <FaCheckCircle className="w-4 h-4 text-[#FFC107]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                    {app.easyConnect && (
                      <span className="flex items-center text-xs text-[#FFC107] bg-[#FFC107]/10 px-2 py-1 rounded-full">
                        <FaBolt className="w-3 h-3 mr-1" />
                        Easy Connect
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{app.description}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-xs text-gray-500">{app.category}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < app.rating ? 'text-[#FFC107]' : 'text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Link>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Connect your FreoWallet to continue</h2>
              <button
                className="w-full mb-3 px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFE55C] font-semibold"
                onClick={handleConnect}
                disabled={connectionStatus === 'connecting'}
              >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
              </button>
              <a
                href="https://chrome.google.com/webstore/detail/freobus-wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline mb-2"
              >
                Install FreoWallet Extension
              </a>
              <button
                className="mt-2 text-gray-500 hover:text-gray-700 text-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </>
    );
  }
  // Default: external link
  return (
    <>
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onClick={(e) => handleCardClick(e, app.url, true)}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className={`relative bg-[#2A2A2A] rounded-xl p-4 shadow-lg border ${
            app.isVerified ? 'border-[#FFC107]/20' : 'border-gray-800'
          } ${featured ? 'ring-2 ring-[#FFC107]' : ''}`}
        >
          {featured && (
            <div className="absolute -top-2 -right-2 bg-[#FFC107] text-[#1E1E1E] px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </div>
          )}
          <div className="flex items-start space-x-4">
            <div className="relative w-16 h-16">
              <Image
                src={app.logo}
                alt={`${app.name} logo`}
                width={64}
                height={64}
                className="rounded-lg"
              />
              {app.isVerified && (
                <div className="absolute -top-2 -right-2 bg-[#1E1E1E] rounded-full p-1">
                  <FaCheckCircle className="w-4 h-4 text-[#FFC107]" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                {app.easyConnect && (
                  <span className="flex items-center text-xs text-[#FFC107] bg-[#FFC107]/10 px-2 py-1 rounded-full">
                    <FaBolt className="w-3 h-3 mr-1" />
                    Easy Connect
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">{app.description}</p>
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-xs text-gray-500">{app.category}</span>
                <span className="text-xs text-gray-500">•</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${
                        i < app.rating ? 'text-[#FFC107]' : 'text-gray-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </a>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Connect your FreoWallet to continue</h2>
            <button
              className="w-full mb-3 px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFE55C] font-semibold"
              onClick={handleConnect}
              disabled={connectionStatus === 'connecting'}
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <a
              href="https://chrome.google.com/webstore/detail/freobus-wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline mb-2"
            >
              Install FreoWallet Extension
            </a>
            <button
              className="mt-2 text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
} 