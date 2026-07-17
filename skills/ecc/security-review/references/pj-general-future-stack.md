# pj-general Future Stack Adoption Guidance

Load this reference only after `pj-general`'s current project source of truth
explicitly records adoption and a pinned version for the relevant technology.
Until then, Next, Hono, Drizzle, Better Auth, Vitest, and Playwright are future
first candidates, not current P0 assumptions for this review skill.

When adoption is confirmed, read the project source of truth first, then verify
the exact version-specific behavior in the technology's current official
documentation. Do not infer implementation, security defaults, session or CSRF
behavior, data scope, test capability, or middleware ordering from this file.

Review Better Auth only if that adoption is confirmed. Apply the general
identity, authorization, delegation, session, and CSRF review flow from the
active skill and [identity and state](identity-and-state.md); do not substitute
a library name for evidence of a correctly configured security boundary.
