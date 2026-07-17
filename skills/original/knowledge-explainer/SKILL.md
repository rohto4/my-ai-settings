---
name: knowledge-explainer
description: Route a request for a knowledge explanation to the appropriate diagram-image or standalone-HTML workflow when the requested output form is not yet specified.
---

# Knowledge Explainer Router

Choose one specialized skill before producing an artifact.

- Use `$knowledge-diagram-image` when the reader needs one stable overview, a responsibility boundary, or a real flow at a glance.
- Use `$knowledge-explainer-html` when the reader needs comparison, progressive detail, links, status, filters, or multiple reading depths.
- Ask the user to choose only when both forms are equally suitable and the output form would materially change the result.

Do not make both by default. Preserve the source boundary in either workflow.
