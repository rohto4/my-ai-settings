---
name: knowledge-explainer-html
description: Design or revise the information structure and interaction model of a standalone knowledge HTML artifact: reading order, sections, comparison tables, independent columns, progressive detail, anchors, sorting, filters, and reader state. Use alone for structure-only work; for a new HTML artifact without a structure-only constraint, apply this skill first and knowledge-html-style second.
---

# Knowledge Explainer HTML Structure

Build the information architecture and interaction contract. Keep visual taste out of this skill.

## Control skill composition

- When the user explicitly asks for structure only or names only this skill, complete the structural pass without applying a visual theme.
- When creating a new knowledge HTML from scratch and the user has not requested another style, complete this structural pass, then read and apply `$knowledge-html-style` as a second pass.
- When the user asks only to restyle an existing HTML, do not change its structure; route to `$knowledge-html-style`.
- When both structure and style must change, finish and verify the structure before applying style. Do not alternate between them.

## Structure the reader journey

1. Define the main question, scope, reader, source boundary, and first decision.
2. Put a 30-second overview first: scope, main relationship, and what the artifact can and cannot answer.
3. Use tables for repeated comparison and give each column one meaning.
4. Add progressive detail with `details`, anchors, filters, scenario switching, or linked destinations. Keep the first layer useful without interaction.
5. Preserve a short path from overview to a chosen detail, typically no more than two clicks.

## Build review tables deliberately

- Put importance, frequency, difficulty, status, owner, or other independent fields in separate columns. Do not repeat combined field labels inside every row.
- Keep short categorical fields non-wrapping and allow deliberate horizontal scrolling for wide tables.
- Put each column filter directly below its column title in a second `thead` row. Do not place table-specific controls in a detached filter grid when column ownership matters.
- Make sortable headers explicit buttons with ascending/descending state and `aria-sort`.
- When useful, make categorical cell values clickable filters. A second click on the active value must clear that filter and remain synchronized with the header control.
- Keep tags and evidence/details in separate columns when they answer different questions.
- Preserve content visibility without JavaScript; treat sorting, filtering, flashing, and state storage as enhancements.

## Preserve revision boundaries

- If the user requests only formatting or style, do not redesign sections, reading order, or wording.
- If the user requests only a column or interaction change, limit structural edits to that table.
- Preserve row counts, IDs, anchors, stored reader state, and existing working interactions unless the request changes them.

## Verify structure and behavior

Check HTML and JavaScript syntax, expected row/item counts, unique IDs, internal anchors, filter-to-column mapping, sort direction toggles, click-filter toggle behavior, and state storage when present. Visually inspect when browser policy permits. Report unavailable checks rather than claiming them.

## Handoff

State the artifact path, structural changes, preserved boundaries, source limitations, and validation results. If `$knowledge-html-style` followed this pass, report structure and style changes separately.
