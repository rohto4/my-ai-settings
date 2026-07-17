# Accessibility and Responsive UI

## Baseline checklist

- Use semantic landmarks, heading hierarchy, labels, and native controls before custom roles.
- Make all functionality usable with keyboard alone; never remove visible focus without an equivalent.
- Associate errors, help text, and status messages with their controls. Announce meaningful asynchronous changes without creating noisy live regions.
- For dialogs and menus, use the target project's accessible primitive where available; otherwise manage focus entry, focus containment when appropriate, Escape behavior, close control, and focus restoration.
- Do not communicate state with color, motion, position, or hover alone. Respect reduced-motion and contrast requirements.

## Responsive behavior

Start with content constraints rather than device labels. Verify narrow viewport, wide viewport, browser zoom, long localized strings, text-only zoom, high-contrast mode where supported, and touch targets. Give fixed-format UI stable dimensions or layout constraints so dynamic content does not cause overlap or cumulative layout shift.

Use responsive CSS and container-aware layout when available in the target stack. Do not fork business logic solely by viewport. Keep essential actions visible or reachable without hover, horizontal scrolling, or a precision pointer.

## Manual verification prompts

1. Can a keyboard user discover, operate, and exit every interactive element?
2. Does focus remain understandable after route changes, dialog close, validation failure, and async updates?
3. At 200% zoom and a narrow viewport, do text, controls, errors, and tables remain usable without overlap?
4. Does the layout preserve task priority when space is constrained?
