# AGENTS.md

> **TL;DR** – Follow the steps in **Quick‑Start** below, pass **all checks**, keep changes **atomic**, and open a **Conventional Commit** PR.

---
## 1 Mission
You are an automated developer contributing to a modern, responsive web app:
- Takes photos of the fridge and pantry
- Analyses the photo using OpenAI's APIs for food items
- Generates recipes based on food items
- Stores the recipes

Your output must integrate cleanly with the monorepo, compile and pass CI.

Always refer to these specs: /Users/jaschazittel/vibecoding/specs.md

## 2  Purpose

This document gives **OpenAI Codex** and other AI coding agents the context, constraints, and commands they need to work effectively in this repository. It covers project setup, coding conventions, testing, CI/CD, and deployment to **Vercel** for a **Next.js (TypeScript)** stack.

## 3  Project Stack

| Layer     | Tech / Service                           |
| --------- | ---------------------------------------- |
| Framework | Next.js 14 (App Router)                  |
| Language  | TypeScript 5 (strict)                    |
| Styling   | Tailwind CSS + CSS Modules               |
| State     | React Context + Zustand (small‑scale)    |
| Testing   | **Vitest** + **React Testing Library**   |
| Linting   | ESLint (next/core‑web‑vitals) + Prettier |
| Package   | pnpm (Node 20 LTS)                       |
| CI        | GitHub Actions                           |
| Hosting   | Vercel (Production + Preview)            |

---

## 4  Directory Convention

```
/
├─ app/                # Route handlers & pages (app router)
├─ components/         # Re‑usable UI components (.tsx)
├─ lib/                # Shared utilities (pure functions)
├─ hooks/              # Custom React hooks
├─ tests/              # Vitest unit/integration tests
├─ public/             # Static assets (served at '/')
├─ .github/workflows/  # CI pipelines
└─ vercel.json         # Vercel routing & env overrides
```

### Rules

1. **No circular imports** – use barrel files (`index.ts`) only where it does **not** introduce cycles.
2. **Absolute imports** – all app code imports via the `@/` alias (configured in `tsconfig.json`).
3. UI libraries live in **components/** and are named `PascalCase.tsx`.
4. Every new React component **must** ship with a co‑located test: `Button.test.tsx`.

---

## 5  Scripts

Run via `pnpm <script>` (or `npm run <script>` if pnpm unavailable).

| Script     | Purpose                                                                    |
| ---------- | -------------------------------------------------------------------------- |
| dev        | Local dev server with HMR ([http://localhost:3000](http://localhost:3000)) |
| build      | Production build (Next.js `next build`)                                    |
| start      | Start production server locally                                            |
| type‑check | Run `tsc --noEmit`                                                         |
| lint       | Run ESLint (all warnings must be fixed)                                    |
| lint\:fix  | Auto‑fix lint issues                                                       |
| test       | Vitest (watch)                                                             |
| test\:ci   | Vitest (coverage, ci‑friendly)                                             |

### Mandatory programmatic checks

Agents **MUST** run – and pass – the following before committing:

```bash
pnpm lint && pnpm type-check && pnpm test:ci && pnpm build
```

Failure to run these checks before opening a PR is considered a build‑breaker.

---

## 6  Coding Guidelines

1. **Type safety first** – prefer explicit types, use `unknown` over `any`, enable `strictNullChecks`.
2. **Functional React** – all components are functional; hooks manage state.
3. **Async/await** – no `.then()` chains. Handle errors with `try/catch`.
4. **File naming** – `kebab-case` for files, `PascalCase` for React components.
5. **Commit Style** – [Conventional Commits](https://www.conventionalcommits.org/): `feat: add user profile card`.
6. **Pull Request Checklist**
   -

---

## 7  Testing Strategy

- **Unit & integration tests** live under `tests/` and use **Vitest**.
- Mock server interactions with **msw**.
- Minimum **80 %** line coverage on `main`.
- Agents creating new features must add/fix tests to maintain the threshold.

### Running tests in CI

CI invokes `pnpm test:ci`. Coverage reports are published as artifacts.

---

## 8  Environment Variables

| Name                         | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| NEXT\_PUBLIC\_API\_BASE\_URL | Base URL for API calls (browser & server) |
| DATABASE\_URL                | PostgreSQL connection (server only)       |
| OPENAI\_API\_KEY             | Used by server‑side edge functions        |

During local dev, variables are loaded from `.env.local` (never commit this file). In CI & Vercel, secrets are configured in the dashboard and pulled with `vercel env pull`.

---

## 9  Vercel Deployment

1. Every push to a branch triggers a **Preview Deployment**.
2. Merging to `main` triggers **Production**.
3. Static assets are cached; dynamic routes use the Vercel Edge runtime when possible.
4. Update `vercel.json` for rewrites, redirects, or edge config.

---

## 10  How Codex Should Work in This Repo

1. **Understand the task** – summarise goals before making changes.
2. **Plan** – list the files to create/update; reference directory structure above.
3. **Run programmatic checks** (section 4) **after each significant change**.
4. **Keep PRs atomic** – one logical change per branch.
5. **Document** – update /docs and relevant MDX pages when behaviour changes.
6. **Fail fast** – if tests require network resources unavailable in the sandbox, mock them.
7. **Respect hierarchy** – if deeper `AGENTS.md` files exist, those override this root‑level file.

---

## 11  Quick‑Start for New Agents

```bash
# 1. Install deps
pnpm i

# 2. Start dev server
pnpm dev

# 3. Run tests & lints before committing
pnpm lint && pnpm type-check && pnpm test
```

---

