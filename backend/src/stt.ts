import { Handler } from 'hono';
import { Env } from './index';

export const handleSTT: Handler<{ Bindings: Env }> = async (c) => {
  // 1. Get the API key from environment
  const apiKey = c.env.OPENAI_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'OPENAI_API_KEY is not set' }, 500);
  }

  // 2. Parse the multipart/form-data
  let formData;
  try {
    formData = await c.req.formData();
  } catch (e) {
    return c.json({ error: 'Invalid form data' }, 400);
  }

  const file = formData.get('file');
  const language = formData.get('language'); // Get optional language parameter

  // 3. Validate that a file was uploaded
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'Missing required field: "file"' }, 400);
  }

  // 4. Create a new FormData to send to OpenAI
  const openAIFormData = new FormData();
  openAIFormData.append('file', file);
  openAIFormData.append('model', 'whisper-1');
  openAIFormData.append('response_format', 'verbose_json'); // For timestamps
  
  // Add language if it was provided
  if (language) {
    openAIFormData.append('language', language.toString());
  }

  // 5. Call the OpenAI API
  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Content-Type is set automatically by fetch for FormData
      },
      body: openAIFormData,
    });

    // 6. Check for errors from OpenAI
    if (!response.ok) {
      const errorJson = await response.json();
      return c.json({ error: 'Failed to transcribe audio', details: errorJson }, response.status);
    }

    // 7. Return the successful transcription response
    const data = await response.json();
    return c.json(data);

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return c.json({ error: 'An internal error occurred' }, 500);
  }
};
