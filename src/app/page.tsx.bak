'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleGetWallet = () => {
    // Store a flag indicating new user flow
    localStorage.setItem('isNewUser', 'true');
    // Redirect to extension installation page
    router.push('/onboarding/install');
  };

  const handleConnectWallet = () => {
    router.push('/connect');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E4D2B] to-[#1E1E1E] text-white">
      <nav className="w-full py-4 px-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#FFD700]">FreoBus</div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/marketplace')}
            className="px-4 py-2 text-white hover:text-[#FFD700] transition-colors"
          >
            Web3 Shopping Mall
          </button>
          <button
            onClick={handleConnectWallet}
            className="px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFE55C] transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Unlock the World of <span className="text-[#FFD700]">Web3</span><br />
          with <span className="text-[#FFD700]">FreoBus</span>
        </h1>
        
        <p className="text-xl mb-12">
          <span className="font-semibold">FreoWallet</span> Magically Empowering <span className="text-[#FFD700]">YOU</span> to Decentralization
        </p>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => router.push('/marketplace')}
            className="px-8 py-4 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#333333] transition-colors"
          >
            Web3 Shopping Mall
          </button>
          <button
            onClick={handleGetWallet}
            className="px-8 py-4 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFE55C] transition-colors font-semibold"
          >
            Get Your FreoWallet
          </button>
        </div>
      </main>
    </div>
  );
} 