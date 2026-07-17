# Frontend Examples

Use this reference only for a React project after reading its local instructions and checking
the pinned React, TypeScript, and build-tool versions against current official documentation.
The repository's component, styling, accessibility, and state-management conventions win.

## Components And State

Keep component props explicit when the local codebase uses TypeScript. Use the state update
form appropriate to whether the next value depends on the previous value.

```tsx
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

export function Button({ children, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{children}</button>
}

setCount(previous => previous + 1)
```

Extract a custom hook when stateful behavior has a stable, independently testable purpose;
do not extract merely to reduce a few lines. Handle loading, empty, and error states in the
form established by the application. Prefer readable branches over deeply nested expressions.

## Effects And Performance

Check dependencies, cleanup, cancellation, and stale-result behavior for effects that perform
I/O or subscribe to resources. Memoization, lazy loading, and callback stabilization should
address an observed render or bundle-cost issue, not be applied by default.

```tsx
const sortedMarkets = useMemo(
  () => [...markets].sort((left, right) => right.volume - left.volume),
  [markets],
)
```

For accessibility, routing, data fetching, and server/client boundaries, follow the framework
and repository documentation rather than general patterns in this skill.
