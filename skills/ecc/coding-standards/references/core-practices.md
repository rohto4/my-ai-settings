# Core Examples And Review Cues

These examples are aids, not universal rules. First follow repository instructions and
nearby conventions. Confirm language features and library behavior with the target
project's pinned versions and current official documentation.

## Naming And Types

Use names that make a value's role clear without expanding established domain vocabulary.
Boolean names often read clearly with `is`, `has`, `can`, or `should`; short indices can be
appropriate in a small local scope.

```ts
const marketSearchQuery = 'election'
const isUserAuthenticated = true

async function fetchMarketData(marketId: string) {}
function calculateSimilarity(left: number[], right: number[]) {}
```

Keep public types and contracts explicit where the project uses static typing. Avoid `any`
or an equivalent escape hatch unless a checked boundary makes it necessary.

```ts
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
}

function getMarket(id: string): Promise<Market> {
  // Implementation
}
```

## State, Errors, And Async Work

Prefer a non-mutating update when values may be shared or when it clarifies ownership. A
local mutation can be reasonable when the API requires it or profiling justifies it.

```ts
const updatedUser = { ...user, name: 'New Name' }
const updatedItems = [...items, newItem]
```

Check failure boundaries and preserve useful context. The project may prefer result types,
domain errors, or an error middleware instead of this direct `try`/`catch` pattern.

```ts
async function fetchData(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}
```

Use parallel async work only when operations are independent, concurrency is safe, and
failure/cancellation behavior remains correct.

```ts
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats(),
])
```

## Comments, Tests, And Smells

Comment non-obvious reasoning, constraints, or tradeoffs rather than restating code.
Document public APIs when the repository's users need contract, error, or unit semantics.

Write test names around observable behavior and include boundary or regression cases
proportional to risk. Arrange-act-assert can help when it fits the test framework.

```ts
test('returns an empty array when no markets match', () => {
  // Arrange
  const result = searchMarkets('missing')

  // Act and assert
  expect(result).toEqual([])
})
```

Investigate rather than mechanically rewrite long functions, deep nesting, unexplained
constants, duplicated code, unsafe type escapes, swallowed errors, and stale comments.
Early returns and named constants are useful when they improve the local code's clarity.

## Performance

Measure before optimizing where practical. Consider data size, hot paths, allocations,
network/database access, and UI responsiveness. Preserve correctness and readability unless
there is evidence that a performance tradeoff is necessary.
