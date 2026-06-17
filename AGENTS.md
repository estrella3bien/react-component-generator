# AGENTS.md

This file provides guidance to AI coding agents (GitHub Copilot, Codex, Cursor, etc.) working in this repository.

## Project Overview

A UI workbench that generates React components from natural language prompts, with live preview. Supports Anthropic Claude and Google Gemini as AI providers.

**Runtime**: Bun (package manager + API server) + Vite (frontend dev server)

## Commands

```bash
bun install          # install dependencies
bun run dev          # start API server (port 3002) + frontend (port 5173) concurrently
bun run build        # tsc -b && vite build
bun run lint         # eslint
```

## Architecture

Two processes run in parallel during development:

- **Frontend** `src/` — React 19 + TypeScript + Vite, served at `http://localhost:5173`
- **API server** `server/index.ts` — Bun HTTP server at `http://localhost:3002`, proxied via Vite at `/api`

Vite proxies `/api/*` to `localhost:3002`, so the frontend always calls `/api/generate` and `/api/config` without hardcoding the backend port.

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/config` | Returns `{ envKeys: { anthropic: bool, google: bool } }` |
| POST | `/api/generate` | `{ prompt, apiKey?, provider }` → `{ code }` |

### Frontend State Flow

`App.tsx` holds provider + API key state → passes `generate()` from `useComponentGenerator` hook → hook POSTs to `/api/generate` → appends result to `components[]` array → each item rendered in `ComponentCard` → live JSX executed by `LivePreview` via react-live.

## Generated Component Constraints

All AI-generated components run inside react-live's sandboxed scope. They must follow these rules (enforced by the system prompt in `server/index.ts`):

- **Plain JavaScript only** — no TypeScript syntax, no type annotations
- **No import statements** — `React` is available as a global
- **Inline styles only** — no CSS imports or modules
- **Must end with `render(<ComponentName />)`** — `ensureRenderCall()` in the server adds this automatically if missing
- **Self-contained** — no external dependencies

## Key Constraints

- The server strips markdown code fences (`stripCodeFences()`) before returning generated code to the client
- API keys: env var takes precedence only when no client key is provided — client key always overrides
- CORS headers are wildcard (`*`) — intentional for local development, not production-safe
- No test suite exists; validate changes by running `bun run dev` and testing in the browser
