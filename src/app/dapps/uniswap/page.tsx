"use client";

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Token {
  symbol: string;
}

interface Pool {
  id: string;
  token0: Token;
  token1: Token;
  totalValueLockedUSD: string;
}

interface GraphQLResponse {
  data?: {
    pools: Pool[];
  };
  errors?: Array<{
    message: string;
  }>;
}

export default function UniswapPage() {
  const router = useRouter();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
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
        });

        const data: GraphQLResponse = await response.json();

        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        if (!data.data?.pools) {
          throw new Error('No pool data received');
        }

        setPools(data.data.pools);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pool data');
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
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
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-900/20 rounded">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map(pool => (
            <div key={pool.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold">{pool.token0.symbol}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-xl font-bold">{pool.token1.symbol}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-400 text-sm">Total Value Locked</p>
                <p className="text-2xl font-bold text-green-400">
                  ${Number(pool.totalValueLockedUSD).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 