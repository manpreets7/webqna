import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { question, context } = await request.json();
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
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(chunk.delta.text);
          }
        }
      } catch (error) {
        console.error('Error in generate-answer:', error);
        controller.enqueue(`Error: ${(error as Error).message}`);
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