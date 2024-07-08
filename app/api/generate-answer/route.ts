import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { question, context } = await request.json();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
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
              controller.enqueue(chunk.delta.text);
            } else if ('input_json' in chunk.delta) {
              controller.enqueue(JSON.stringify(chunk.delta.input_json));
            }
          }
        }
      } catch (error) {
        controller.enqueue(`Error: ${(error as Error).message}\n`);
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