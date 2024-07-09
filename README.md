# Web Q&A

Web Q&A is an LLM-based tool that searches the web and provides answers to your questions. It is powered by Claude Sonnet 3.5 and Brave Search API.

## Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Speed](#speed)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## How It Works

1. Given a user question, it first prompts the LLM to generate an appropriate web query.
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

## Usage

1. Set up your environment variables in .env.local:
ANTHROPIC_API_KEY=your_anthropic_api_key
BRAVE_API_KEY=your_brave_search_api_key

2. Run the development server:
```bash
npm run dev

## Speed
Even though there are several steps involved, the app is quite responsive and performs fast, providing a seamless user experience.

## Technologies Used
Anthropic's Claude API
Next.js
TypeScript
Brave Search API
Tailwind CSS

## Contributing
Contributions are welcome!


## License
This project is licensed under the MIT License - see the LICENSE file for details.

This README provides a comprehensive overview of your project, including how it works, installation instructions, usage guidelines, and other important information. You can further customize it by adding more specific details about your project, such as:

- Screenshots or GIFs demonstrating the app in action
- More detailed setup instructions if needed
- Information about configuration options
- Known limitations or future improvements
- A section on how to report issues or request features

Remember to create a LICENSE file in your repository if you haven't already, and c
