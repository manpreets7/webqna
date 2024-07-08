import { NextResponse } from 'next/server';
import axios from 'axios';

async function fetchUrlContent(url: string) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return response.data;
  } catch {
    return "";
  }
}

async function getContext(searchResults: any) {
  const urls = searchResults.web?.results?.map((result: any) => result.url) || [];
  let context = "";
  for (const url of urls) {
    context += await fetchUrlContent(url) + "\n\n";
  }
  return context.slice(0, 100000);
}

export async function POST(request: Request) {
  const { searchResults } = await request.json();
  
  try {
    const context = await getContext(searchResults);
    return NextResponse.json({ context });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}