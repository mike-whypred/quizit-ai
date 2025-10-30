import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Use Jina AI Reader to extract content as markdown
    const jinaUrl = `https://r.jina.ai/${url}`;
    
    // Prepare headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'X-Retain-Images': 'none',
    };
    
    // Add Authorization header if JINA_API_KEY is available
    if (process.env.JINA_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.JINA_API_KEY}`;
    }
    
    const response = await fetch(jinaUrl, { headers });

    if (!response.ok) {
      throw new Error(`Jina AI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the markdown content and title
    const markdown = data.data?.content || data.content || '';
    const title = data.data?.title || data.title || 'Unknown Page';

    if (!markdown) {
      return NextResponse.json(
        { error: 'No content could be extracted from this URL' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      markdown,
      title,
    });
  } catch (error) {
    console.error('Error extracting content:', error);
    return NextResponse.json(
      { error: 'Failed to extract content from URL' },
      { status: 500 }
    );
  }
}


