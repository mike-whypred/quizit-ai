# QuizIt AI 🎯

A modern, AI-powered quiz generator that transforms any web page into an interactive multiple-choice quiz. Built with Next.js, powered by Jina AI for content extraction and OpenAI GPT-4o-mini for quiz generation.

![QuizIt AI](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)

## ✨ Features

- 🌐 **URL-based Content Extraction** - Extract content from any public URL using Jina AI
- 🎚️ **Customizable Quiz Length** - Choose between 3-7 questions with an intuitive slider
- 🤖 **AI-Powered Quiz Generation** - Intelligent quiz creation using OpenAI GPT-4o-mini
- 🎨 **Modern, Beautiful UI** - Clean, responsive design with smooth animations
- ✅ **Interactive Quiz Taking** - Real-time answer selection with visual feedback
- 📊 **Instant Results** - Immediate scoring and answer verification
- 🤖 **AI-Powered Review** - Personalized feedback on performance with areas for improvement
- 💾 **No Database Required** - Temporary storage, fully client-side after generation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- (Optional) A Jina AI API key for better rate limits ([Get one here](https://jina.ai/))

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:
```
OPENAI_API_KEY=your_actual_openai_api_key_here
JINA_API_KEY=your_jina_api_key_here
GPT_MODEL=gpt-5-mini
```

**Note**: `JINA_API_KEY` is optional but recommended for better rate limits and reliability. The app will work without it using Jina's public endpoint.

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

1. **Enter a URL** - Paste any public web page URL (articles, documentation, blog posts work best)
2. **Select Question Count** - Use the slider to choose between 3-7 questions
3. **Generate Quiz** - Click "Generate Quiz" and wait for the AI to create your quiz
4. **Take the Quiz** - Answer all questions by clicking on your chosen answers
5. **Submit & Review** - Submit your answers to see your score, correct answers, and AI-generated feedback
6. **Try Another** - Click "Create New Quiz" to start over with a different URL

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Content Extraction**: [Jina AI Reader](https://jina.ai/)
- **Quiz Generation**: [OpenAI GPT-5-mini](https://platform.openai.com/) (configurable)

## 📁 Project Structure

```
quizit-ai/
├── app/
│   ├── api/
│   │   ├── extract/          # Jina AI content extraction endpoint
│   │   ├── generate-quiz/    # OpenAI quiz generation endpoint
│   │   └── review-quiz/      # AI review generation endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main quiz interface
│   └── types.ts              # TypeScript type definitions
├── .env.example              # Environment variables template
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🔑 API Keys & Services

### OpenAI API Key (Required)
- Sign up at [OpenAI Platform](https://platform.openai.com/)
- Navigate to [API Keys](https://platform.openai.com/api-keys)
- Create a new API key
- Add it to your `.env` file

### Jina AI API Key (Optional but Recommended)
- The app uses Jina AI's Reader API for content extraction
- Works without an API key using the public endpoint
- For better rate limits and reliability, get an API key:
  - Sign up at [Jina AI](https://jina.ai/)
  - Get your API key from the dashboard
  - Add it to your `.env` file as `JINA_API_KEY`

### GPT Model Configuration
- Default model: `gpt-5-mini` (latest fast model)
- Can be changed via `GPT_MODEL` environment variable
- Other options: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`, etc.
- **Note**: `gpt-5-mini` uses default temperature only (custom temperature not supported)

## 🎨 Features in Detail

### Content Extraction
- Utilizes Jina AI's Reader to convert any URL to clean markdown
- Automatically removes ads, navigation, and other noise
- Preserves the main content structure

### Quiz Generation
- Uses GPT-5-mini by default (configurable via `GPT_MODEL` env var)
- Fast, cost-effective quiz creation
- Generates diverse questions covering key concepts
- Each question has exactly 3 multiple-choice options
- Questions are directly based on the extracted content

### User Experience
- Responsive design works on all devices
- Loading states and progress indicators
- Error handling with helpful messages
- Color-coded answer feedback (green for correct, red for incorrect)
- Percentage score calculation
- AI-powered personalized review (100 words or less) highlighting strengths and areas for improvement

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com)
3. Import your repository
4. Add your `OPENAI_API_KEY` in the Environment Variables section
5. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Digital Ocean
- AWS Amplify
- etc.

Just make sure to set the `OPENAI_API_KEY` environment variable.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 💡 Tips for Best Results

- **Choose content-rich URLs**: Articles, tutorials, and documentation work best
- **Avoid paywalled content**: The content extractor can only access publicly available pages
- **Start with 5 questions**: This provides a good balance between coverage and quiz length
- **Review extracted content**: Not all web pages format well - news articles and blog posts work best

## 🐛 Troubleshooting

**"Failed to extract content from URL"**
- Ensure the URL is publicly accessible
- Some websites block automated content extraction
- Try a different article or blog post

**"Failed to generate quiz"**
- Check that your OpenAI API key is valid
- Ensure you have credits in your OpenAI account
- Verify the `GPT_MODEL` in your `.env` file is correct
- The content might be too short or lack substantive information

**Quiz generation is slow**
- First-time requests may take 10-30 seconds
- This is normal as content is extracted and processed
- Subsequent quizzes with similar content may be faster

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Jina AI, and OpenAI GPT-5-mini


