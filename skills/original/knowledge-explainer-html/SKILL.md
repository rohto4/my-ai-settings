---
name: knowledge-explainer-html
description: Create or revise a standalone interactive HTML artifact that explains technical, operational, or decision knowledge through comparison, progressive detail, links, and reader-controlled state. Use when the user asks for a readable HTML knowledge page, comparison table, explorable guide, or interactive explanation.
---

# Knowledge Explainer HTML

Create a self-contained UTF-8 HTML artifact unless the user specifies another delivery format. Use HTML for a reader who needs to compare, expand, revisit, or track understanding rather than only view one fixed overview.

## Structure the reader journey

1. Define the main question, scope, reader, source boundary, and first decision.
2. Put a 30-second overview first: scope, the main relationship, and what the artifact can and cannot answer.
3. Use tables for repeated comparisons. Give each column one question, such as capability, each party's role, relationship, decision criterion, and detail link.
4. Add progressive detail with disclosure, anchors, filters, or scenario switching. Keep the first reading layer useful without interaction.
5. Link each summary to a discoverable detailed destination when the user needs a second reading depth.

## Visual and interaction contract

- Assign colors by actor or responsibility; use tonal variation only inside the same actor.
- Do not use color alone for status. Pair state with text, symbols, and accessible contrast.
- Use flow arrows only for actual transfers. A comparison or inference is a label or grouping, not a flow.
- Make dense table overflow deliberate. Preserve a readable overview before horizontal scrolling.
- Keep JavaScript optional in spirit: essential content must remain visible if an enhancement is unavailable.
- If a detail link scrolls to an entry, make the target visually discoverable after the jump and respect reduced-motion preferences.

## Verify

Check HTML and JavaScript syntax, expected item counts, internal anchors, and state storage behavior when present. Visually inspect in the available browser when policy permits. Report any unavailable visual check instead of claiming it passed.

## Handoff

State the local artifact path, scope, source limitations, and validation result. Do not call a comparison exhaustive unless its sources and boundaries establish that.
