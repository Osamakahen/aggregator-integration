import React from 'react';
import { useWallet } from '../wallet/hooks';

export default function Home() {
  const { isConnected, accounts, connect, disconnect } = useWallet();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">FreoBus DEX Aggregator</h1>
      {!isConnected ? (
        <button
          onClick={connect}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="mb-4">Connected Account: {accounts[0]}</p>
          <button
            onClick={disconnect}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
} 