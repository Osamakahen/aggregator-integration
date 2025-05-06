"use client";

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface NFTAsset {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  collection?: {
    name: string;
  };
}

export default function OpenSeaPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<NFTAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data since OpenSea API requires authentication
    const mockAssets: NFTAsset[] = [
      {
        id: '1',
        name: 'Bored Ape #1234',
        image_url: 'https://i.seadn.io/gae/Ju9CkWtEd-okOh0GhJDLsgD5mrG5z3JmTR7J1N1Wif9L__fxleCW-0L_8T1jz9qOdbzT3c9ZmUjBZ0Iam1LvKm-w?auto=format&w=1000',
        description: 'A unique Bored Ape NFT',
        collection: { name: 'Bored Ape Yacht Club' }
      },
      {
        id: '2',
        name: 'CryptoPunk #5678',
        image_url: 'https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&w=1000',
        description: 'A rare CryptoPunk',
        collection: { name: 'CryptoPunks' }
      },
      {
        id: '3',
        name: 'Doodle #9012',
        image_url: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozneeeda9dB2IB=s500',
        description: 'A colorful Doodle',
        collection: { name: 'Doodles' }
      }
    ];

    try {
      // Simulate API delay
      setTimeout(() => {
        setAssets(mockAssets);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load NFT data');
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <button
        onClick={() => router.push('/marketplace')}
        className="mb-6 px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFE55C] font-semibold"
      >
        ← Back to Marketplace
      </button>
      <h1 className="text-3xl font-bold mb-4">OpenSea Top NFTs</h1>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-900/20 rounded">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map(asset => (
            <div key={asset.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <img 
                src={asset.image_url} 
                alt={asset.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{asset.name}</h3>
                {asset.collection && (
                  <p className="text-gray-400 text-sm mb-2">
                    {asset.collection.name}
                  </p>
                )}
                {asset.description && (
                  <p className="text-gray-300 text-sm">
                    {asset.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 