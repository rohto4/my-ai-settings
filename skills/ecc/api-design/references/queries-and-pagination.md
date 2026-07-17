# Collection Queries and Pagination

Use this reference for list, search, export, and relationship collection
endpoints. Confirm the target system's data model, indexes, consistency model,
and existing query convention before choosing syntax.

## Query Contract

Document supported filters, value formats, repeated-value behavior, sort keys,
default order, field selection, relation inclusion, page limit, and invalid
parameter behavior. Examples of possible conventions are:

```text
GET /api/v1/orders?status=active&customer_id=abc-123
GET /api/v1/products?price[gte]=10&price[lte]=100
GET /api/v1/orders?created_at[after]=2025-01-01
GET /api/v1/products?category=electronics,clothing
GET /api/v1/products?sort=-featured,price,-created_at
GET /api/v1/users?fields=id,name,email
GET /api/v1/orders?include=customer.name
GET /api/v1/products?q=wireless+headphones
```

These syntaxes are alternatives, not a universal grammar. Whitelist filter and
sort fields, define operator types, normalize or reject duplicates predictably,
and enforce an upper limit. Ensure any field selection or include operation
cannot expose fields the caller is not authorized to read.

## Offset Pagination

Offset pagination is simple and supports direct page navigation:

```text
GET /api/v1/users?page=2&per_page=20
```

It can degrade for large offsets and shift under concurrent inserts or deletes.
The formerly common "small dataset under 10K" rule of thumb is only an
illustrative starting point. Use actual query plans, indexes, service limits,
and user needs to decide.

## Cursor Pagination

Cursor pagination has stable work per page when it is backed by an appropriate
ordered index:

```text
GET /api/v1/users?cursor=eyJpZCI6MTIzfQ&limit=20
```

Return an opaque token and explicit continuation metadata, for example:

```json
{
  "data": [],
  "meta": { "has_next": true, "next_cursor": "eyJpZCI6MTQzfQ" }
}
```

Define the ordered fields, tie-breaker, sort direction, token scope, expiry,
tamper handling, and behavior if a filtered item changes. Do not expose a raw
database key in a cursor unless the project's security and compatibility rules
allow it. Fetching one additional result is a common `has_next` implementation
technique, but validate it against the chosen datastore and pinned library.

## Selection Heuristics

Use offset pagination when direct page navigation and stable total counts are
required and the datastore can sustain the bounded query. Use cursor pagination
for feeds, large or changing collections, and predictable continuation cost.
Search interfaces may need offset-like navigation, but this is a product and
search-engine decision rather than a REST rule.
