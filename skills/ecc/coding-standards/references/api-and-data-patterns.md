# API And Data Examples

Use this reference only after identifying the target project's API contract, authentication,
authorization, persistence model, migrations policy, pinned dependencies, and current
official documentation. Existing service/domain conventions are authoritative.

## HTTP Contracts

Choose verbs, paths, status codes, pagination, and error envelopes from the application's
existing public contract. Do not introduce a generic envelope merely for consistency with an
unrelated service. Validate untrusted input at the boundary and map failures to the error
model callers already consume.

```text
GET    /api/markets
GET    /api/markets/:id
POST   /api/markets
PATCH  /api/markets/:id
```

Schema validation can make boundary rules explicit when it is the project's chosen tool.

```ts
const createMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
})
```

## Data Access

Request only fields needed by the behavior when that does not conflict with established
repository patterns. Treat query shape, transactions, locking, pagination, caching, and
authorization filters as correctness concerns, not just performance choices.

```ts
const { data } = await supabase
  .from('markets')
  .select('id, name, status')
  .limit(10)
```

Do not apply this example to another ORM, SQL dialect, policy model, or database driver without
checking the project's pinned version and current official documentation. Test contract and
data-boundary failures, including invalid input, authorization, missing records, and retries
where relevant.
