# pj-general: Next App Router and Adopted UI/Form Stack

Read this file only for `pj-general` work after confirming its local `AGENTS.md`, `PROJECT.md`, `tech-stack.md`, lockfile, and existing code still adopt the named stack. These notes do not authorize adding or upgrading dependencies. Confirm version-dependent behavior from the current official Next.js, React Hook Form, Zod, and shadcn/ui documentation.

## App Router placement

- Treat App Router conventions and local route layout as the routing/rendering source of truth.
- Keep pages and layouts server-first. Isolate interactive controls behind minimal client boundaries.
- Decide route-level loading, error, and not-found behavior alongside the route change; do not leave failure behavior to a generic client catch-all.
- Follow the project's cache and mutation conventions. Do not introduce a second client cache without an explicit need.

## React Hook Form and Zod

- Use React Hook Form for forms only when it matches nearby implementation and the form needs its lifecycle/performance model.
- Define a Zod schema for the domain input and derive types where the pinned library versions support it.
- Re-parse and authorize on the server. Map errors to fields and a form-level message deliberately.
- Keep controlled adapters limited to components that require them; do not convert every input to controlled state by default.

## shadcn/ui

- Treat copied shadcn/ui components as project-owned source, not a runtime abstraction that overrides local conventions.
- Inspect the installed primitive and existing variants before changing markup or styles.
- Preserve accessible labels, focus behavior, disabled/pending state, error association, and responsive layout when composing components.
- Confirm current component guidance from shadcn/ui's official documentation before applying version-sensitive examples or commands.
