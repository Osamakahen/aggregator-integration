'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 via-green-600 to-green-800 text-white">
      <nav className="bg-[#1E1E1E] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[#FFD700] text-2xl font-bold">
            FreoBus
          </Link>
          <div className="flex space-x-4">
            <Link href="/about" className="text-[#FFD700] hover:text-[#FFE55C]">
              What's FreoBus
            </Link>
            <Link href="/marketplace" className="text-white hover:text-gray-300">
              Web3 Shopping Mall
            </Link>
            <button className="px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFE55C] transition-colors">
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Unlock the World of Web3
          <br />
          with <span className="text-[#FFD700]">FreoBus</span>
        </h1>
        <p className="text-2xl mb-12">
          <span className="font-semibold">FreoWallet</span> Magically Empowering <span className="text-[#FFD700]">YOU</span> to Decentralization
        </p>
        <div className="flex justify-center gap-6">
          <Link
            href="/marketplace"
            className="px-8 py-4 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFE55C] transition-colors font-semibold text-lg"
          >
            Web3 Shopping Mall
          </Link>
          <Link
            href="/wallet"
            className="px-8 py-4 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFE55C] transition-colors font-semibold text-lg"
          >
            Get Your FreoWallet
          </Link>
        </div>
      </div>
    </div>
  );
}
