'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold">Web3 Shopping Mall</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, category, or tag"
                className="w-96 px-4 py-2 bg-[#2A2A2A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2">🔍</span>
            </div>
            <select className="px-4 py-2 bg-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]">
              <option>Featured</option>
              <option>Most Popular</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#2A2A2A] p-6 rounded-lg border border-[#FFD700]">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 relative">
                  <Image
                    src="/uniswap-logo.png"
                    alt="Uniswap"
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                  <span className="absolute -top-2 -right-2 bg-[#FFD700] text-black p-1 rounded-full">✓</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">Uniswap</h3>
                      <p className="text-gray-400 text-sm">exchange • ⭐⭐⭐⭐⭐</p>
                    </div>
                    <button className="px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFE55C] transition-colors flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      Easy Connect
                    </button>
                  </div>
                  <p className="mt-2 text-gray-300">Swap, earn, and build on the leading decentralized crypto trading protocol.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] p-6 rounded-lg border border-[#FFD700]">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 relative">
                  <Image
                    src="/opensea-logo.png"
                    alt="OpenSea"
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                  <span className="absolute -top-2 -right-2 bg-[#FFD700] text-black p-1 rounded-full">✓</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">OpenSea</h3>
                      <p className="text-gray-400 text-sm">marketplace • ⭐⭐⭐⭐⭐</p>
                    </div>
                    <button className="px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFE55C] transition-colors flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      Easy Connect
                    </button>
                  </div>
                  <p className="mt-2 text-gray-300">Discover, collect, and sell extraordinary NFTs on the world's first & largest NFT marketplace.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
          <div className="bg-[#FFD700] text-black p-4 rounded-lg text-center cursor-pointer hover:bg-[#FFE55C] transition-colors">
            <span className="text-2xl">🌐</span>
            <p className="mt-2 font-medium">All Apps</p>
          </div>
          <div className="bg-[#2A2A2A] p-4 rounded-lg text-center cursor-pointer hover:bg-[#333333] transition-colors">
            <span className="text-2xl">🎮</span>
            <p className="mt-2">Games</p>
          </div>
          <div className="bg-[#2A2A2A] p-4 rounded-lg text-center cursor-pointer hover:bg-[#333333] transition-colors">
            <span className="text-2xl">💰</span>
            <p className="mt-2">DeFi</p>
          </div>
          <div className="bg-[#2A2A2A] p-4 rounded-lg text-center cursor-pointer hover:bg-[#333333] transition-colors">
            <span className="text-2xl">🔄</span>
            <p className="mt-2">Exchange</p>
          </div>
          <div className="bg-[#2A2A2A] p-4 rounded-lg text-center cursor-pointer hover:bg-[#333333] transition-colors">
            <span className="text-2xl">📈</span>
            <p className="mt-2">Trading</p>
          </div>
          <div className="bg-[#2A2A2A] p-4 rounded-lg text-center cursor-pointer hover:bg-[#333333] transition-colors">
            <span className="text-2xl">🛍️</span>
            <p className="mt-2">Marketplace</p>
          </div>
          <div className="bg-[#2A2A2A] p-4 rounded-lg text-center cursor-pointer hover:bg-[#333333] transition-colors">
            <span className="text-2xl">👥</span>
            <p className="mt-2">Social</p>
          </div>
        </div>
      </div>
    </div>
  );
} 