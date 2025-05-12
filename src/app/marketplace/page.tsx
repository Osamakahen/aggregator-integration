"use client";

import React, { useState, useMemo, useEffect } from "react";
import AppCard from "../../components/marketplace/AppCard";
import CategoryGrid from "../../components/marketplace/CategoryGrid";
import SearchBar from "../../components/marketplace/SearchBar";
import { useWallet } from "../context/WalletContext";
import { useRouter } from "next/navigation";

const categories = [
  { id: "defi", name: "DeFi", icon: "defi" as const },
  { id: "exchange", name: "Exchange", icon: "exchange" as const },
  { id: "marketplace", name: "NFTs", icon: "marketplace" as const },
  { id: "social", name: "Social", icon: "social" as const },
];

const sampleApps = [
  {
    id: "uniswap",
    name: "Uniswap",
    description: "A leading decentralized exchange for swapping ERC-20 tokens.",
    logo: "https://cryptologos.cc/logos/uniswap-uniswap-logo.png",
    category: "defi",
    isVerified: true,
    rating: 5,
    easyConnect: true,
    url: "https://app.uniswap.org/",
    featured: true,
  },
  {
    id: "opensea",
    name: "OpenSea",
    description: "The largest NFT marketplace for buying, selling, and discovering digital assets.",
    logo: "https://opensea.io/static/images/logos/opensea.svg",
    category: "marketplace",
    isVerified: true,
    rating: 5,
    easyConnect: true,
    url: "https://opensea.io/",
    featured: true,
  },
  {
    id: "aave",
    name: "Aave",
    description: "Decentralized lending and borrowing protocol.",
    logo: "https://cryptologos.cc/logos/aave-aave-logo.png",
    category: "defi",
    isVerified: true,
    rating: 4,
    easyConnect: false,
    url: "https://app.aave.com/",
  },
  {
    id: "compound",
    name: "Compound",
    description: "Algorithmic, autonomous interest rate protocol.",
    logo: "https://cryptologos.cc/logos/compound-comp-logo.png",
    category: "defi",
    isVerified: true,
    rating: 4,
    easyConnect: false,
    url: "https://app.compound.finance/",
  },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isConnected, connectWallet, disconnectWallet, connectionStatus, error, isFreoWallet } = useWallet();
  const router = useRouter();

  const handleGetWallet = async () => {
    if (!isFreoWallet) {
      window.open('https://chrome.google.com/webstore/detail/freobus-wallet', '_blank');
    } else {
      try {
        await connectWallet();
      } catch (err) {
        console.error('Failed to connect wallet:', err);
      }
    }
  };

  const filteredApps = useMemo(() => {
    return sampleApps.filter((app) => {
      const matchesCategory = selectedCategory ? app.category === selectedCategory : true;
      const matchesSearch =
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 via-green-600 to-green-800 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Banner for not connected */}
        {!isConnected && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-900 rounded flex items-center justify-between">
            <span>You are not connected. Connect your FreoWallet for full functionality.</span>
            <button
              className="ml-4 px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFE55C] font-semibold"
              onClick={handleGetWallet}
              disabled={connectionStatus === 'connecting'}
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-center">Web3 Marketplace</h1>
          <div className="flex items-center gap-4">
            {error && (
              <span className="text-sm bg-red-800 px-3 py-1 rounded">
                {error}
              </span>
            )}
            <button
              className={`px-4 py-2 rounded transition-all font-semibold ${
                connectionStatus === 'connecting'
                  ? 'bg-gray-500 cursor-not-allowed'
                  : isConnected
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-[#FFD700] hover:bg-[#FFE55C] text-black'
              }`}
              onClick={isConnected ? disconnectWallet : handleGetWallet}
              disabled={connectionStatus === 'connecting'}
            >
              {connectionStatus === 'connecting' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : isConnected ? (
                'Disconnect Wallet'
              ) : (
                'Get Your FreoWallet'
              )}
            </button>
          </div>
        </div>
        <div className="mb-6">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div className="mb-8">
          <CategoryGrid
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.length === 0 ? (
            <div className="col-span-full text-center text-gray-300 py-12">
              No dApps found.
            </div>
          ) : (
            filteredApps.map((app) => (
              <AppCard 
                key={app.id} 
                app={app} 
                isConnected={isConnected} 
                connectWallet={connectWallet}
                connectionStatus={connectionStatus}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
} 