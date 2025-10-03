# Voxa – Modular Voice Agent

Cloudflare-first reference implementation of a bilingual voice agent with three deployed surfaces:

- **Worker API:** `https://voxa-backend.eebehuur13.workers.dev`
- **Pages UI:** `https://a57aea05.voxa-pages.pages.dev`
- **Source layout:** `backend/` (worker) and `frontend/` (Vite React app)

RAG and audio-similarity endpoints are scaffolded but intentionally unimplemented for now.

---

## Prerequisites

- Node 20+
- `npm` (ships with Node)
- Cloudflare account with Workers & Pages access
- OpenAI API key (`OPENAI_API_KEY`) stored as a Worker secret

Authenticate once per machine:

```bash
npx wrangler login
```

---

## Deploy the Worker API

```bash
cd backend
npm install
npx wrangler secret put OPENAI_API_KEY      # only if the secret is missing or rotated
npm run deploy                              # publishes to the workers.dev address above
```

The deployed worker exposes:

- `POST /tts` – text → speech (OpenAI TTS)
- `POST /stt` – audio → verbose Whisper transcription
- `POST /translate` – Hindi audio → `{ original_transcript, translated_text }`

---

## Build & Deploy the Pages Frontend

Manual upload workflow (no Git triggers):

```bash
cd frontend
npm install
VITE_API_BASE_URL="https://voxa-backend.eebehuur13.workers.dev" npm run build
npx wrangler pages deploy dist --project-name voxa-pages
```

The Pages deployment lives at `https://a57aea05.voxa-pages.pages.dev`. Re-run the three commands above whenever the UI changes or the API URL is updated.

### Switching API targets

To point the UI at a different worker instance, rebuild with the desired URL before deploying:

```bash
VITE_API_BASE_URL="https://<new-worker>.workers.dev" npm run build
```

---

## Local Development

```bash
# Worker
cd backend
npm run dev

# Frontend (expects Vite env var or defaults to http://localhost:8787)
cd frontend
npm run dev
```

Set `VITE_API_BASE_URL` in a `.env.local` or shell export if the worker runs on a different port.

---

## Troubleshooting Tips

- **CORS failures:** Confirm the worker was redeployed after switching routes – it must return the `Access-Control-Allow-Origin` header, already configured via Hono `cors()` middleware.
- **403 or 500 from `/tts`/`/stt`/`/translate`:** Ensure `OPENAI_API_KEY` exists (`npx wrangler secret list`).
- **Pages build mismatch:** verify the upload path is `dist/`; the CLI reports the exact deployment URL on completion.

---

## Next Steps

- Implement `backend/src/audio_rag.ts` and `backend/src/audio_similarity.ts` once their respective pipelines are ready.
- Add automated Pages builds via GitHub when the workflow moves away from manual uploads.
