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

  // Check if content exists and is an array
  if (Array.isArray(msg.content) && msg.content.length > 0) {
    const firstContent = msg.content[0];
    // Check if the content is a text block
    if ('text' in firstContent) {
      return firstContent.text;
    }
  }
  
  // If we couldn't get the text, throw an error or return a default value
  throw new Error("Unable to get search query from AI response");
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
  const { question } = await request.json();
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("Status: Generating search query...\n"));
        const searchQuery = await getSearchQuery(question);
        
        controller.enqueue(encoder.encode("Status: Performing web search...\n"));
        const searchResults = await braveWebSearch(searchQuery);
        
        controller.enqueue(encoder.encode("Status: Fetching and aggregating context...\n"));
        const context = await getContext(searchResults);
        
        controller.enqueue(encoder.encode("Status: Generating answer...\n"));
        const messageStream = await anthropicClient.messages.stream({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1000,
          temperature: 0,
          messages: [
            {
              role: "user",
              content: `Answer this question: ${question}, given this context: ${context}`
            }
          ],
        });

        for await (const chunk of messageStream) {
          if (chunk.type === 'content_block_delta') {
            if ('text' in chunk.delta) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            } else if ('input_json' in chunk.delta) {
              // Handle JSON delta if needed
              // For now, we'll just stringify it
              controller.enqueue(encoder.encode(JSON.stringify(chunk.delta.input_json)));
            }
          }
        }
      } catch (error) {
        controller.enqueue(encoder.encode(`Error: ${(error as Error).message}\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    },
  });
}