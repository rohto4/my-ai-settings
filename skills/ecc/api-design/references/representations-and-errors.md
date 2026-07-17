# Representations and Error Contracts

Use this reference when the task changes request bodies, response bodies,
validation output, or serialization conventions. Preserve the target project's
existing casing, time format, nullability policy, and envelope convention.

## Illustrative Response Shapes

An envelope can make collection metadata and cross-cutting fields predictable:

```json
{
  "data": {
    "id": "abc-123",
    "email": "alice@example.com",
    "name": "Alice",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

For a collection, keep data separate from paging information and navigational
links only if that matches the API's established style:

```json
{
  "data": [
    { "id": "abc-123", "name": "Alice" },
    { "id": "def-456", "name": "Bob" }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 142, "total_pages": 8 },
  "links": { "self": "/api/v1/users?page=1&per_page=20", "next": "/api/v1/users?page=2&per_page=20" }
}
```

A flat resource response is also valid for internal APIs. Do not add an
envelope merely because this example has one; choose one convention per API
surface and document any transition.

## Error Shape

Keep a stable machine-readable code separate from a safe human-readable
message. Field errors should identify the input location and stable reason only
when the API can maintain them across validators and versions.

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "code": "invalid_format", "message": "Must be a valid email address" }
    ]
  }
}
```

Consider adding a request or trace identifier if the project already exposes
one. Do not include stack traces, SQL errors, provider responses, authorization
rules, tokens, or unredacted submitted values.

## Representation Decisions

- Define required, optional, nullable, read-only, write-only, defaulted, and
  deprecated fields distinctly.
- Define date/time precision and timezone, numeric precision and units, enum
  evolution, identifier opacity, and empty collection semantics.
- Reject unknown fields or tolerate them only according to existing project
  behavior; changing this can break generated clients.
- Treat response examples as contract tests only when the source-of-truth
  schema and pinned serializer behavior have been verified.
