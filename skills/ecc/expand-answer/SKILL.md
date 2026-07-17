---
name: expand-answer
description: Expand the previous or specified answer with only the decision-relevant context, tradeoffs, evidence, risks, and next choices that were compressed earlier. Use when the user asks for more detail or a deeper explanation. Do not broaden the subject or repeat settled context.
---

# Expand Answer

1. Identify the exact answer and claims being expanded. Default to the immediately preceding assistant answer when unambiguous.
2. Lead with the same conclusion unless new evidence changes it; if it changes, explain why.
3. Add only the missing background, evidence, tradeoffs, risks, or examples needed for a decision.
4. Separate confirmed facts, inference, and recommendation.
5. Preserve repository-specific decisions and terminology.
6. Avoid generic tutorials, repeated premises, and unrelated adjacent topics.
7. End with at most three decisions or next actions when they are genuinely needed.

Use headings or a comparison table only when they materially improve scanning.
