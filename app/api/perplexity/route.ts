import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  console.log('Received request body:', JSON.stringify(body, null, 2));

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      throw new Error(`API response not ok: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Perplexity API response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data from Perplexity API:', error);
    return NextResponse.json({ error: 'Failed to fetch data from Perplexity API' }, { status: 500 });
  }
}