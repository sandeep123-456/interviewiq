# InterviewIQ

An AI mock-interview platform. Pick a role, answer questions, and get a score and feedback on every answer. The difficulty adapts to how well you are doing.

## Features

- Signup and login with JWT and bcrypt
- Credit system: 3 free credits on signup, 1 credit per interview, stored as an append-only ledger
- AI-generated questions, answer scoring and follow-up questions through OpenRouter
- Adaptive difficulty: the level (1 to 10) of the next question depends on the last score
- Interview history and per-topic statistics, used to find weak topics
- Landing page built with React and Tailwind CSS

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express, Zod |
| Database | PostgreSQL, Prisma 5 |
| AI | OpenRouter (free models) |
| Auth | JWT, bcrypt |

## Design decisions

- **Credits are a ledger.** Every change is a new row in `CreditTransaction` (for example `+3` on signup, `-1` per interview). The balance on the user is a cache that is updated in the same transaction.
- **No double spending.** A credit is deducted with one atomic query (`balance >= 1` then decrement), so two parallel requests cannot spend the same credit.
- **LLM output is never trusted.** Every reply is parsed and validated with a Zod schema, and retried up to three times if it is malformed.
- **AI calls stay outside database transactions.** A slow model call must not hold a transaction open. If the AI call fails, no credit is deducted.
- **Prompt injection.** The candidate's answer is treated as data. The grading prompt tells the model to ignore instructions written inside an answer.
- **Ownership checks.** Interviews are always looked up by id and user id together, so one user cannot read another user's data.

## Run locally

You need Node.js 18 or newer, a PostgreSQL database (for example a free one on Neon), and an OpenRouter API key.

```bash
# Backend
cd server
npm install
cp .env.example .env        # then fill in the values
npx prisma db push          # creates the tables
npm run dev                 # http://localhost:4000

# Frontend (in another terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Prisma is pinned to version 5.22 on purpose.

## API

All routes except register, login and health need the header `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account (3 free credits) |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| POST | `/api/interviews` | Start an interview (costs 1 credit) |
| GET | `/api/interviews` | List my interviews |
| GET | `/api/interviews/:id` | One interview with questions and answers |
| POST | `/api/interviews/:id/answers` | Submit an answer, get a score and the next question |
| GET | `/api/stats/summary` | Completed interviews, average and best score |
| GET | `/api/stats/topics` | Average score per topic, weakest first |
| GET | `/api/health` | Health check |
