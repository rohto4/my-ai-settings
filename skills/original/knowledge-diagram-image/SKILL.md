---
name: knowledge-diagram-image
description: Create or revise a presentation-ready Japanese diagram image that explains knowledge, operations, systems, or decisions at a glance. Use when the user asks for a diagram, visual overview, flow image, architecture image, or explanatory image.
---

# Knowledge Diagram Image

Create one stable visual explanation. Use the image-generation tool for a raster diagram and inspect the returned image before handoff.

## Extract the diagram model

Identify only source-supported items: reader question, scope, actors, responsibilities, inputs, actual transfers, decisions, outputs, and exceptions. Do not fill gaps with invented components.

Put the 30-second answer in the main visual structure. Keep labels short and Japanese. Prefer a responsibility or capability to a product-name list.

## Diagram contract

- Draw an arrow only for an actual transfer of information, data, request, configuration, control, or responsibility.
- Put the transferred item or branch reason beside every arrow.
- Do not use arrows for correspondence, classification, comparison, or conclusion. Use groups, headings, thin connectors, or labels such as `照合` and `判定`.
- Assign one hue to one actor or responsibility boundary. Use only lighter or darker versions of that hue for layers of the same actor.
- Express success, exclusion, risk, and priority with words, symbols, borders, line styles, or icons—not a new hue.
- Make normal flow and exception flow visually distinct and give each exception a reason.

## Compose the generation request

Include the title, intended reader, selected structure, source-backed actors, exact arrow labels, branch reasons, color-to-actor mapping, Japanese label requirement, and a ban on decorative arrows or unsupported steps.

After generation, check that arrows have concrete semantics, the color contract holds, labels are readable, and the full diagram answers the main question. Regenerate if these checks fail.

## Handoff

State the image path, the question it answers, source limitations, and the visual checks performed.
