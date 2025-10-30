# Quick Setup Guide

Follow these steps to get QuizIt AI running on your local machine:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Create the file
touch .env
```

Add your API keys to the `.env` file:

```
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
JINA_API_KEY=jina_your-jina-api-key-here
GPT_MODEL=gpt-5-mini
```

### Getting API Keys

**OpenAI API Key (Required)**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key and paste it into your `.env` file
6. Make sure you have credits in your OpenAI account

**Jina AI API Key (Optional but Recommended)**
1. Go to https://jina.ai/
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env` file
5. Without this key, the app uses Jina's public endpoint (works fine but with lower rate limits)

**GPT Model Configuration**
- Default is `gpt-5-mini` (latest fast model)
- You can change this in the `.env` file if needed
- Other options: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`

## Step 3: Run the Development Server

```bash
npm run dev
```

## Step 4: Open in Browser

Navigate to http://localhost:3000

## Testing the App

The app comes pre-loaded with a sample URL (Lord of the Rings Wikipedia page).

Try these other URLs for testing:
- Wikipedia articles: https://en.wikipedia.org/wiki/Artificial_intelligence
- Blog posts: https://openai.com/blog/
- Documentation: https://nextjs.org/docs

After submitting your quiz, you'll receive:
- Your score and percentage
- Correct/incorrect answer indicators
- An AI-generated review of your performance (100 words or less)

## Common Issues

### "Failed to generate quiz"
- Verify your OpenAI API key is correct
- Check you have credits in your OpenAI account
- Make sure the `.env` file is in the root directory

### "Failed to extract content"
- Ensure the URL is publicly accessible (not behind a paywall)
- Some websites block content extraction
- Try a different URL

### Port already in use
If port 3000 is already in use, you can run on a different port:
```bash
npm run dev -- -p 3001
```

## Production Build

To create a production build:

```bash
npm run build
npm start
```

---

Need help? Check the full README.md for more details!


