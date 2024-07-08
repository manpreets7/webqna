import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { question, context } = await request.json();

    const message = await anthropicClient.messages.create({
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

    let answer = '';
    if (Array.isArray(message.content) && message.content.length > 0) {
      const firstContent = message.content[0];
      if ('text' in firstContent) {
        answer = firstContent.text;
      }
    }

    if (!answer) {
      throw new Error('No answer generated');
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error in generate-answer-sync:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}