---
name: nextjs-turbopack
description: Diagnose or configure Turbopack behavior in a pinned Next.js project. Use for dev startup, HMR, cache, webpack-compatibility, or bundle investigation; do not use for general Next.js UI architecture.
---

# Next.js and Turbopack

Next.js 16+ uses Turbopack by default for local development: an incremental bundler written in Rust that significantly speeds up dev startup and hot updates.

Treat version statements and flags below as orientation, not the target project's contract. Read the installed Next.js version, package scripts, config, lockfile, and current official documentation before recommending a command or mode.

## When to Use

- **Turbopack (default dev)**: Use for day-to-day development. Faster cold start and HMR, especially in large apps.
- **Webpack (legacy dev)**: Use only if you hit a Turbopack bug or rely on a webpack-only plugin in dev. Disable with `--webpack` (or `--no-turbopack` depending on your Next.js version; check the docs for your release).
- **Production**: Production build behavior (`next build`) may use Turbopack or webpack depending on Next.js version; check the official Next.js docs for your version.

Use when: developing or debugging Next.js 16+ apps, diagnosing slow dev startup or HMR, or optimizing production bundles.

## How It Works

- **Turbopack**: Incremental bundler for Next.js dev. Uses file-system caching so restarts are much faster (e.g. 5–14x on large projects).
- **Default in dev**: From Next.js 16, `next dev` runs with Turbopack unless disabled.
- **File-system caching**: Restarts reuse previous work; cache is typically under `.next`; no extra config needed for basic use.
- **Bundle Analyzer (Next.js 16.1+)**: Experimental Bundle Analyzer to inspect output and find heavy dependencies; enable via config or experimental flag (see Next.js docs for your version).

## Examples

### Commands

```bash
next dev
next build
next start
```

### Usage

Run `next dev` for local development with Turbopack. Use the Bundle Analyzer (see Next.js docs) to optimize code-splitting and trim large dependencies. Prefer App Router and server components where possible.

## Best Practices

- Stay on a recent Next.js 16.x for stable Turbopack and caching behavior.
- If dev is slow, ensure you're on Turbopack (default) and that the cache isn't being cleared unnecessarily.
- For production bundle size issues, use the official Next.js bundle analysis tooling for your version.

Do not delete `.next`, change bundler mode, install analysis tooling, rewrite config, or alter deployment settings during diagnosis unless the task authorizes the mutation. On Windows, use PowerShell and `-LiteralPath` for cache/config paths and verify the resolved drive-letter target before recursive deletion.

Use `frontend-patterns` for server/client ownership and UI state, and `performance-optimization` for a measured end-to-end bottleneck. Complete only when the exact pinned-version command reproduces the issue, the smallest change is verified, and build/dev behavior is rechecked.
