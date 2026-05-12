# AI Prompts - Audit Summary

This document documents the prompt engineering used for the AI-generated audit summaries.

## Core Prompt (Google Gemini 1.5 Flash)

**Model**: `gemini-1.5-flash` (Optimized for speed and efficiency, perfect for a free-tier friendly implementation).

**User Prompt Structure**:
```text
You are a financial advisor specializing in AI cost optimization. Write a compelling, professional summary for {{company}}.
  
Current monthly AI spend: ${{currentSpend}}
Potential monthly savings: ${{savings}} ({{percentage}}% reduction)
Tools audited: {{tools}}

Provide a concise, executive-level summary of where the savings come from (focusing on plan optimization and model selection) and why they should act now. Keep it under 120 words.
```

## Prompt Rationale
- **Model Choice**: Gemini 1.5 Flash is highly capable while staying within the free-tier limits of Google AI Studio.
- **Conciseness**: Limited to 120 words for dashboard compatibility.
- **Tone**: Professional/Executive to build trust with CFOs and Engineering Managers.
