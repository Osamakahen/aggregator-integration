'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Welcome to FreoWallet</h1>
        <p className="text-xl mb-8">Your secure and easy-to-use Web3 wallet</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/wallet" className="p-6 bg-[#2A2A2A] rounded-lg hover:bg-[#333333] transition-colors">
            <h2 className="text-2xl font-semibold mb-2">Wallet</h2>
            <p>Manage your assets and transactions</p>
          </a>
          <a href="/test" className="p-6 bg-[#2A2A2A] rounded-lg hover:bg-[#333333] transition-colors">
            <h2 className="text-2xl font-semibold mb-2">Test Page</h2>
            <p>View the test deployment page</p>
          </a>
        </div>
      </div>
    </div>
  );
}
