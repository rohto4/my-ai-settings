# Candidate Project Stacks

Read this only after the target project confirms both adoption and its pinned version in its
manifest/lockfile and project documentation. These are future first-choice candidates for
`pj-general`, not its current P0 stack and not a mandate for another project.

Before using framework-specific APIs, configuration, CLI flags, or compatibility claims:

1. Read the target project's local authority and identify its pinned package version.
2. Open the current official documentation that matches that version (or its maintained
   versioned documentation).
3. Follow repository test scripts and CI policy; do not install, upgrade, or reconfigure a
   framework merely to apply this workflow.

| Confirmed candidate | Use this official primary source after confirmation |
| --- | --- |
| Next.js | <https://nextjs.org/docs> |
| Hono | <https://hono.dev/docs> |
| Drizzle ORM | <https://orm.drizzle.team/docs> |
| Better Auth | <https://www.better-auth.com/docs> |
| Vitest | <https://vitest.dev/guide/> |
| Playwright | <https://playwright.dev/docs> |

For Vitest, read its official guide/configuration and match the project's Vite/Node/tooling
constraints before changing setup. For Playwright, use its official runner, locator,
assertion, trace, and retry guidance only after the project adopts it. For Next.js, Hono,
Drizzle, and Better Auth, derive unit/integration/contract/E2E boundaries from the project's
actual route, persistence, authentication, and deployment architecture rather than copying
generic examples.
