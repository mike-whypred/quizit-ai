import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { markdown, content, contentType, questionCount, title } = await request.json();

    const textContent = markdown || content;
    const isPdf = contentType === 'pdf';

    if (!textContent || !questionCount) {
      return NextResponse.json(
        { error: 'Content and question count are required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

    const prompt = `Based on the following content, create exactly ${questionCount} multiple-choice quiz questions. Each question should have exactly 3 answer options. Make the questions challenging but fair, covering key concepts from the content.

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
- Ensure all questions are directly related to the content provided
- Return ONLY valid JSON, no additional text`;

    let userContent: Anthropic.MessageParam['content'];

    if (isPdf) {
      userContent = [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: textContent,
          },
        } as any,
        { type: 'text', text: prompt },
      ];
    } else {
      const maxLength = 30000;
      const truncated =
        textContent.length > maxLength
          ? textContent.substring(0, maxLength) + '...'
          : textContent;
      userContent = [{ type: 'text', text: `Content:\n${truncated}\n\n${prompt}` }];
    }

    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system:
        'You are a helpful assistant that creates educational quiz questions. Always respond with valid JSON only, no additional text.',
      messages: [{ role: 'user', content: userContent }],
    });

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON, handling potential markdown code blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const quizData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

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
