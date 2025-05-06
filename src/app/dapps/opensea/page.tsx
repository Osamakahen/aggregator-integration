import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function OpenSeaPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.opensea.io/api/v1/assets?order_direction=desc&limit=5')
      .then(res => res.json())
      .then(data => {
        setAssets(data.assets);
        setLoading(false);
      });
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
        <p>Loading...</p>
      ) : (
        <ul>
          {assets.map(asset => (
            <li key={asset.id} className="mb-2 flex items-center">
              <img src={asset.image_url} alt={asset.name} className="w-12 h-12 mr-2 rounded" />
              <span>{asset.name || 'Unnamed NFT'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 