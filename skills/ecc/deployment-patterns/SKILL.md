---
name: deployment-patterns
description: Design or review a repository-owned delivery workflow, deployment strategy, health contract, rollback plan, or production-readiness gate. Use for a concrete release target and environment; do not use for local-only container work, generic application debugging, or live deployment without explicit authority.
---

# Deployment Patterns

Production deployment workflows and CI/CD patterns. Repository policy and the selected provider's current contract always override the examples in this skill.

## Activation And Non-Activation

Activate for a concrete task that sets up or reviews a CI/CD flow, selects a rolling/blue-green/canary strategy, defines readiness or rollback, prepares a release gate, or changes environment-specific delivery configuration.

Do not activate for local-only Dockerfile or Compose work (`$docker-patterns`), a GitHub-only issue/PR/check operation (`$github-ops`), generic application debugging with no delivery boundary, or provider administration unrelated to a repository release. Hand those tasks to the owning skill while preserving relevant build, artifact, and health evidence.

## Project Truth And Compaction Recovery

1. Read repository-local `AGENTS.md`, `PROJECT.md`, stack/version sources, deployment/runbook docs, pipeline definitions, infrastructure-as-code, environment inventory, migration policy, and release/rollback ownership before designing a flow.
2. Confirm the target environment, provider/runtime, artifact identity, base/ref, required approvals, health/SLO contract, data migration impact, and rollback owner. Generic `main`, production, CI vendor, registry, or command assumptions are not policy.
3. After compaction, session transfer, or handoff, reread the repository-required initialization files and current task record from disk before another deployment-related action. Treat conversation summaries as pointers only.
4. For version-dependent provider, runtime, CI, or action behavior, use the repository's pinned version and current official documentation. Stop if the active version or authority cannot be established.

## Safe Delivery Procedure

1. **Inspect read-only.** Inventory the scoped diff, current ref, pipeline/IaC files, artifact/version source, required checks, environment state, migration compatibility, health signals, and last known-good artifact without exposing environment values or credentials.
2. **Validate without live impact.** Prefer schema/config validation, template rendering, policy checks, unit/integration tests, fake provider boundaries, disposable local environments, and supported plan/dry-run modes. A provider-hosted preview may still be an external write; classify it before use.
3. **Present the deployment packet.** State target, immutable artifact digest/version, intended changes, traffic/data effects, health thresholds, abort conditions, rollback or forward-fix path, evidence, and commands/API calls proposed.
4. **Gate live changes.** Obtain explicit authorization immediately before registry push, hosted preview creation, deployment, traffic shift, scaling, migration, secret/config rotation, rollback, release publication, or any provider/API write not already authorized for that exact scope.
5. **Read back and verify.** After an authorized action, confirm the provider-reported revision/artifact, health and smoke checks, traffic state, migration state, and alert window. Do not call a successful command successful delivery.

Treat deletion/replacement of infrastructure, data stores, volumes, environments, artifacts needed for rollback, force operations, and irreversible migrations as destructive. Require a separately stated impact, backup/recovery evidence, and explicit approval; never test these paths on live data.

Keep tokens, cookies, connection strings, private registry credentials, signing keys, secret values, and raw environment dumps out of repository files, command arguments, generated reports, and logs. Use the repository-approved secret mechanism, pass only variable names in examples, and redact evidence.

On Windows, keep host-side inspection and path validation in PowerShell. Use `Resolve-Path -LiteralPath` or `Get-Item -LiteralPath` for local manifests, templates, artifacts, and credential-file references; preserve drive letters/spaces and do not construct cleanup or deployment targets by enumerating paths in another shell. Container-internal Unix commands are implementation details, not host-shell instructions.

Stop and hand off when the environment or tenant is ambiguous, authorization is missing, required checks are incomplete, secrets appear in output, migration reversibility is unproven, health thresholds or rollback ownership are absent, the observed state diverges from the plan, or the requested provider is outside the available tools. Report what was inspected, exact state changes and identifiers, redacted evidence, verification results, remaining risk, abort/rollback status, and approvals still required.

## Deployment Strategies

Select a strategy from repository policy, compatibility constraints, observability, capacity, and recovery needs. None of the following is a universal default.

### Rolling Deployment

Replace instances gradually — old and new versions run simultaneously during rollout.

```
Instance 1: v1 → v2  (update first)
Instance 2: v1        (still running v1)
Instance 3: v1        (still running v1)

Instance 1: v2
Instance 2: v1 → v2  (update second)
Instance 3: v1

Instance 1: v2
Instance 2: v2
Instance 3: v1 → v2  (update last)
```

**Pros:** Can avoid downtime when capacity, compatibility, and health gating are correct; gradual rollout
**Cons:** Two versions run simultaneously — requires backward-compatible changes
**Use when:** Standard deployments, backward-compatible changes

### Blue-Green Deployment

Run two identical environments. Switch traffic atomically.

```
Blue  (v1) ← traffic
Green (v2)   idle, running new version

# After verification:
Blue  (v1)   idle (becomes standby)
Green (v2) ← traffic
```

**Pros:** Fast traffic rollback when the standby remains compatible and verified; clean cutover
**Cons:** Requires 2x infrastructure during deployment
**Use when:** Critical services, zero-tolerance for issues

### Canary Deployment

Route a small percentage of traffic to the new version first.

```
v1: 95% of traffic
v2:  5% of traffic  (canary)

# If metrics look good:
v1: 50% of traffic
v2: 50% of traffic

# Final:
v2: 100% of traffic
```

**Pros:** Catches issues with real traffic before full rollout
**Cons:** Requires traffic splitting infrastructure, monitoring
**Use when:** High-traffic services, risky changes, feature flags

## Docker Adapter Examples

These Dockerfiles illustrate build-shape concerns only. Use repository-pinned base images and `$docker-patterns` for concrete Docker/Compose implementation or runtime diagnosis.

### Multi-Stage Dockerfile (Node.js)

```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 3: Production image
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### Multi-Stage Dockerfile (Go)

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

FROM alpine:3.19 AS runner
RUN apk --no-cache add ca-certificates
RUN adduser -D -u 1001 appuser
USER appuser

COPY --from=builder /server /server

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["/server"]
```

### Multi-Stage Dockerfile (Python/Django)

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

FROM python:3.12-slim AS runner
WORKDIR /app

RUN useradd -r -u 1001 appuser
USER appuser

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/')" || exit 1
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

### Docker Best Practices

```
# GOOD practices
- Use specific version tags (node:22-alpine, not node:latest)
- Multi-stage builds to minimize image size
- Run as non-root user
- Copy dependency files first (layer caching)
- Use .dockerignore to exclude node_modules, .git, tests
- Add HEALTHCHECK instruction
- Set resource limits in the selected runtime/orchestrator

# BAD practices
- Running as root
- Using :latest tags
- Copying entire repo in one COPY layer
- Installing dev dependencies in production image
- Storing secrets in image (use env vars or secrets manager)
```

## CI/CD Pipeline

### Provider-Neutral Delivery Contract

Map these responsibilities to the repository's selected CI and deployment provider instead of copying a fixed workflow:

| Stage | Required evidence | Write boundary |
| --- | --- | --- |
| Validate | repository-prescribed lint, type, test, policy, and manifest checks | normally local/CI read and ephemeral output |
| Build | reproducible artifact tied to source ref, dependency lock, and build provenance | artifact creation; registry upload is external |
| Verify artifact | signature/SBOM/scans when required, digest and version consistency | read-only until metadata is published |
| Non-production exercise | fake/disposable test or policy-approved environment, migration rehearsal, smoke tests | hosted preview/staging can be external |
| Production approval | target, artifact digest, approver, health/abort thresholds, rollback owner | approval gate; no implicit deploy on branch name |
| Roll out and observe | strategy-specific increments, health evidence, traffic/data state | live external write |
| Close or recover | provider readback, evidence retention, rollback/forward-fix result | may include additional live writes |

Use immutable action/plugin references where the provider supports them, least-privilege credentials, protected environments, concurrency controls, and separate build from deployment authority. Do not assume a particular branch, operating system runner, registry, preview environment, or automatic production trigger.

An illustrative flow is:

```text
change proposed
  -> validate and test
  -> build one immutable artifact
  -> verify that artifact
  -> exercise it through fake/disposable or approved non-production boundaries
  -> present production deployment packet
  -> obtain explicit live-write approval
  -> deploy the same artifact incrementally
  -> read back health, traffic, and data state
  -> complete or execute the approved recovery plan
```

Provider-specific YAML belongs in the repository or a provider adapter after its version, permissions, secret handling, and write gates are verified. A pull request or merge does not by itself authorize preview creation, registry push, or production deployment.

## Health Checks

### Health Check Endpoint

```typescript
// Simple health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Detailed health check (for internal monitoring)
app.get("/health/detailed", async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    externalApi: await checkExternalApi(),
  };

  const allHealthy = Object.values(checks).every(c => c.status === "ok");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "unknown",
    uptime: process.uptime(),
    checks,
  });
});

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await db.query("SELECT 1");
    return { status: "ok", latency_ms: 2 };
  } catch (err) {
    return { status: "error", message: "Database unreachable" };
  }
}
```

### Probe Adapter Example

This Kubernetes-shaped example is an adapter, not a default. Map liveness, readiness, and startup semantics to the selected runtime and tune thresholds from measured startup and failure behavior.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 2

startupProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 30    # 30 * 5s = 150s max startup time
```

## Environment Configuration

### Twelve-Factor App Pattern

```text
# Names and non-secret defaults only; values come from the approved environment/secret source.
DATABASE_URL=<injected secret reference>
REDIS_URL=<injected configuration reference>
API_KEY=<injected secret reference>
LOG_LEVEL=<validated non-secret value>
PORT=<validated non-secret value>
APP_ENV=<explicit environment identity>
```

### Configuration Validation

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

// Validate at startup — fail fast if config is wrong
export const env = envSchema.parse(process.env);
```

## Rollback Strategy

### Recovery Is A Planned Live Change

Do not publish a universal rollback command. Select the repository/provider runbook only after confirming the failed revision, last known-good immutable artifact, current traffic and data state, compatibility window, and rollback owner.

- **Application artifact:** redeploy or promote the verified last known-good artifact using the provider-approved, separately authorized command.
- **Traffic:** switch or reduce traffic only within the approved strategy and verify both old and new targets.
- **Configuration/secret:** restore a known-good version only when rotation and dependent-service effects are understood.
- **Database:** prefer backward-compatible changes and a forward fix. Run a down migration only when the exact migration is proven reversible against representative data and the destructive gate is approved.
- **Infrastructure:** use the reviewed IaC plan/state recovery path; do not improvise deletion or replacement commands during diagnosis.

### Rollback Checklist

- [ ] Previous image/artifact is available and tagged
- [ ] Database migrations are backward-compatible (no destructive changes)
- [ ] Feature flags can disable new features without deploy
- [ ] Monitoring alerts configured for error rate spikes
- [ ] Rollback tested in staging before production release

## Production Readiness Checklist

Before requesting approval for a production deployment, apply the repository's own checklist. The following items are prompts, not proof by themselves:

### Application
- [ ] Repository-required tests and checks pass, with results tied to the proposed artifact
- [ ] No hardcoded secrets in code or config files
- [ ] Error handling covers all edge cases
- [ ] Logging is structured (JSON) and does not contain PII
- [ ] Health check endpoint returns meaningful status

### Infrastructure
- [ ] Docker image builds reproducibly (pinned versions)
- [ ] Environment variables documented and validated at startup
- [ ] Resource limits set (CPU, memory)
- [ ] Horizontal scaling configured (min/max instances)
- [ ] SSL/TLS enabled on all endpoints

### Monitoring
- [ ] Application metrics exported (request rate, latency, errors)
- [ ] Alerts and abort thresholds are defined from the service's operating objectives
- [ ] Log aggregation set up (structured logs, searchable)
- [ ] Uptime monitoring on health endpoint

### Security
- [ ] Dependencies scanned for CVEs
- [ ] CORS configured for allowed origins only
- [ ] Rate limiting enabled on public endpoints
- [ ] Authentication and authorization verified
- [ ] Security headers set (CSP, HSTS, X-Frame-Options)

### Operations
- [ ] Rollback plan documented and tested
- [ ] Database migration tested against production-sized data
- [ ] Runbook for common failure scenarios
- [ ] Deployment, incident, and rollback owners are identified for the approved window
