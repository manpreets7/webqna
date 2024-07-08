import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function fetchUrlContent(url: string) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(response.data);
    return $('body').text();
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
  return context.slice(0, 25000);
}

export async function POST(request: Request) {
  try {
    const { searchResults } = await request.json();
    const context = await getContext(searchResults);
    return NextResponse.json({ context });
  } catch (error) {
    console.error('Error in fetch-content:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}