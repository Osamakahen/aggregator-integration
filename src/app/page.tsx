'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import FreoWalletOnboardingModal from '../components/FreoWalletOnboardingModal';

export default function Home() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const handleGetWallet = () => {
    window.open('https://chrome.google.com/webstore/detail/freobus-wallet', '_blank');
    setOnboardingOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 via-green-600 to-green-800 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-[#1E1E1E]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto h-14 px-3 sm:px-4 flex justify-between items-center">
          <Link 
            href="/" 
            className="text-[#FFD700] text-2xl font-bold hover:scale-105 transition-transform"
          >
            FreoBus
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              href="/about" 
              className="text-[#FFD700] hover:text-[#FFE55C] transition-colors hover:scale-105"
            >
              What's FreoBus
            </Link>
            <Link 
              href="/marketplace" 
              className="text-white hover:text-gray-300 transition-colors hover:scale-105"
            >
              Web3 Shopping Mall
            </Link>
            <button 
              className="px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFE55C] transition-all hover:scale-105"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center mt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Unlock the World of Web3
            <br />
            with <span className="text-[#FFD700]">FreoBus</span>
          </h1>
          <motion.p 
            className="text-xl sm:text-2xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="font-semibold">FreoWallet</span> Magically Empowering{' '}
            <span className="text-[#FFD700]">YOU</span> to Decentralization
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              href="/marketplace"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFE55C] transition-all hover:scale-105 font-semibold text-lg"
            >
              Web3 Shopping Mall
            </Link>
            <button
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFE55C] transition-all hover:scale-105 font-semibold text-lg"
              onClick={handleGetWallet}
            >
              Get Your FreoWallet
            </button>
          </motion.div>
        </motion.div>
      </div>
      <FreoWalletOnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
    </div>
  );
}
