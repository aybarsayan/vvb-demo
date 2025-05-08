import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const callId = searchParams.get('callId');

  if (!callId) {
    return NextResponse.json({ error: 'Call ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://duplexdev.virtualvoicebridge.com/call-detail/${callId}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch call details' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch call details' }, { status: 500 });
  }
} 