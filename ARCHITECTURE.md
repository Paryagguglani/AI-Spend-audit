# Architecture - Credex AI Spend Audit

## Overview
Credex AI Spend Audit is a high-performance web application designed to help companies optimize their AI tool expenditures. It follows a modern, serverless architecture focusing on speed, scalability, and premium user experience.

## Tech Stack
- **Frontend**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0 + `tailwindcss-animate`
- **Language**: TypeScript
- **State Management**: React Hooks
- **Backend/Database**: Supabase (PostgreSQL)
- **AI Engine**: Google Gemini 1.5 Flash (via `@google/generative-ai`)
- **Icons**: Lucide React
- **Routing**: React Router 7

## Key Components

### 1. Audit Engine (`src/utils/auditEngine.ts`)
A rules-based logic engine that calculates savings potential. It contains:
- Pricing configurations for 8+ major AI tools.
- Optimization rules (Plan switching, Seat management, Model optimization).
- AI Summary generator.

### 2. Form View
A dynamic, multi-step input system that allows users to build their AI stack profile.

### 3. Results View
A data-driven dashboard that visualizes savings and provides actionable recommendations.

### 4. Data Layer
- **Lead Capture**: Stores user email and audit results in Supabase.
- **Persistence**: Uses `localStorage` for seamless recovery and offline-first development.

## Data Flow
1. User inputs tool data into the Form.
2. `auditEngine.ts` processes data against hardcoded pricing rules.
3. Anthropic API generates a personalized summary.
4. Results are saved to Supabase and displayed to the user.
5. User captures a shareable URL to distribute the report.
