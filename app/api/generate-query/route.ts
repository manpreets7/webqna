import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const braveApiKey = process.env.BRAVE_API_KEY;
const BRAVE_BASE_URL = "https://api.search.brave.com/res/v1/web/search";

async function getSearchQuery(question: string) {
  const msg = await anthropicClient.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 100,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `Given this question from the user, what is the best web search query to extract information from the web to answer this question: ${question}. Respond ONLY with the web search query.`
      }
    ]
  });

  if (Array.isArray(msg.content) && msg.content.length > 0 && 'text' in msg.content[0]) {
    return msg.content[0].text.trim();
  }
  
  return "";
}

async function braveWebSearch(query: string) {
  const response = await axios.get(BRAVE_BASE_URL, {
    params: { q: query, count: 10 },
    headers: {
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": braveApiKey
    }
  });
  return response.data;
}

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    const searchQuery = await getSearchQuery(question);
    const searchResults = await braveWebSearch(searchQuery);
    
    return NextResponse.json({ searchQuery, searchResults });
  } catch (error) {
    console.error('Error in generate-query:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}