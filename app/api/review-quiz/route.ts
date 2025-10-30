import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { quiz, userAnswers } = await request.json();

    if (!quiz || !userAnswers) {
      return NextResponse.json(
        { error: 'Quiz and user answers are required' },
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

    // Build a summary of answers for the AI to review
    let answerSummary = '';
    quiz.questions.forEach((question: any, index: number) => {
      const userAnswer = userAnswers.find((a: any) => a.questionIndex === index);
      const isCorrect = userAnswer && question.correctAnswer === userAnswer.selectedAnswer;
      
      answerSummary += `\nQuestion ${index + 1}: ${question.question}
Correct Answer: ${question.options[question.correctAnswer]}
User's Answer: ${userAnswer ? question.options[userAnswer.selectedAnswer] : 'Not answered'}
Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}\n`;
    });

    const score = userAnswers.filter((answer: any) => {
      const question = quiz.questions[answer.questionIndex];
      return question.correctAnswer === answer.selectedAnswer;
    }).length;

    const prompt = `You are reviewing a student's quiz performance on "${quiz.title}". They scored ${score} out of ${quiz.questions.length} questions correctly.

Here's their performance:
${answerSummary}

IMPORTANT: Provide a constructive review in EXACTLY 100 words or less. Your response must be concise and focused.

Your review should:
1. Acknowledge what they did well (if they got any correct)
2. Identify specific areas for improvement based on what they got wrong
3. Be encouraging and educational

Keep the tone friendly and supportive. Focus on the content topics, not just the score. Remember: 100 words maximum!`;

    // Get model from environment variable, default to gpt-5-mini
    const model = process.env.GPT_MODEL || 'gpt-5-mini';
    
    // Build completion parameters
    const completionParams: any = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful educational assistant providing constructive feedback on quiz performance. Be encouraging, specific, and concise. Always limit your responses to 100 words or less.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    };
    
    // Only add temperature for models that support it (not gpt-5-mini)
    if (!model.includes('gpt-5-mini')) {
      completionParams.temperature = 0.7;
    }
    
    const completion = await openai.chat.completions.create(completionParams);

    console.log('Completion response:', JSON.stringify(completion, null, 2));

    const review = completion.choices[0]?.message?.content;
    if (!review) {
      console.error('No review content in response:', completion);
      return NextResponse.json(
        { error: 'No review generated', details: 'Empty response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error('Error generating review:', error);
    console.error('Error details:', error.message, error.response?.data);
    return NextResponse.json(
      { error: 'Failed to generate review', message: error.message },
      { status: 500 }
    );
  }
}

