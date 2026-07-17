---
name: bun-runtime
description: Choose, migrate, configure, or debug Bun as a JavaScript runtime, package manager, bundler, or test runner. Use when the target repository already uses Bun or is explicitly evaluating it; do not use for a Node project with no runtime decision.
---

# Bun Runtime

Bun is a fast all-in-one JavaScript runtime and toolkit: runtime, package manager, bundler, and test runner.

Read the target PJ's instructions, manifest, lockfile, installed Bun version, and current official Bun/platform documentation before applying examples. Do not replace Node, rewrite a lockfile, install dependencies, or change deployment settings unless the task explicitly authorizes migration or implementation.

## When to Use

- **Prefer Bun** for: new JS/TS projects, scripts where install/run speed matters, Vercel deployments with Bun runtime, and when you want a single toolchain (run + install + test + build).
- **Prefer Node** for: maximum ecosystem compatibility, legacy tooling that assumes Node, or when a dependency has known Bun issues.

Use when: adopting Bun, migrating from Node, writing or debugging Bun scripts/tests, or configuring Bun on Vercel or other platforms.

## How It Works

- **Runtime**: Drop-in Node-compatible runtime (built on JavaScriptCore, implemented in Zig).
- **Package manager**: `bun install` is significantly faster than npm/yarn. Lockfile is `bun.lock` (text) by default in current Bun; older versions used `bun.lockb` (binary).
- **Bundler**: Built-in bundler and transpiler for apps and libraries.
- **Test runner**: Built-in `bun test` with Jest-like API.

**Migration from Node**: Replace `node script.js` with `bun run script.js` or `bun script.js`. Run `bun install` in place of `npm install`; most packages work. Use `bun run` for npm scripts; `bun x` for npx-style one-off runs. Node built-ins are supported; prefer Bun APIs where they exist for better performance.

**Vercel**: Set runtime to Bun in project settings. Build: `bun run build` or `bun build ./src/index.ts --outdir=dist`. Install: `bun install --frozen-lockfile` for reproducible deploys.

## Examples

### Run and install

```bash
# Install dependencies (creates/updates bun.lock or bun.lockb)
bun install

# Run a script or file
bun run dev
bun run src/index.ts
bun src/index.ts
```

### Scripts and env

```bash
bun run --env-file=.env dev
FOO=bar bun run script.ts
```

PowerShell equivalent:

```powershell
$env:FOO = 'bar'
bun run script.ts
```

### Testing

```bash
bun test
bun test --watch
```

```typescript
// test/example.test.ts
import { expect, test } from "bun:test";

test("add", () => {
  expect(1 + 2).toBe(3);
});
```

### Runtime API

```typescript
const file = Bun.file("package.json");
const json = await file.json();

Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello");
  },
});
```

## Best Practices

- Commit the lockfile (`bun.lock` or `bun.lockb`) for reproducible installs.
- Prefer `bun run` for scripts. For TypeScript, Bun runs `.ts` natively.
- Keep dependencies up to date; Bun and the ecosystem evolve quickly.

## State and Completion

On resume, reread `AGENTS.md`, `PROJECT.md`, the manifest/lockfile, and current task from disk. For long-running migration work, keep active state in the task file and finished evidence in the completion log.

Stop when the pinned runtime, lockfile owner, Node-compatibility requirement, or deployment support is unclear. Hand off provider-specific deployment changes to the relevant deployment skill. Complete only after the repository's existing install/build/test commands pass with the chosen runtime and the lockfile/config diff is verified.

On Windows file operations, use PowerShell and `-LiteralPath`; verify resolved drive-letter paths before moving or deleting caches or lockfiles, and keep discovery and mutation in the same shell.
