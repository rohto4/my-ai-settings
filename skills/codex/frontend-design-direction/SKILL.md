---
name: frontend-design-direction
description: Choose and apply a purposeful visual direction for a website, application, dashboard, component, or other product UI before or during frontend implementation. Use when the interface feels generic, visually incoherent, mismatched to its audience, or needs explicit hierarchy, density, typography, color, layout, motion, and responsive judgment; do not use for structure-only HTML or a design-system audit.
---

# Frontend Design Direction

Make the interface look intentional for its product and repeated workflow. Use
the target repository's existing components and design system as authority; this
skill supplies direction and judgment, not a replacement visual framework.

## Route the request

- Use frontend-design for full frontend implementation when it is the owning
  build skill. Use this skill to make the visual direction explicit and to
  review whether the implementation expresses it.
- Use design-system when tokens, reusable components, governance, or
  cross-product consistency are the main problem.
- Use knowledge-html-style for the user's established dense standalone
  knowledge/review HTML style. Do not overwrite that specialized preference.
- Use browser-qa to verify the result in a real browser after implementation.
- Do not use this skill for backend-only work, information architecture alone,
  or an unsolicited restyle when the user asked only for functional changes.

## Read the design boundary

1. Read the repository instructions, product purpose, accepted requirements,
   existing UI, component library, tokens, assets, accessibility rules, and
   target devices.
2. Identify the repeated user job, audience, first information they must find,
   decisions they make, and the cost of visual noise or hidden controls.
3. Preserve established brand and product conventions unless the user requested
   a new direction. Flag conflicts rather than silently replacing them.
4. Do not add a dependency, remote asset, analytics, font service, deployment,
   or externally hosted content without explicit authorization. Keep secrets
   and personal data out of examples and screenshots.

## State one coherent direction

Before editing, describe:

- **purpose and audience:** what work this UI supports and who repeats it;
- **tone:** for example dense and technical, calm and operational, editorial,
  playful, refined, or utilitarian;
- **hierarchy:** what dominates the first viewport and what remains secondary;
- **spatial model:** wide-screen grouping, content width, density, and narrow
  screen fallback;
- **visual system:** typography roles, color roles, borders, elevation, icons,
  imagery, and motion;
- **signature detail:** one restrained idea that makes the UI recognizable;
- **constraints:** accessibility, performance, localization, framework, and
  existing tokens.

Choose from the actual domain. Do not default to a large marketing hero, purple
gradient, nested cards, decorative blobs, glass effects, or oversized type.

## Apply the direction

- Put the actual product, object, or workflow in the first viewport. Do not hide
  it behind generic feature copy when the page is a working tool.
- Use typography, contrast, borders, alignment, and whitespace to establish
  hierarchy before adding decoration.
- Treat color by semantic role. Keep unrelated actors or states visually
  distinct and represent same-role layers with controlled shades when useful.
- Give repeated peer items consistent geometry. Avoid empty cards, redundant
  wrappers, and padding that consumes more space than the information needs.
- Use existing icons for familiar actions and short labels for controls. Do not
  make critical actions depend on color or icon recognition alone.
- Design loading, empty, error, disabled, selected, hover, focus, success, and
  destructive states as part of the direction.
- Define responsive behavior intentionally: minimum readable cell widths,
  wrapping, fixed versus fluid regions, overflow, touch targets, and stacking
  points. Do not shrink text until the content technically fits.
- Use motion only to explain state, location, causality, or progress. Respect
  reduced-motion preferences and avoid decoration that delays work.

## Verify in the product

Check desktop and narrow viewports in the available browser. Verify text fit,
contrast, keyboard focus, accessible names, zoom behavior, image loading,
overflow, state visibility, and whether the first viewport communicates the
user's next action. Compare against the stated direction rather than personal
taste alone.

Report the chosen direction, source constraints followed, files or components
changed, intentional deviations, browser evidence, and any visual or
accessibility checks not run.

## Upstream domain reference

Read [Upstream domain guide](references/upstream-domain-guide.md) when the request needs source-specific procedures, examples, decision tables, or provider/framework details. Treat legacy runtime commands and live operations as non-authoritative examples subject to this skill's current safety and approval gates.
