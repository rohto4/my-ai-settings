---
name: plan-canvas
description: Present a dense plan or decision artifact as a compact local HTML review surface in the Codex in-app browser. Use when pointing, filtering, and jumping between sections is easier than reading a long Markdown plan; do not use for code-diff review or a running web application.
---

# Plan Canvas

Turn an existing plan into a serverless visual review artifact. The HTML improves navigation and comparison; the plan file remains the source of truth until the user approves a revision.

## Start and Boundaries

1. Read the target PJ's `AGENTS.md`, `PROJECT.md`, current task, and the exact plan from disk.
2. Confirm the plan is reviewable enough to visualize. If objectives, scope, or decisions are missing, return to the planning skill instead of decorating an incomplete plan.
3. Write the HTML only to a location allowed by the target PJ or explicitly named by the user.
4. Do not start a local server. Produce a standalone file or a local folder that opens by `file://` in the Codex in-app browser.
5. Do not claim that browser annotations, embedded chat, or an approval button are connected to Codex unless that integration exists and has been verified. Collect decisions in the task conversation.
6. Use `code-review-and-quality` for diffs, `browser-qa` for runtime behavior, and `prp-create-plan` or `blueprint` when the plan itself still needs to be created.

## Review Surface

Keep the first viewport decision-oriented:

- objective, scope, current status, and requested decision;
- 3–7 major phases or workstreams;
- dependency or sequence view only when it clarifies order;
- open decisions, risks, and blocking assumptions;
- acceptance and completion conditions.

Then provide compact details:

- one row or card per execution unit;
- owner or responsibility, inputs, outputs, affected files/systems, and verification;
- links from overview items to detail anchors;
- filters for status, phase, owner, or risk when the plan is large;
- a clear source-plan path and generated timestamp.

Use arrows only for a defined dependency, handoff, or data flow. Label what moves and in which direction. Use color by semantic role; use lightness changes for states or layers of the same role.

## Interaction and Style

- Use buttons, anchors, filters, and sorting only when they shorten review.
- Highlight a jumped-to target briefly so the user can recover even when scroll positioning is imperfect.
- Preserve keyboard navigation, visible focus, semantic headings, readable contrast, and horizontal scrolling for genuinely wide tables.
- Use `knowledge-html-style` for the user's dense, square, high-contrast visual language. Do not replace the plan's section structure merely to fit a style template.
- Persist personal reading state in `localStorage` only as convenience. Canonical decisions and progress remain in PJ task files.

## Review Loop

1. Generate the local artifact and validate HTML/JavaScript syntax.
2. Open it in the Codex in-app browser when that capability is available; otherwise provide the local file link.
3. Ask for review in chat, naming the sections that need a decision.
4. Apply requested changes to the source plan first, then regenerate the canvas.
5. Stop when the user closes or defers review. Do not reopen or continue polling without a new request.

On resume, reread the source plan and task record; do not assume the old HTML or conversation summary is current.

## Completion

Complete when the local HTML opens, overview-to-detail navigation works, filters/sort behave, the source plan path is visible, and the user can identify open decisions within the first viewport. Approval is a chat decision recorded in the PJ task or decision file, not an HTML-only state.

## Upstream domain reference

Read [Upstream domain guide](references/upstream-domain-guide.md) when the request needs source-specific procedures, examples, decision tables, or provider/framework details. Treat legacy runtime commands and live operations as non-authoritative examples subject to this skill's current safety and approval gates.
