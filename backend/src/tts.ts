import { Handler } from 'hono'
import { Env } from './index' // Import the Env type

export const handleTTS: Handler<{ Bindings: Env }> = async (c) => {
  // 1. Get the API key from environment
  const apiKey = c.env.OPENAI_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'OPENAI_API_KEY is not set' }, 500);
  }

  // 2. Parse the request body
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON in request body' }, 400);
  }

  const { text, model = 'tts-1', voice = 'alloy' } = body;

  // 3. Basic validation
  if (!text) {
    return c.json({ error: 'Missing required parameter: "text"' }, 400);
  }

  // 4. Call the OpenAI API
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        input: text,
        voice: voice,
      }),
    });

    // 5. Check for errors from OpenAI
    if (!response.ok) {
      const errorText = await response.text();
      return c.json({ error: 'Failed to generate speech', details: errorText }, response.status);
    }

    // 6. Stream the audio response back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return c.json({ error: 'An internal error occurred' }, 500);
  }
};
