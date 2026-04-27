# BlueCore

Voice-Activated AI Consultant for Maritime Operators

---

## What It Does

BlueCore is a voice-first AI assistant built for maritime crew. Operators speak naturally — asking questions, logging how their shift went, checking in — and BlueCore responds in real time with a spoken reply, grounded in the context of their session history.

The system uses speech-to-text, retrieval-augmented generation (RAG) over a vector database, an LLM reply engine, and text-to-speech to deliver a fully hands-free conversation loop.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                  │
│   VoiceHome · ConversationView · Dashboard · Wellbeing + more   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────────────────┐
│                   Backend (Express + TypeScript)                 │
│   Auth · Session management · Audio pipeline · RAG pipeline      │
└──────┬──────────────────────────────────────────┬───────────────┘
       │                                          │
┌──────▼──────────┐                  ┌────────────▼────────────────┐
│  Voice Bridge   │                  │     VectorAI Bridge         │
│  (Python/       │                  │  (Actian CortexAI via gRPC) │
│   Whisper + TTS)│                  │  init · upsert · query      │
└─────────────────┘                  └─────────────────────────────┘
                         SQLite
                  (sessions · messages · audio)
```

### Services

| Service | Path | Description |
|---|---|---|
| Backend API | `services/backend-ts` | Express server — auth, sessions, RAG + audio pipeline |
| Voice Bridge | `services/voice-bridge-py` | Python service — Whisper transcription + TTS synthesis |
| VectorAI Bridge (Python) | `services/vectorai-bridge-py` | Python bridge to Actian CortexAI |
| VectorAI Bridge (TS) | `services/vectorai-bridge-ts` | TypeScript bridge client |
| Frontend | `frontend` | React + Vite + Tailwind — full voice UI |
| Infra | `infra/docker` | Docker Compose for local stack |

---

## Full Voice Loop

1. User speaks → audio recorded in browser
2. Audio uploaded to `/session/message/audio/reply-audio`
3. Backend sends audio to Voice Bridge → Whisper transcribes speech to text
4. Transcript upserted into VectorAI (Actian CortexAI) for the session namespace
5. VectorAI queried for top-K relevant context
6. LLM generates a reply grounded in retrieved context
7. Reply text sent to Voice Bridge → synthesized as WAV
8. WAV streamed back to client and played aloud

---

## Running Locally

**Backend:**
```bash
cd services/backend-ts
cp .env.example .env   # set HOST, PORT, CORS_ORIGIN, bridge URLs
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL if needed
npm install
npm run dev
```

**Voice Bridge + VectorAI Bridge:** see `infra/docker` for Docker Compose setup.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Auth | JWT-based auth middleware |
| Session Storage | SQLite (better-sqlite3) |
| Vector Search | Actian CortexAI (gRPC + HTTP bridge) |
| Speech-to-Text | Faster-Whisper (Python) |
| Text-to-Speech | Python TTS bridge |
| Containerization | Docker |

---
