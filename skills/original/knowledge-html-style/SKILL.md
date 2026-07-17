---
name: knowledge-html-style
description: Apply the user's preferred dense, high-contrast, space-efficient dark review-table style to a standalone knowledge HTML artifact. Use for restyling, removing wasted space, compacting overview metrics and short guidance, balancing wide-screen layout, or equalizing peer table columns without changing content or behavior; use after knowledge-explainer-html for new HTML.
---

# Knowledge HTML Style

Apply only the visual layer. Preserve the artifact's information architecture, section order, labels, data, links, filters, sorting, state behavior, and JavaScript semantics unless the user separately asks to change them.

## Apply the canonical baseline

1. Read [assets/dense-review-theme.css](assets/dense-review-theme.css) completely.
2. Inline the CSS into the standalone HTML. Do not leave a runtime dependency on the skill folder.
3. Reuse its tokens and component classes. Add minimal classes to existing markup when needed; do not rebuild sections merely to fit the theme.
4. Keep the result self-contained and UTF-8.

Treat the asset as the default, not as inspiration. Change palette, density, radius, or link treatment only when the user explicitly requests a different visual direction.

## Preserve these style invariants

- Use near-black navy for the page, dark navy/teal for panels, and a brighter teal header band.
- Use near-white body text, light blue-gray secondary text, and warm yellow links. Keep links underlined or otherwise identifiable without color alone.
- Target at least 7:1 contrast for ordinary text and 4.5:1 as the hard minimum. Keep focus outlines clearly brighter than their background.
- Use 13px body text, 12px table cells, 11px table headers, compact 6px × 7px cell padding, and approximately 1.35 line height unless readability requires a small adjustment.
- Prefer strong grid lines, collapsed borders, square panels, 0–2px radii, and no decorative shadows.
- Use whitespace to separate major sections, not to inflate every card or table row.
- Keep short categorical cells on one line and allow deliberate horizontal table scrolling rather than wrapping every value.
- Make selected filters visually unmistakable with the warm accent on a dark foreground. Keep hover, focus, selected, unread, in-progress, and completed states distinguishable by both text and styling.
- Gray out completed rows strongly without making their text impossible to recover on hover.

## Eliminate spatial waste

Apply this density pass in order:

1. Remove empty space, oversized type, redundant wrappers, and decorative padding before shrinking readable text. Do not remove information unless the user requests it.
2. Treat the viewport as a budget. On a wide screen, place two short sibling groups side by side—often 50% / 50%—instead of giving each a full-width row.
3. Keep compact repeated items in one row when their minimum readable width permits it. A group of four metrics and a group of three short guidance items should normally use four and three internal columns.
4. Give semantic peers equal widths. Keep identifiers, ranks, and totals narrow; divide the remaining width equally among equivalent status or comparison columns.
5. Use fixed table layout only for short, predictable cells. Keep prose-heavy columns flexible and allow intentional horizontal scrolling.
6. Keep a short title on one line with a purposeful compact font. Avoid a large multiline hero when the page is a working review surface.
7. Stack sibling groups only below the width where their cells stop being readable. Reduce repeated-item columns again on small screens.

Use `review-summary-split`, `review-metric-grid`, `review-guidance-grid`, and `review-equal-peer-table` from the canonical CSS when they fit. Set `--review-metric-columns`, `--review-guidance-columns`, and `--review-peer-width` from the actual item counts; do not add empty columns to satisfy the defaults.

## Keep style and structure separate

- Do not add, remove, merge, or reorder sections.
- Do not change a combined field into columns, move filters, or add sorting in this skill; those are structure and interaction decisions for `$knowledge-explainer-html`.
- Do not turn a review table into a dashboard/card layout.
- When revising an existing artifact, inspect the diff and confirm that content text and data rows were not unintentionally changed.

## Verify

Check CSS syntax, focus visibility, link/background contrast, header/text contrast, dense-table overflow, and the visual states used by the artifact. At desktop width, verify that short sibling groups do not consume separate full-width rows, semantic peer columns have equal computed widths, and no card or title is large without carrying proportionate information. At narrow width, verify deliberate stacking without clipped text. Confirm that content, section order, links, data, and JavaScript behavior are unchanged. Visually inspect in the available browser when policy permits. If local `file://` navigation is blocked, report that boundary and rely on static checks without trying another browser surface as a workaround.

## Handoff

Report the styled HTML path, any intentional deviations from the canonical theme, contrast results when measured, and whether visual inspection was available.
