'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [question]);

  const handleSearch = async () => {
    setIsLoading(true);
    setAnswer('');
    setStatus('Generating search query and performing web search...');

    try {
      // Step 1: Generate query and search
      const queryResponse = await fetch('/api/generate-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const { searchQuery, searchResults } = await queryResponse.json();

      // Step 2: Fetch and aggregate content
      setStatus('Fetching and aggregating content...');
      const contentResponse = await fetch('/api/fetch-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchResults }),
      });
      const { context } = await contentResponse.json();

      // Step 3: Generate answer
      setStatus('Generating answer...');
      const answerResponse = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });

      if (!answerResponse.body) {
        throw new Error('No response body');
      }

      const reader = answerResponse.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setAnswer((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Error:', error);
      setAnswer('An error occurred while fetching the answer.');
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  const formatAnswer = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2">
        {line}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl px-4">
        <div className="bg-white shadow-lg rounded-3xl p-8">
          <h2 className="text-3xl font-extrabold text-center mb-6">Web Q&A</h2>
          <div className="mb-4">
            <textarea
              ref={textareaRef}
              className="w-full p-2 border border-gray-300 rounded resize-none overflow-hidden"
              placeholder="Ask a question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={1}
            />
          </div>
          <div className="mb-6">
            <button
              className="w-full bg-blue-500 text-white rounded-md px-4 py-2"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {status && (
            <div className="mb-4 text-center text-gray-600">
              {status}
            </div>
          )}
          {answer && (
            <div>
              <h3 className="text-lg font-medium mb-2">Answer:</h3>
              <div className="text-gray-700 whitespace-pre-wrap">
                {formatAnswer(answer)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}