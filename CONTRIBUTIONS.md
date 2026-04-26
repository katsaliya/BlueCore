# Kataliya Sungkamee — Technical Contributions

**Role:** Frontend, Backend Session Pipeline, Voice + RAG Integration  
**Project:** BlueCore — Voice-Activated AI Consultant for Maritime Operators

---

## Overview

I built the frontend application end-to-end and designed and implemented the backend's core session and audio pipeline — the system responsible for turning a user's voice input into a RAG-grounded, spoken AI reply. I also drove the integration work that got the full stack running together.

---

## What I Built

### Frontend Application (`frontend/`)

Built the entire React + TypeScript + Vite frontend from scratch, including:

**Screens:**
- `VoiceHome.tsx` / `VoiceHomeV2.tsx` — the primary voice interface. Detects shift context (break / on-shift / off-shift) from the current time to dynamically adapt the AI's greeting and follow-up. Includes an animated microphone, conversation bubble rendering, and real-time AI reply display.
- `ConversationView.tsx` — full conversation thread display with session history
- `Dashboard.tsx` — operator overview
- `Wellbeing.tsx` — wellbeing check-in flow
- `PastDocuments.tsx`, `Schedule.tsx`, `NewsFeed.tsx`, `Social.tsx`, `Profile.tsx`, `Splash.tsx` — supporting app screens

**App infrastructure:**
- `App.tsx` / `Root.tsx` / `routes.ts` — full React Router setup
- `ThemeContext.tsx` — theme switching (light/dark) with CSS variable injection
- `useCssVar.ts` — custom hook for reading live CSS variable values
- `bluecoreApi.ts` — typed API client covering all backend endpoints (auth, sessions, message, audio upload, audio+reply)
- `mockData.ts` — development data for UI iteration before backend integration

**Styling:**
- Custom palette, font loading, Tailwind config, and theme token system across `styles/`

---

### Backend Session & Audio Pipeline (`services/backend-ts/src/routes/session.ts`)

Designed and implemented the entire session message pipeline — the most complex part of the backend. This includes three distinct endpoint flows:

**Text message flow** (`POST /session/message`):
1. Validate session ownership
2. Persist user message to SQLite
3. Upsert message into VectorAI (Actian CortexAI) under the session namespace
4. Query VectorAI for top-K relevant context (RAG retrieval)
5. Generate LLM reply using retrieved context via `LlmProvider`
6. Persist assistant reply to SQLite
7. Return reply + metadata to client

**Audio message flow** (`POST /session/message/audio`):
1. Accept multipart audio upload (WAV, MP3, M4A, OGG, WebM)
2. Send to Voice Bridge → Whisper transcription
3. Run full text message pipeline on the transcript
4. Store input audio buffer to disk via `audioStore`
5. Return transcript metadata alongside the text reply

**Audio message with spoken reply** (`POST /session/message/audio/reply-audio`):
1. Full audio message flow as above
2. Send LLM reply text to Voice Bridge → TTS synthesis
3. Store both input and output audio buffers
4. Stream synthesized WAV back to client with reply headers (`X-GreenWatch-Transcript`, `X-GreenWatch-Reply`)

Also implemented:
- `GET /session/history` — authenticated session history retrieval
- `POST /session/start` — session creation scoped to authenticated user
- `GET /sessions` — list all sessions for a user

---

### Voice Bridge Service (`services/backend-ts/src/services/voiceBridge.ts`)

Implemented the service layer that communicates with the Python voice bridge:
- `transcribeAudioFile()` — reads audio from disk, posts multipart to `/transcribe`, returns typed transcription result
- `synthesizeSpeech()` — posts text to `/speak`, returns WAV buffer

---

### VectorAI Bridge Service (`services/backend-ts/src/services/vectoraiBridge.ts`)

Implemented the typed HTTP client for the Actian CortexAI bridge:
- `initVectorAiBridge()` — namespace initialization
- `upsertVectorAiBridge()` — insert/update records with metadata
- `queryVectorAiBridge()` — semantic similarity search with topK

---

### LLM Provider Interface (`services/backend-ts/src/providers/llm/LlmProvider.ts`)

Defined the `LlmProvider` interface that decouples the session pipeline from any specific LLM implementation, making it straightforward to swap in different models or providers.

---

### Integration (`integration-kataliya` branch)

Drove the full-stack integration that got frontend, backend, voice bridge, and VectorAI bridge running together end-to-end. Resolved environment config mismatches, tested the complete voice loop (record → transcribe → RAG → reply → TTS → play), and confirmed the smoke test passed without Actian connected.

---

## Technical Decisions

- **Shift-aware greeting logic in VoiceHome** — detects time of day to adapt the AI's tone before any user input, making the experience feel contextual rather than generic
- **Multipart audio handling with MIME-aware extension mapping** — handled the edge cases of browser-recorded audio (WebM, M4A) being sent with inconsistent MIME types, ensuring files are stored with the correct extension
- **Audio stored after the pipeline succeeds** — input audio is only persisted if the transcription and session pipeline both succeed, avoiding orphaned audio files from failed requests
- **Provider interface for LLM** — separated the LLM call from the session route so the pipeline could be tested with a stub before a real model was wired in
- **RAG scoped by session namespace** — each session gets its own VectorAI namespace, so retrieval context stays isolated per conversation

---

## Commits

Authored under `katsaliya <kataliyaschool@gmail.com>` across branches:
- `frontend-kataliya` — `Add Voice-Activated Maritime Consultant App frontend`
- `backend-kataliya` — backend merge and integration
- `integration-kataliya` — `frontend/backend smoke test passed, installed+created necessary changes to work successfully without Actian yet`
