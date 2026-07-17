# Resources and HTTP Semantics

Use this reference after identifying the target project's established URL,
representation, and versioning conventions. The examples are design prompts,
not a substitute for the project's contract or current HTTP/platform guidance.

## Resource Shapes

Prefer plural, lowercase resource nouns with the project's established word
separator. A conventional shape is:

```text
GET    /api/v1/users
GET    /api/v1/users/{userId}
POST   /api/v1/users
PUT    /api/v1/users/{userId}
PATCH  /api/v1/users/{userId}
DELETE /api/v1/users/{userId}

GET    /api/v1/users/{userId}/orders
POST   /api/v1/users/{userId}/orders
```

Use a nested path only while it clarifies a stable relationship or ownership
scope. Do not create arbitrary deep paths. For an operation that cannot be
modelled as state on a resource, an explicit action can be reasonable:

```text
POST /api/v1/orders/{orderId}/cancel
POST /api/v1/auth/login
POST /api/v1/auth/refresh
```

Avoid verb-named reads such as `/getUsers`, singular collections such as
`/user`, and naming styles inconsistent with neighboring endpoints.

## Method Semantics

| Method | Typical meaning | Safe | Idempotent expectation |
| --- | --- | --- | --- |
| `GET` | Retrieve a representation | Yes | Yes |
| `POST` | Create under a collection or invoke a justified action | No | Not by default |
| `PUT` | Replace a representation at a known URI | No | Yes when replacement semantics hold |
| `PATCH` | Apply a defined partial change | No | Depends on the patch format and operation |
| `DELETE` | Remove or request removal of a resource | No | Usually, but define repeated-delete behavior |

Do not infer idempotency from the method alone. State the observable result of
repeating the request, including response status and body, for the target API.

## Status Selection

| Situation | Typical status | Contract question |
| --- | --- | --- |
| Successful read or synchronous update with body | `200` | What representation is returned? |
| New addressable resource | `201` | Is `Location` present and stable? |
| Accepted asynchronous work | `202` | How is completion queried or delivered? |
| Success without a body | `204` | Are headers sufficient for clients? |
| Malformed request or invalid syntax | `400` | Which parsing rule failed? |
| Authentication absent or invalid | `401` | Is the authentication challenge correct? |
| Authenticated but not permitted | `403` | Should existence be intentionally concealed? |
| Resource absent | `404` | Does this leak a protected identifier? |
| Duplicate or invalid lifecycle transition | `409` | What state or uniqueness rule conflicted? |
| Semantically invalid, structurally valid input | `422` where adopted | Does the project distinguish it from `400`? |
| Rate limit exceeded | `429` | What retry information is supplied? |
| Unexpected server failure | `500` | Is the public error safe and correlated? |
| Failed upstream dependency | `502` or `503` as appropriate | Is retry behavior known? |

Status code use is part of the public contract. Confirm the chosen code against
the target API's prior behavior and current official platform documentation,
especially when frameworks map validation or exceptions automatically.
