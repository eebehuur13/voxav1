import { Hono } from 'hono'
import { cors } from 'hono/cors' // Import cors
import { handleTTS } from './tts'
import { handleSTT } from './stt'
import { handleTranslate } from './translation'

// Add a type for the environment variables
export type Env = {
  OPENAI_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>()

// Allow cross-origin requests so the Cloudflare Pages frontend can call the worker
app.use('*', cors())

app.get('/', (c) => {
  return c.text('Welcome to the Voxa API!')
})

// Route for Text-to-Speech
app.post('/tts', handleTTS)

// Route for Speech-to-Text
app.post('/stt', handleSTT)

// Route for Speech Translation
app.post('/translate', handleTranslate)

export default app
