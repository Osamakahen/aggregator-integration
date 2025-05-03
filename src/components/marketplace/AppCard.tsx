import React from 'react';
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
}

export default function AppCard({ app, featured }: AppCardProps) {
  // Use in-app navigation for Uniswap and OpenSea
  if (app.id === 'uniswap') {
    return (
      <Link href="/dapps/uniswap" className="block">
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
      </Link>
    );
  }
  if (app.id === 'opensea') {
    return (
      <Link href="/dapps/opensea" className="block">
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
      </Link>
    );
  }
  // Default: external link
  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
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
  );
} 