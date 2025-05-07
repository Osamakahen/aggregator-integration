export async function POST(request) {
  const body = await request.json();

  const response = await fetch('https://gateway.thegraph.com/api/5a53e270cec8ca3423ffe28a2e7673ba/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
} 