---
name: knowledge-explainer
description: Route and coordinate knowledge-explanation artifacts across diagram images, HTML information structure, and the user's preferred HTML visual style. Use when the output form is unspecified, when creating a knowledge HTML from scratch, or when a request may need structure-only, style-only, or sequential structure-then-style work.
---

# Knowledge Explainer Router

Choose the artifact type and add the selected skills to the working plan before editing.

- Use `$knowledge-diagram-image` for one stable overview, a responsibility boundary, or an actual information/data flow at a glance.
- For a new standalone HTML, use `$knowledge-explainer-html` first and `$knowledge-html-style` second. Complete the structural pass before the style pass.
- For an existing HTML structure-only revision, use `$knowledge-explainer-html` alone.
- For an existing HTML visual-only revision, use `$knowledge-html-style` alone and preserve content, sections, and behavior.
- For an existing HTML request that changes both structure and appearance, use the same sequential order as a new HTML.
- Ask the user to choose only when image and HTML are equally suitable and the form materially changes the result.

Do not create both image and HTML by default. Preserve the source boundary in every workflow.
