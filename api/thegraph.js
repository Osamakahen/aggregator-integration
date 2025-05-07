// /api/thegraph.js
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // Only allow POST (TheGraph uses POST for queries)
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Forward the request body to TheGraph
    const response = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
} 