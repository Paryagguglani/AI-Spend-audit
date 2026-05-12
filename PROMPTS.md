# AI Prompts - Audit Summary

This document documents the prompt engineering used for the AI-generated audit summaries.

## Core Prompt (Claude 3 Haiku)

**System Prompt**:
> "You are an expert financial consultant for tech companies specializing in AI cost optimization."

**User Prompt Structure**:
```text
You are a financial advisor specializing in AI cost optimization. Write a compelling, professional summary for {{company}}.
  
Current monthly AI spend: ${{currentSpend}}
Potential monthly savings: ${{savings}} ({{percentage}}% reduction)
Tools audited: {{tools}}

Provide a concise, executive-level summary of where the savings come from (focusing on plan optimization and model selection) and why they should act now. Keep it under 120 words.
```

## Prompt Rationale
- **Conciseness**: Limited to 120 words to ensure readability in the results dashboard.
- **Tone**: Professional/Executive to build trust with CFOs and Engineering Managers.
- **Specificity**: Explicitly mentions "plan optimization" and "model selection" to align with the rules-based engine results.
