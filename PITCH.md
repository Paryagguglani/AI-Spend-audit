# Pitch - Credex AI Spend Audit

### In one sentence: who is this tool for, and why would they share it?
Credex Audit is a high-conviction lead-gen tool for CFOs and Engineering Managers to identify AI over-provisioning and consolidate fragmented tool sprawl into professional team plans; they share it because it turns a vague "high bill" into a defensible, data-backed optimization strategy in under 3 minutes. (279 characters)

### The single thing I’m most proud of in this build
The **Rules-Based Audit Engine**. While many AI apps are thin wrappers around an LLM, I built a robust logic engine that encodes the actual pricing tiers and optimization triggers for 10+ major AI tools. It doesn't just "guess" savings; it calculates them based on real-world constraints like seat minimums for Team plans or the cost-benefit of switching from Sonnet to Haiku for API usage. Shipping this defensible logic layer means the AI-generated summary isn't just creative writing—it’s grounded in hard financial facts that would pass a CFO’s smell test. (104 words)

### The single thing I’d fix first if you had another 48 hours
The **API Token Consumption Audit**. Currently, the engine handles "API direct" usage by asking for a monthly cost, but it doesn't analyze the *mix* of traffic. I'd add a separate input flow for data teams to input their token usage (Input vs Output) and use-case complexity. This would allow the engine to recommend specific "Model Mixing" strategies—like routing 90% of basic extraction tasks to GPT-4o-mini while reserving Claude 3.5 Sonnet for high-reasoning tasks. This level of technical depth would transform the tool from a "seat counter" into a true AI FinOps platform for high-scale engineering teams. (108 words)
