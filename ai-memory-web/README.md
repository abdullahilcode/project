# AI Memory Web

AI Memory Web is an AI-first personal knowledge cloud that captures anything you think, say, or create, enriches it with LLM-driven insights, and visualises the evolving neural network of your ideas. Upload text, documents, audio reflections, links, or images and revisit them through an interactive graph or conversational agent.

## Highlights

- **Multimodal capture** – Upload text, links, documents or record voice notes with optional AES-256 encryption before storage.
- **Autonomous enrichment** – GPT‑4o summarises, tags, and scores importance; embeddings power semantic recall (pgvector ready).
- **Neural web visualisation** – React Flow + Three.js render an animated graph of your connected thoughts.
- **Chat with your mind** – Retrieval-augmented chat over your memories with references back to source items.
- **Realtime ready architecture** – Supabase Auth/Postgres/Realtime + Prisma schema, with in-memory fallback for local demos.
- **Modern UX stack** – Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Framer Motion, Zustand, TanStack Query.
- **Secure multi-tenant auth** – Supabase OAuth (Google, GitHub, Apple) with row-level security to isolate each user’s graph.

## Tech Stack

| Layer          | Tooling                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ |
| Frontend       | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, React Flow, Three.js    |
| State & Data   | Zustand, TanStack Query, Prisma ORM                                                        |
| Backend        | Supabase (Auth, Postgres, Storage, Realtime), pgvector-ready schema                        |
| AI Services    | OpenAI GPT‑4o (chat/summarise), text-embedding-3-large, Whisper integration hook, LangChain-ready |
| Security       | Optional AES-256-GCM client-side encryption                                                |
| Observability  | PostHog + Logflare placeholders                                                            |

## Project Structure

```
src/
  app/                # App Router entrypoints, layouts, API routes
  components/         # Shared UI + layout components
  features/memory/    # Memory feature modules (timeline, graph, chat, upload, insights)
  lib/                # AI utilities, repository adapters, Supabase/Prisma helpers, env parsing
  store/              # Zustand stores for memory + UI state
  generated/          # Prisma client output (after `prisma generate`)
```

## Prerequisites

- Node.js 18.18+ (recommended: 20.x)
- npm 9+ (or pnpm/yarn/bun if desired)
- Supabase project with Postgres + pgvector extension (optional but recommended)
- OpenAI API key (for GPT‑4o + embeddings + Whisper)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable                       | Description                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase project URL                                                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase anon key for client requests                                                       |
| `SUPABASE_SERVICE_ROLE_KEY`    | Supabase service role key (required for server-side writes/embedding jobs)                  |
| `DATABASE_URL`                 | Postgres connection string (Supabase or local)                                              |
| `OPENAI_API_KEY`               | OpenAI API key                                                                               |
| `OPENAI_CHAT_MODEL`            | Chat model (default `gpt-4o`)                                                                |
| `OPENAI_SUMMARY_MODEL`         | Summarisation model (default `gpt-4o-mini`)                                                 |
| `OPENAI_EMBEDDING_MODEL`       | Embedding model (default `text-embedding-3-large`)                                          |
| `WHISPER_MODEL`                | Whisper model id (`whisper-1` or custom)                                                    |
| `AES_ENCRYPTION_KEY`           | 32-char key for optional AES-256-GCM encryption                                             |
| `NEXT_PUBLIC_ENABLE_ENCRYPTION`| `true` to require encryption client-side                                                    |

If environment variables are omitted the app transparently falls back to an in-memory data store and mock AI summarisation so that the UI remains fully navigable.

## Authentication

1. Enable the providers you want (Google, GitHub, Apple) in **Supabase → Authentication → Providers**.
2. Set each provider’s redirect URL to `https://your-domain/auth/callback` (and `http://localhost:3000/auth/callback` for local dev).
3. Run the SQL in `supabase/policies.sql` to create row-level security policies for `User`, `Memory`, and `MemoryEdge`.
4. The UI exposes sign-in/out controls in the top-right of the dashboard; the app falls back to a seeded demo brain when no session is present.

## Setup & Development

```bash
npm install

# Generate Prisma client (optional if not using Supabase yet)
npm run prisma:generate

# Start the dev server
npm run dev
```

Visit `http://localhost:3000` to explore the dashboard. Demo data is auto-seeded when no database connection is provided.

### Linting & Type Safety

```bash
npm run lint      # ESLint
npm run typecheck # TypeScript (tsc --noEmit)
```

### Production Build

```bash
npm run build
npm run start
```

## Supabase & Prisma

1. Enable pgvector in your Supabase project (`create extension if not exists vector;`).
2. Update `DATABASE_URL` and run migrations (e.g. `prisma migrate deploy`).
3. Execute the policies in `supabase/policies.sql` if you haven’t already.
4. Adjust `prisma/schema.prisma` to tune vector dimensions or table structure as needed.

## Deployment

- **Frontend**: Deploy via Vercel. Set the same environment variables in the Vercel project.
- **Backend**: Supabase hosts Postgres/Auth/Storage. Realtime graph updates are ready to wire to Supabase Realtime channels.
- **AI Providers**: OpenAI keys should be stored as encrypted environment variables.

## Scripts

| Script              | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start local dev server                      |
| `npm run build`     | Create production build                     |
| `npm run start`     | Run production server                       |
| `npm run lint`      | ESLint                                      |
| `npm run typecheck` | TypeScript type checking                    |
| `npm run prisma:generate` | Generate Prisma client               |
| `npm run prisma:migrate` | Deploy Prisma migrations (Supabase)   |

## Roadmap Notes

- Supabase Vector similarity search + LangChain RAG workflow
- PostHog + Logflare instrumentation hooks
- Realtime graph updates via Supabase channels
- Whisper file upload pipeline (currently placeholder)

---

Build your digital brain. Capture everything. Let AI connect the dots.
