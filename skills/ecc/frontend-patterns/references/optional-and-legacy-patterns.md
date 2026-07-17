# Optional and Legacy Patterns

This file preserves useful older patterns from the source skill. They are choices, not defaults. Apply only after checking the target project's adopted libraries, accessibility requirements, bundle budget, and pinned versions.

## Composition and compound components

Component composition is usually preferable to inheritance. A compound component can make a tightly coupled UI API coherent, but it adds implicit context and coordination. Prefer explicit props for simple cases, and verify keyboard and ARIA behavior for interactive widgets.

```tsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

## Custom hooks

Extract a custom hook when it captures a reusable stateful contract, not merely to move lines from a component. Define inputs, outputs, lifecycle/cancellation, error behavior, and whether it owns data or adapts an existing source. Do not implement a project-wide query abstraction when an adopted library or framework mechanism already owns caching semantics.

## Render props

Render props remain viable for explicit inversion of control, but are not the default for modern component composition. Prefer children, explicit props, hooks, or framework-supported patterns when they make ownership and types clearer. Do not introduce nested render-prop trees solely to share data loading.

## Animation libraries

Do not add Framer Motion or another animation dependency by default. Prefer CSS and platform features for simple transitions, honor reduced-motion, and add a library only when the approved interaction requirement exceeds those capabilities. Verify the current package and framework compatibility from official documentation before adoption.

## Manual keyboard widgets

Manual combobox, menu, tabs, and modal implementations are easy to get wrong. Prefer native controls or already-adopted accessible primitives. When custom behavior is unavoidable, follow the current WAI-ARIA Authoring Practices for the specific widget and test keyboard navigation, focus movement, screen-reader output, and touch behavior.
