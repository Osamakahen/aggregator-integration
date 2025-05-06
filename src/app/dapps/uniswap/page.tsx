import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function UniswapPage() {
  const router = useRouter();
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          {
            pools(first: 5, orderBy: totalValueLockedUSD, orderDirection: desc) {
              id
              token0 { symbol }
              token1 { symbol }
              totalValueLockedUSD
            }
          }
        `
      }),
    })
      .then(res => res.json())
      .then(data => {
        setPools(data.data.pools);
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
      <h1 className="text-3xl font-bold mb-4">Uniswap Top Pools</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {pools.map(pool => (
            <li key={pool.id} className="mb-2">
              {pool.token0.symbol}/{pool.token1.symbol} - TVL: ${Number(pool.totalValueLockedUSD).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 