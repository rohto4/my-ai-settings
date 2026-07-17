---
name: mcp-server-patterns
description: Design, implement, refactor, or debug an MCP server against the current protocol and a pinned official SDK. Use when exposing tools, resources, or prompts; choosing or testing stdio or HTTP transport; upgrading an SDK; or adding schemas, auth, and safe external-action boundaries. Do not use for an ordinary internal API or CLI, for merely consuming an existing MCP server, or when a simpler skill or local function satisfies the capability.
---

# MCP Server Patterns

Build the smallest MCP surface that satisfies the client use case. Keep protocol, business logic, external effects, and transport independently testable.

## Restore project truth and current protocol

1. Read the target PJ's actual `AGENTS.md`, `PROJECT.md`, pinned stack, architecture decisions, security policy, and current task state before selecting an SDK or transport.
2. After compaction, session transfer, or handoff, reread them from disk. Project decisions and pinned versions outrank this skill, memory, and old code examples.
3. Record the target MCP protocol revision or compatibility requirement, official SDK and exact version, client capabilities, transport, authentication model, deployment target, and supported operating systems.
4. Verify method names, schemas, lifecycle, and transport behavior against the current official [MCP documentation](https://modelcontextprotocol.io) and the selected official SDK's source, release notes, and examples. Record URLs and access date. Do not rely on Context7, a blog, or an old snippet as the sole authority.
5. Pin dependency versions according to PJ policy. Do not install or upgrade an SDK as a side effect of reading this skill; dependency mutation requires an explicit implementation request and reviewed diff.

On Windows, use PowerShell-safe commands, `-LiteralPath`, explicit drive-letter paths, and the PJ's pinned package runner. Do not replace a working Windows path with an unverified Bash-only setup.

## Confirm MCP is the right surface

Use MCP when a client needs discoverable, structured tools, resources, or prompts across a protocol boundary. Prefer a plain local function, CLI, API, scheduled worker, or skill when no MCP client interoperability is required. Avoid publishing an MCP tool that merely mirrors every backend endpoint without a model-facing use case and safety contract.

## Design the capability boundary

- **Tools:** model-invoked actions. Give each a narrow purpose, unambiguous description, validated input, bounded output, side-effect declaration, and retry/idempotency behavior.
- **Resources:** read-only, addressable context. Define URI identity, freshness, pagination, authorization, content type, and size limits.
- **Prompts:** reusable client-visible templates. Keep arguments explicit and never embed secrets or hidden authority.
- **Server metadata:** use stable names and versions; expose only capabilities the implementation and target clients actually support.

Keep handlers independent from transport and delegate business logic or external I/O to explicit ports/adapters. Do not let schemas claim stricter validation or safer effects than the handler enforces.

## Safe write and secret boundary

- Default external integrations to read-only or fake adapters. For a write-capable tool, provide a fake transport or dry-run that returns the intended target, payload summary, effect, cost, and required approval without performing the action.
- Require explicit approval from the user immediately before a live external write or destructive action. Scope approval to the exact tool call, target, effect, and expiry; do not infer approval from tool availability.
- Protect retries with idempotency keys or duplicate detection. Separate preview from apply and make destructive actions visibly distinct from reads.
- Never put API keys, tokens, Cookies, authorization headers, connection strings, private payloads, or authenticated response bodies in source, schemas, prompts, tool results, test fixtures, command lines, or logs. Inject secrets through the PJ's secret boundary and redact diagnostics.
- Return bounded structured errors. Do not expose raw stack traces, environment dumps, headers, SQL, filesystem paths containing secrets, or provider bodies to the model.

## Transport contract

Select transport only after checking the current specification and target client:

- For stdio, reserve stdout for protocol frames. Send only sanitized diagnostics to the approved logging channel, and test process startup, shutdown, malformed input, and cancellation on the target OS.
- For remote HTTP, verify the currently supported MCP transport, session model, authentication, authorization, TLS, origin controls, rate limits, timeouts, cancellation, and deployment lifecycle. Support legacy transport only for a documented client-compatibility requirement.
- Keep the same capability behavior across transports. Transport adapters must not silently broaden tool authority or resource visibility.

## Implementation workflow

1. Write a capability table: name, type, user purpose, input/output schema, data class, read/write effect, approval, idempotency, timeout, and evidence.
2. Implement schemas and pure handler logic first. Put live provider calls behind interfaces that can be replaced by fakes.
3. Connect a fake or in-memory transport and synthetic data. Validate capability listing, invocation, result serialization, errors, cancellation, and shutdown without live credentials.
4. Add the selected official SDK and real transport only at the pinned version and with current official signatures.
5. Integrate real read-only dependencies next. Gate every live write, paid request, deployment, or destructive path separately.

## Verification

Test at least:

- schema-valid and invalid inputs, unknown capabilities, and output size limits;
- fake handler success, provider failure, timeout, cancellation, retry, and duplicate request;
- resource URI, pagination, freshness, and authorization boundaries;
- write-tool dry-run, missing approval, expired approval, wrong target, and idempotent replay;
- secret and log redaction, including negative tests for headers and provider errors;
- transport startup, capability negotiation, disconnect, and clean shutdown on the target OS;
- compatibility with the named client and pinned SDK/protocol versions.

Use synthetic or explicitly authorized sanitized data. A live provider, external write, paid API, deploy, or production credential requires a separate approved test plan.

## Stop, handoff, and completion

Stop when current official docs or the pinned SDK cannot be verified, target-client capabilities are unknown, auth or tenant isolation is unresolved, the fake transport cannot reproduce the handler contract, a secret could enter logs/results, or a live/destructive action lacks approval. Do not guess an SDK method or weaken validation to make an example run.

For context pressure or handoff, record PJ sources reread, protocol and SDK versions, official references and access date, capability table, transport/auth decision, fake-test results, approval state, unresolved compatibility issues, artifact paths, and next read-only step.

Complete only when schemas and descriptions match implementation, fake-transport and negative tests pass, secret/log boundaries are verified, target-client compatibility is evidenced, approved live tests are distinguished from synthetic tests, and every write-capable tool has dry-run, approval, idempotency, and post-action evidence. If the correct decision is not to use MCP, document the simpler selected surface and its rationale.
