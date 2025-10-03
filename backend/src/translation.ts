import { Handler } from 'hono';
import { Env } from './index';

export const handleTranslate: Handler<{ Bindings: Env }> = async (c) => {
  const apiKey = c.env.OPENAI_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'OPENAI_API_KEY is not set' }, 500);
  }

  let formData;
  try {
    formData = await c.req.formData();
  } catch (e) {
    return c.json({ error: 'Invalid form data' }, 400);
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'Missing required field: "file"' }, 400);
  }

  try {
    // Read the file into an ArrayBuffer to reuse it
    const fileBuffer = await file.arrayBuffer();

    // --- 1. Get the original Hindi transcription ---
    const transcriptionFormData = new FormData();
    // Create a new File object from the buffer
    transcriptionFormData.append('file', new File([fileBuffer], file.name, { type: file.type }));
    transcriptionFormData.append('model', 'whisper-1');
    transcriptionFormData.append('language', 'hi');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: transcriptionFormData,
    });

    if (!transcriptionResponse.ok) {
      const errorJson = await transcriptionResponse.json();
      return c.json({ error: 'Failed to transcribe original audio', details: errorJson }, transcriptionResponse.status);
    }
    const transcriptionData = await transcriptionResponse.json();
    const originalTranscript = transcriptionData.text;

    // --- 2. Get the English translation ---
    const translationFormData = new FormData();
    // Create another new File object from the same buffer
    translationFormData.append('file', new File([fileBuffer], file.name, { type: file.type }));
    translationFormData.append('model', 'whisper-1');

    const translationResponse = await fetch('https://api.openai.com/v1/audio/translations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: translationFormData,
    });

    if (!translationResponse.ok) {
      const errorJson = await translationResponse.json();
      return c.json({ error: 'Failed to translate audio', details: errorJson }, translationResponse.status);
    }
    const translationData = await translationResponse.json();
    const translatedText = translationData.text;

    // --- 3. Combine and return the results ---
    return c.json({
      original_transcript: originalTranscript,
      translated_text: translatedText,
    });

  } catch (error) {
    // Revert to the non-debugging catch block
    console.error('Error in handleTranslate:', error);
    return c.json({ error: 'An internal error occurred' }, 500);
  }
};
