# Implementation Examples

Use these examples only after the target project has selected its framework,
validation library, error model, authentication middleware, and OpenAPI
workflow. They are intentionally incomplete illustrations, not drop-in code.
Check the pinned version and current official documentation before adopting
imports, APIs, defaults, or exception mappings.

For a `pj-general` backend that has adopted Hono, do not adapt the Next.js
Route Handler example below. Load `backend-patterns` and its conditional
Hono/BullMQ/Drizzle reference after confirming the pinned stack.

## TypeScript

```typescript
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({
      error: {
        code: "validation_error",
        message: "Request validation failed",
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      },
    }, { status: 422 });
  }

  const user = await createUser(parsed.data);
  return NextResponse.json({ data: user }, {
    status: 201,
    headers: { Location: `/api/v1/users/${user.id}` },
  });
}
```

## Python

```python
from rest_framework import serializers, status, viewsets
from rest_framework.response import Response

class CreateUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=100)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "created_at"]

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return CreateUserSerializer if self.action == "create" else UserSerializer

    def create(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = UserService.create(**serializer.validated_data)
        return Response(
            {"data": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
            headers={"Location": f"/api/v1/users/{user.id}"},
        )
```

## Go

```go
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, http.StatusBadRequest, "invalid_json", "Invalid request body")
        return
    }
    if err := req.Validate(); err != nil {
        writeError(w, http.StatusUnprocessableEntity, "validation_error", err.Error())
        return
    }

    user, err := h.service.Create(r.Context(), req)
    if err != nil {
        switch {
        case errors.Is(err, domain.ErrEmailTaken):
            writeError(w, http.StatusConflict, "email_taken", "Email already registered")
        default:
            writeError(w, http.StatusInternalServerError, "internal_error", "Internal error")
        }
        return
    }

    w.Header().Set("Location", fmt.Sprintf("/api/v1/users/%s", user.ID))
    writeJSON(w, http.StatusCreated, map[string]any{"data": user})
}
```

Before adapting any example, add the target project's authentication and
authorization checks, idempotency handling where retries matter, request size
and content-type constraints, correlation and safe logging, and tests for the
contract outcomes. Verify the resulting implementation against the
authoritative specification rather than treating this file as the specification.
