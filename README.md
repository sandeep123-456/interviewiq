# InterviewIQ

AI mock interview platform. Pick a role, answer questions by typing or speaking, and get scored feedback on every answer. Upload your resume and the questions come from your own projects.

**Live demo:** https://interviewiq-wine-pi.vercel.app

The backend runs on a free server that sleeps when idle, so the first request can take up to a minute.

## What it does

- **AI interviews.** An LLM writes the questions, scores each answer (correctness, clarity, depth) and asks follow-ups when an answer is thin.
- **Adaptive difficulty.** The next question gets harder or easier based on your score.
- **Voice mode.** Answer by speaking (speech to text, editable before you submit). Questions can be read aloud. Camera and microphone are required to start, like a real video interview. Nothing is recorded or uploaded.
- **Resume-based questions.** Upload a PDF resume. The LLM extracts skills and projects, and the interview asks about them.
- **Progress tracking.** Per-topic averages show your weakest areas. Every past interview and its feedback is saved.
- **Credit system.** Each interview costs one credit. Credits are an append-only ledger with an idempotency key, and deductions are atomic.

## Tech stack

React, Vite, Tailwind CSS | Node.js, Express | PostgreSQL (Neon), Prisma | OpenRouter (LLM) | JWT, Zod | Vercel, Render

## Engineering notes

- **Credits cannot be double-spent.** The balance check and decrement are one atomic query inside a transaction, so two parallel requests cannot both spend the last credit. Every change is also written to a ledger.
- **A failed AI call costs nothing.** AI calls run outside the database transaction, and the credit is deducted only after the first question exists.
- **LLM output is validated.** Responses are parsed as JSON, checked with Zod and retried, so a malformed reply never reaches the user.
- **Candidate text is treated as untrusted.** Answers and resumes are passed to the model as data, with instructions not to follow anything written inside them (prompt injection mitigation).
- **Ownership checks on every query.** Interviews and resumes are always looked up by id and user id, so one user cannot read another user's data.

## Run locally

```bash
git clone https://github.com/sandeep123-456/interviewiq.git
cd interviewiq

# backend
cd server
npm install
cp .env.example .env     # fill in the values
npx prisma db push
npm run dev

# frontend (new terminal)
cd client
npm install
npm run dev
```

Backend environment variables (see `server/.env.example`): `DATABASE_URL`, `JWT_SECRET`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `CLIENT_URL`.
Frontend: `VITE_API_URL` (defaults to `http://localhost:4000`).

## Project structure

```
client/   React app (pages, components, voice and camera hooks)
server/   Express API, Prisma schema, AI services (questions, evaluation, resume parsing)
```