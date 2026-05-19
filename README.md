# SpendSight AI - Global AI Spend Audit Tool

> **SpendSight AI is not just a demo website—it is a powerful, globally accessible tool designed to help companies of any size, anywhere in the world, audit, optimize, and drastically reduce their AI software expenditures.**

## What is it?

As organizations rapidly adopt AI tools—like ChatGPT Plus, GitHub Copilot, Claude Pro, and Midjourney—subscriptions quickly spiral out of control. Teams often over-provision seats, fail to utilize centralized team billing, or leave unused APIs running.

**SpendSight AI** allows any company to input their current AI tool stack, team size, and use cases, and immediately receive a **consulting-grade cost optimization strategy**.

## Key Features

1. **Global Accessibility**: Whether you are a startup in Berlin, a marketing agency in New York, or an enterprise in Tokyo, this tool scales to audit your AI spend.
2. **Rules-Based Optimization Engine**: Analyzes your current tools and recommends specific downgrades, tier consolidations, or model switching (e.g., GPT-4 to GPT-4o-mini).
3. **Executive AI Summary**: Powered by Google Gemini, the tool generates a personalized, executive-ready strategy based on your unique data.
4. **Premium PDF Reports**: Instantly generates a customized, multi-page PDF audit report with a detailed financial breakdown, available immediately for download and sent via email.
5. **Secure & Private**: Does not require you to connect your actual billing accounts. You input your stack manually, and the engine handles the math.

## Tech Stack

This tool is built for high-performance and scale:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4.0
- **PDF Engine**: Client-side generation using `jspdf` for immediate, zero-latency reports.
- **Backend**: Vercel Edge Serverless functions.
- **Transactional Emails**: Resend API integration.
- **Database**: Supabase (PostgreSQL) for lead capture and analytics.
- **AI**: Google Gemini 1.5 Flash for strategy generation.

## How to Run Locally

If you wish to run a local instance of the tool:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` variables (refer to the placeholders in the project).
4. Start the development server:
   ```bash
   npm run dev
   ```

## License

This tool is designed to be accessible. Please review the included documentation and `PITCH.md` for our vision on bringing AI spend transparency to the global market.
