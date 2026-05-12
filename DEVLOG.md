# DEVLOG - Credex AI Spend Audit

## Day 1 - Project Ideation and Foundation
**Date:** 2026-05-06
**Goals:** Initialize project, define design tokens, and build the core audit engine structure.
**Accomplishments:**
- Bootstrapped Vite + React + TS project.
- Defined a "Parchment & Espresso" design system in `index.css`.
- Built the initial `auditEngine.ts` with basic percentage-based savings logic.
- Implemented the first version of the tool selection form.
**Challenges:** Selecting a color palette that felt "consultancy-grade" rather than "tech-startup-generic."
**Commits:** `init: project setup`, `feat: design tokens`

## Day 2 - Advanced Form & Tool Logic
**Date:** 2026-05-07
**Goals:** Expand to 8+ tools and implement plan-specific pricing.
**Accomplishments:**
- Researched pricing for OpenAI, Anthropic, Midjourney, and Perplexity.
- Refactored `ToolEntry` to include plan levels and seat counts.
- Added dynamic tool adding/removing in the UI.
**Challenges:** Mapping the complex pricing tiers of tools like OpenAI (Plus vs Team vs Enterprise).
**Commits:** `feat: multi-tool input`, `logic: pricing tiers`

## Day 3 - Results Visualization & Premium UI
**Date:** 2026-05-08
**Goals:** Create a "wow" factor on the results page.
**Accomplishments:**
- Implemented animated progress bars for spend comparison.
- Added glassmorphism effects for tool cards.
- Integrated `lucide-react` for high-quality iconography.
**Challenges:** Ensuring animations were smooth on mobile devices.
**Commits:** `ui: results redesign`, `feat: spend charts`

## Day 4 - Anthropic Integration & AI Summaries
**Date:** 2026-05-09
**Goals:** Connect Claude 3 for personalized advice.
**Accomplishments:**
- Integrated `@anthropic-ai/sdk`.
- Engineered a prompt focusing on "Executive-level financial clarity."
- Added loading skeletons to improve perceived performance during API calls.
**Challenges:** Prompt leakage where the AI would hallucinate specific savings numbers not in the data. Fixed with strict grounding instructions.
**Commits:** `api: anthropic integration`, `prompt: refined consulting tone`

## Day 5 - Lead Capture & Backend Storage
**Date:** 2026-05-10
**Goals:** Implement Supabase for data persistence and email capture.
**Accomplishments:**
- Connected Supabase client.
- Built a lead capture modal with email validation.
- Implemented a `localStorage` fallback to prevent data loss during network drops.
**Challenges:** Designing a lead capture flow that didn't feel intrusive after the user saw their savings.
**Commits:** `feat: lead capture`, `db: supabase integration`

## Day 6 - Routing, OG Tags & Shareability
**Date:** 2026-05-11
**Goals:** Make reports shareable and SEO-friendly.
**Accomplishments:**
- Integrated `react-router-dom`.
- Set up `/report/:id` dynamic routes.
- Added Open Graph meta tags for premium previews on LinkedIn and Twitter.
**Challenges:** Managing state across routes when the user is coming from a deep link vs. a fresh audit.
**Commits:** `feat: routing`, `seo: open graph tags`

## Day 7 - Refactoring, Testing & Launch
**Date:** 2026-05-12
**Goals:** Final polish, unit testing, and documentation.
**Accomplishments:**
- Added 5+ unit tests for the audit engine.
- Completed full documentation suite (Architecture, GTM, Metrics).
- Final UI polish (Inter font, smooth transitions).
**Challenges:** Last-minute dependency conflicts between Tailwind 4 and some legacy plugins. Resolved with manual overrides.
**Commits:** `test: audit engine coverage`, `docs: final documentation`, `polish: UI refinements`