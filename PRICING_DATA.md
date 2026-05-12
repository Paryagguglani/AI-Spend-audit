# Pricing Data & Optimization Rules

This document outlines the hardcoded pricing data and logic used by the Credex Audit Engine.

## Supported Tools

### 1. OpenAI
- **Plus**: $20/seat
- **Team**: $30/seat
- **Enterprise**: ~$60/seat (Estimated)
- **Optimization Rules**:
    - If >5 seats on Plus -> Recommend Team plan for admin controls and privacy.
    - If high API spend -> Recommend GPT-4o-mini (estimated 40% savings on tokens).

### 2. Anthropic
- **Pro**: $20/seat
- **Team**: $30/seat
- **Optimization Rules**:
    - If >10 seats -> Recommend Team plan for centralized billing.

### 3. GitHub Copilot
- **Individual**: $10/seat
- **Business**: $19/seat
- **Enterprise**: $39/seat
- **Optimization Rules**:
    - Seat utilization audit if >20 seats.

### 4. Midjourney
- **Basic**: $10
- **Standard**: $30
- **Pro**: $60
- **Mega**: $120
- **Optimization Rules**:
    - Flat 20% discount for switching to annual billing on Pro/Mega tiers.

## Global Fallback
For any tool not explicitly mapped, the engine suggests an **Annual Billing Optimization** with a standard **15% savings** factor.
