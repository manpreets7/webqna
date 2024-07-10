# Web Q&A

Web Q&A is an LLM-powered service that searches the web, analyzes the information and provides long-form answers to your questions. It is powered by Claude Sonnet 3.5 and Brave Search API.

## Table of Contents

- [Example Questions To Try](#example-questions-to-try)
- [How It Works](#how-it-works)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Speed](#speed)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Example questions to try

1. What are the major events happening in Los Angeles today?
2. What was the election outcome in the UK?
3. Compare stock market performance of Nvidia and Apple for the past year with key financial ratios

## How It Works

0. You can submit a question or a search string that needs a long form answer.
1. Given a user question or query, it first prompts the LLM to generate an appropriate web query.
2. It uses the web query to search the web using the Brave Search API.
3. It fetches the top 10 URLs from the search and aggregates the content (truncated to a specified context size).
4. It then asks the LLM to answer the question given the search context.
5. As a last step, the answer is streamed back to the user.

## Features

- Web search integration with Brave Search API
- AI-powered query generation and answer synthesis
- Real-time answer streaming
- Configurable context size for optimized performance

## Installation

```bash
git clone https://github.com/yourusername/web-qna.git
cd web-qna
npm install
```

## Usage

1. Set up your environment variables in .env.local:
```
ANTHROPIC_API_KEY=your_anthropic_api_key
BRAVE_API_KEY=your_brave_search_api_key
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Speed

Even though there are several steps involved, the app is quite responsive and performs fast, providing a seamless user experience.

## Technologies Used
+ Anthropic's Claude API
+ Next.js
+ TypeScript
+ Brave Search API
+ Tailwind CSS

## Contributing

Contributions are welcome!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
