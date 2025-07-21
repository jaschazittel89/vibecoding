# Ingredient‑to‑Recipe Web App ‑ Specification (v1.1)

## Objective
Build a modern, responsive web application that allows users to snap or upload photos of their **fridge** *and* **pantry**, automatically detect the visible food items with AI, and suggest healthy recipes that can be cooked with what the user already has on‑hand.

## Success Criteria
* **Sign‑up → first recipe** flow success rate ≥ 95 %.
* AI correctly validates that uploaded images are of a fridge and a pantry ≥ 90 % of the time.
* Ingredient extraction F1‑score ≥ 0.85 on internal test set.
* Average user rating of generated recipes ≥ 4 / 5 after 30 days.
* Core journey (sign‑up → recipes list) completes in < 7 s on 3G.

## Tech Stack & Integrations
| Layer       | Choice                                              | Notes |
|-------------|-----------------------------------------------------|-------|
| Front‑end   | **Next.js 15** (React 19) + TypeScript              | App Router, Server Actions; Tailwind CSS for UI; shadcn/ui components |
| Back‑end    | Next.js API Routes (Edge & Node runtimes)           | Node 18 on Vercel |
| Auth        | **Next‑Auth v5**                                    | Email/password + Google OAuth |
| Storage     | Vercel Blob for raw images, **Neon PostgreSQL** for metadata & users |
| AI          | OpenAI Vision (gpt‑4o) for image validation & ingredient extraction; OpenAI Completions for recipe generation |
| CI / CD     | GitHub Actions → Vercel Preview & Production deployments |
| Observability | Sentry for error reporting; OpenTelemetry → Grafana Cloud |

## User Stories & Acceptance Criteria

### 1 Sign‑Up
* **US‑01** As a visitor I can create an account with email/password or Google so that my data is saved.
  * **AC‑01.1** Invalid emails or weak passwords (< 8 chars, no number) trigger inline errors.
  * **AC‑01.2** Verification email sent within 30 s.

### 2 Log‑In
* **US‑02** As a registered user I can log in with the credentials or provider I signed up with.
  * **AC‑02.1** Rate‑limit 5 attempts / min / IP.

### 3 Capture or Upload Photos
* **US‑03** After logging in I am prompted to submit *two* images: pantry then fridge.
  * **AC‑03.1** Mobile: can use device camera (MediaDevices API).
  * **AC‑03.2** Max file size 8 MB, JPEG/PNG only.
  * **AC‑03.3** Show upload progress bar (client‑side & server‑side).  

### 4 Validate Images
* **US‑04** The system validates each image with AI to confirm it depicts the expected scene.
  * **AC‑04.1** Validation confidence ≥ 0.8; otherwise prompt re‑upload with guidance.
  * **AC‑04.2** Processing time ≤ 5 s/image.

### 5 Extract Ingredients
* **US‑05** When both images are valid the system extracts a consolidated, deduplicated list of ingredients.
  * **AC‑05.1** Each ingredient is returned with a confidence score; items < 0.4 are flagged for user confirmation.
  * **AC‑05.2** Ingredients are normalised to USDA Food Ontology for consistency.

### 6 Generate Recipes
* **US‑06** Given the ingredient list I receive **three** recipe suggestions prioritising healthfulness (≤ 700 kcal/serve).
  * **AC‑06.1** Each recipe includes: title, 1‑sentence description, ingredient list, step‑by‑step method, estimated time, nutrition macros.
  * **AC‑06.2** Recipes avoid allergens that the user has flagged in profile (stretch goal).

## Non‑Functional Requirements
* **Performance**: Core Web Vitals (LCP, FID, CLS) ≤ Google ‘good’ thresholds on mobile & desktop.
* **Accessibility**: WCAG 2.2 AA.
* **i18n**: English only in v1; structure code for localisation.
* **Security**: OWASP Top 10 compliance; images stored with private ACL.
* **Privacy**: Do **not** retain raw images beyond 24 h after processing (configurable).

## Error Handling
* AI or network failures surface a friendly retry banner; errors logged to Sentry.
* Invalid session → redirect to **/login** with flash message.

## Monitoring & Analytics
* Vercel Web Analytics for page metrics.
* Application metrics (latency, error rate) via OpenTelemetry.

## Future Enhancements (Backlog)
* Pantry/fridge historical snapshots & trends.
* Weekly meal‑plan generator.
* Voice‑controlled flow (Web Speech API).
* Shareable recipe cards (image export).

---
_Last updated: 2025‑07‑21_