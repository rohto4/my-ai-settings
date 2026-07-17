# State Ownership and Data Flow

## Ownership order

Choose one source of truth in this order unless the target architecture documents another rule:

1. **URL state** for shareable, restorable navigation state.
2. **Server state** for persisted data and its cache/revalidation lifecycle.
3. **Local component state** for transient UI state owned by one subtree.
4. **Lifted state** when sibling components need coordinated interaction.
5. **Context or external store** only for genuinely cross-cutting state with a documented lifetime and update model.

Do not store a value that can be calculated from props, URL, or another state value. Do not mirror server records in a global client store merely to make them available everywhere.

## Data-flow contract

For each read or write, record:

| Concern | Decide |
| --- | --- |
| Read | Source, authorization boundary, freshness, and empty state |
| Write | Validation, idempotency/duplicate-submit handling, and success result |
| Cache | Revalidation/invalidation owner and scope |
| Optimism | Preconditions, rollback behavior, and reconciliation with server result |
| Failure | Message, retained input, retry path, and telemetry policy |

Keep an update trace reviewable: user event -> input validation -> mutation -> server result -> cache/route update -> rendered UI.

## Context and reducer guidance

Use a reducer when a feature has a coherent state machine with several related transitions. Keep provider scope tight and avoid a single application-wide context for unrelated state. Split values or selectors when frequent updates would rerender broad subtrees.

```tsx
type DialogState = { open: boolean; orderId: string | null }
type DialogAction =
  | { type: 'open'; orderId: string }
  | { type: 'close' }

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  return action.type === 'open'
    ? { open: true, orderId: action.orderId }
    : { open: false, orderId: null }
}
```

The reducer centralizes transitions; it does not replace server-state ownership or an API contract.

## Async client reads

Use a project-adopted data library only when client-side freshness, background refetching, offline behavior, or shared cache semantics require it. Define cache keys from all request inputs, cancellation/late-result handling, retry behavior, and what the UI renders for loading, empty, error, and stale data. Confirm library APIs against the pinned version and current official docs.
