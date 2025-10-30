import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { markdown, questionCount, title } = await request.json();

    if (!markdown || !questionCount) {
      return NextResponse.json(
        { error: 'Markdown content and question count are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Truncate markdown if too long (to avoid token limits)
    const maxLength = 8000;
    const truncatedMarkdown = markdown.length > maxLength 
      ? markdown.substring(0, maxLength) + '...'
      : markdown;

    const prompt = `Based on the following content, create exactly ${questionCount} multiple-choice quiz questions. Each question should have exactly 3 answer options. Make the questions challenging but fair, covering key concepts from the content.

Content:
${truncatedMarkdown}

Return your response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3"],
      "correctAnswer": 0
    }
  ]
}

Important:
- Create exactly ${questionCount} questions
- Each question must have exactly 3 options
- correctAnswer is the index (0, 1, or 2) of the correct option
- Make questions diverse and cover different aspects of the content
- Ensure all questions are directly related to the content provided`;

    // Get model from environment variable, default to gpt-5-mini
    const model = process.env.GPT_MODEL || 'gpt-5-mini';
    
    // Build completion parameters
    const completionParams: any = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates educational quiz questions. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    };
    
    // Only add temperature for models that support it (not gpt-5-mini)
    if (!model.includes('gpt-5-mini')) {
      completionParams.temperature = 0.7;
    }
    
    const completion = await openai.chat.completions.create(completionParams);

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const quizData = JSON.parse(responseContent);

    return NextResponse.json({
      quiz: {
        title: title || 'Quiz',
        questions: quizData.questions,
      },
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}


