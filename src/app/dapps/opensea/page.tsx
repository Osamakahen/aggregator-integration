"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface NFT {
  id: string;
  name: string;
  image_url: string;
  collection: { name: string };
  description: string;
}

export default function OpenSeaPage() {
  const router = useRouter();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await fetch(
          'https://api.opensea.io/api/v1/assets?order_direction=desc&limit=3'
        );
        const data = await response.json();
        setNfts(data.assets || []);
      } catch (err) {
        setError('Failed to fetch NFT data');
      } finally {
        setLoading(false);
      }
    };
    fetchNFTs();
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
        <div className="text-red-500 p-4 bg-red-900/20 rounded">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map(nft => (
            <div key={nft.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
              {nft.image_url ? (
                <img
                  src={nft.image_url}
                  alt={nft.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-700 rounded mb-4 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <div className="font-bold text-lg">{nft.name}</div>
              <div className="text-gray-400 text-sm">{nft.collection?.name}</div>
              <div className="text-gray-300 text-xs mt-2 line-clamp-2">{nft.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 