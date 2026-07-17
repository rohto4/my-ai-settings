# Frontend Performance

## Investigate before optimizing

Use a production-like route and an observed problem, profiling result, bundle analysis, or explicit performance budget from the target project. Confirm framework and tooling guidance in the current official documentation for the pinned versions.

## High-value checks

- Keep data access on the server when possible; avoid serializing large payloads into client components.
- Remove sequential fetches that can be started together without changing authorization or error semantics.
- Load charts, editors, maps, and other heavy optional UI only where the user needs them; provide an appropriate fallback.
- Size and optimize images/fonts through the target framework's supported mechanism and avoid layout shifts.
- Paginate, window, or otherwise bound large lists only after validating item height, keyboard navigation, screen-reader behavior, and search/filter requirements.
- Use memoization only when profiling or stable prop identity shows a real render-cost benefit. Memoization also has complexity and memory costs.

## Safe examples

```tsx
// Derive without mutating the upstream array.
const sortedOrders = useMemo(
  () => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [orders],
)
```

```tsx
// Code split an optional client-only feature after checking the framework's supported API.
const Chart = dynamic(() => import('./chart'), { loading: () => <ChartSkeleton /> })
```

The second example is framework-dependent. Verify the import mechanism, server-rendering behavior, and fallback semantics in the pinned framework's current official documentation before use.

## Regression checks

Confirm loading/error fallback behavior, keyboard flow, image dimensions, client bundle impact, and behavior on slow network or constrained device emulation. Do not claim a performance improvement without the measurement or budget that supports it.
