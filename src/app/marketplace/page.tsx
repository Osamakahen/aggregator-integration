"use client";

import React, { useState, useMemo } from "react";
import AppCard from "../../components/marketplace/AppCard";
import CategoryGrid from "../../components/marketplace/CategoryGrid";
import SearchBar from "../../components/marketplace/SearchBar";
import { useWallet } from "../context/WalletContext";
import FreoWalletOnboardingModal from "../../components/FreoWalletOnboardingModal";

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
  {
    id: "sushiswap",
    name: "SushiSwap",
    description: "Community-driven decentralized exchange.",
    logo: "https://cryptologos.cc/logos/sushiswap-sushi-logo.png",
    category: "exchange",
    isVerified: true,
    rating: 4,
    easyConnect: false,
    url: "https://app.sushi.com/",
  },
  {
    id: "lens",
    name: "Lens Protocol",
    description: "A composable and decentralized social graph.",
    logo: "https://avatars.githubusercontent.com/u/87761809?s=200&v=4",
    category: "social",
    isVerified: true,
    rating: 4,
    easyConnect: false,
    url: "https://www.lens.xyz/",
  },
  {
    id: "farcaster",
    name: "Farcaster",
    description: "Decentralized social network protocol.",
    logo: "https://pbs.twimg.com/profile_images/1635732108882223104/0QwQ6QkA_400x400.jpg",
    category: "social",
    isVerified: false,
    rating: 3,
    easyConnect: false,
    url: "https://www.farcaster.xyz/",
  },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isConnected, connectWallet, disconnectWallet } = useWallet();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const handleGetWallet = () => {
    // Debug environment variables
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('VERCEL_ENV:', process.env.NEXT_PUBLIC_VERCEL_ENV);
    
    // Check if we're in development or preview environment
    const isDevOrPreview = process.env.NODE_ENV === 'development' || 
                          process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
    
    console.log('isDevOrPreview:', isDevOrPreview);
    
    if (isDevOrPreview) {
      console.log('Mock wallet connection for testing');
      connectWallet();
      setOnboardingOpen(true);
    } else {
      // Production behavior - redirect to Chrome Web Store
      window.open('https://chrome.google.com/webstore/detail/freobus-wallet', '_blank');
      setOnboardingOpen(true);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-center">Web3 Marketplace</h1>
          <button
            className="px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFE55C] transition-all font-semibold ml-4"
            onClick={handleGetWallet}
          >
            Get Your FreoWallet
          </button>
          {isConnected && (
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all font-semibold ml-4"
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </button>
          )}
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
              <AppCard key={app.id} app={app} isConnected={isConnected} connectWallet={connectWallet} />
            ))
          )}
        </div>
      </div>
      <FreoWalletOnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
    </div>
  );
} 