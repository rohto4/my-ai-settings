# Forms and Failure States

## Form contract

For every form, define field names and types, required/optional status, validation messages, submit action, authorization, duplicate-submit behavior, success destination, and whether entries remain after failure. Validate at the server trust boundary even when client validation exists.

Use native `<form>`, `<label>`, `<button type="submit">`, and associated error text unless the target component system provides an accessible equivalent. Disable or make submission idempotent while pending, but do not discard input after a recoverable failure.

## State matrix

| State | User-visible behavior |
| --- | --- |
| Initial | Explain only the information needed to complete the task; show valid defaults. |
| Invalid input | Identify the affected field and describe the correction without color alone. |
| Submitting | Preserve values, prevent accidental duplicate work, and expose progress. |
| Success | Confirm the outcome or navigate to the resulting resource. |
| Recoverable failure | Keep input, provide an actionable retry or correction path, and avoid exposing internals. |
| Permission failure | Explain the allowed next action without revealing protected data. |
| Unavailable/network failure | Distinguish temporary unavailability where useful and give a safe retry path. |

## Schema and transport

Keep schema definitions close to the domain boundary and map validation errors deliberately to UI fields. A browser-side schema can improve feedback, but server parsing and authorization decide whether the mutation succeeds. Treat files, dates, locale-sensitive values, and optimistic writes as explicit contracts, not incidental form values.

## Error boundaries

Use framework-supported route or segment error handling where available for render/data failures. Use client error boundaries only where a client subtree needs isolated recovery. Error fallbacks should include a safe retry/reset action when retry makes sense, preserve a path out of the failure, and report diagnostics through the target project's approved observability path. Never expose secrets, stack traces, or internal identifiers to users.

## Loading and empty states

Match loading placeholders to the final information hierarchy and avoid UI that implies data is final while a mutation or navigation is still pending. Empty state is a normal product state: describe the current absence and offer the permitted next action. Keep destructive actions distinct from transient failure recovery.
