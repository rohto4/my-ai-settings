---
name: architecture-decision-records
description: Capture consequential architecture decisions as ADRs with context, alternatives, rationale, consequences, and status. Use when a durable technical choice is made or revisited.
---

# Architecture Decision Records

Capture architectural decisions as they happen during coding sessions. Instead of decisions living only in Slack threads, PR comments, or someone's memory, this skill produces structured ADR documents that live alongside the code.

## When to Activate

- User explicitly says "let's record this decision" or "ADR this"
- User chooses between significant alternatives (framework, library, pattern, database, API design)
- User says "we decided to..." or "the reason we're doing X instead of Y is..."
- User asks "why did we choose X?" (read existing ADRs)
- During planning phases when architectural trade-offs are discussed
- Do not use for trivial implementation details, unresolved brainstorming with no decision, or a choice already governed by a canonical ADR unless the task is to supersede it.

Start by reading the target PJ's instructions, ADR index, and relevant architecture/task documents. Draft in chat or a temporary local artifact first; the repository write remains approval-gated.

## ADR Format

Use the lightweight ADR format proposed by Michael Nygard, adapted for AI-assisted development:

```markdown
# ADR-NNNN: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | deprecated | superseded by ADR-NNNN
**Deciders**: [who was involved]

## Context

What is the issue that we're seeing that is motivating this decision or change?

[2-5 sentences describing the situation, constraints, and forces at play]

## Decision

What is the change that we're proposing and/or doing?

[1-3 sentences stating the decision clearly]

## Alternatives Considered

### Alternative 1: [Name]
- **Pros**: [benefits]
- **Cons**: [drawbacks]
- **Why not**: [specific reason this was rejected]

### Alternative 2: [Name]
- **Pros**: [benefits]
- **Cons**: [drawbacks]
- **Why not**: [specific reason this was rejected]

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive
- [benefit 1]
- [benefit 2]

### Negative
- [trade-off 1]
- [trade-off 2]

### Risks
- [risk and mitigation]
```

## Workflow

### Capturing a New ADR

When a decision moment is detected:

1. **Discover the convention** — inspect project instructions, existing ADRs/indexes, and ADR-tool configuration such as `.adr-dir`. Existing location, markup, headings, numbering, and filename patterns override this skill. If evidence conflicts, stop instead of creating a second scheme.
2. **Initialize (first time only)** — only when no convention exists, propose `docs/adr/` as the default and ask for confirmation before creating the directory, a `README.md` seeded with the index table header, and a blank `template.md`. Do not create files without explicit consent.
3. **Identify the decision** — extract the core architectural choice being made.
4. **Gather context** — what problem prompted this? What constraints exist?
5. **Document alternatives** — what other options were considered? Why were they rejected?
6. **State consequences** — what are the trade-offs? What becomes easier/harder?
7. **Assign a number** — continue the established sequence; use the default `docs/adr/` sequence only for a newly accepted default.
8. **Confirm and write** — present the draft ADR to the user for review. Write only to the discovered or accepted path after explicit approval. If the user declines, discard the draft without writing any files.
9. **Update the index** — update the repository's established index, or `docs/adr/README.md` for the accepted default.

Never copy tokens, cookies, credentials, private keys, or secret values into an ADR. Record the secret source/owner and rotation boundary without the value. External publishing, PR creation, and deployment are outside this skill.

### Reading Existing ADRs

When a user asks "why did we choose X?":

1. Check if `docs/adr/` exists — if not, respond: "No ADRs found in this project. Would you like to start recording architectural decisions?"
2. If it exists, scan `docs/adr/README.md` index for relevant entries
3. Read matching ADR files and present the Context and Decision sections
4. If no match is found, respond: "No ADR found for that decision. Would you like to record one now?"

### ADR Directory Structure

```
docs/
└── adr/
    ├── README.md              ← index of all ADRs
    ├── 0001-use-nextjs.md
    ├── 0002-postgres-over-mongo.md
    ├── 0003-rest-over-graphql.md
    └── template.md            ← blank template for manual use
```

### ADR Index Format

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](0001-use-nextjs.md) | Use Next.js as frontend framework | accepted | 2026-01-15 |
| [0002](0002-postgres-over-mongo.md) | PostgreSQL over MongoDB for primary datastore | accepted | 2026-01-20 |
| [0003](0003-rest-over-graphql.md) | REST API over GraphQL | accepted | 2026-02-01 |
```

## Decision Detection Signals

Watch for these patterns in conversation that indicate an architectural decision:

**Explicit signals**
- "Let's go with X"
- "We should use X instead of Y"
- "The trade-off is worth it because..."
- "Record this as an ADR"

**Implicit signals** (suggest recording an ADR — do not auto-create without user confirmation)
- Comparing two frameworks or libraries and reaching a conclusion
- Making a database schema design choice with stated rationale
- Choosing between architectural patterns (monolith vs microservices, REST vs GraphQL)
- Deciding on authentication/authorization strategy
- Selecting deployment infrastructure after evaluating alternatives

## What Makes a Good ADR

### Do
- **Be specific** — "Use Prisma ORM" not "use an ORM"
- **Record the why** — the rationale matters more than the what
- **Include rejected alternatives** — future developers need to know what was considered
- **State consequences honestly** — every decision has trade-offs
- **Keep it short** — an ADR should be readable in 2 minutes
- **Use present tense** — "We use X" not "We will use X"

### Don't
- Record trivial decisions — variable naming or formatting choices don't need ADRs
- Write essays — if the context section exceeds 10 lines, it's too long
- Omit alternatives — "we just picked it" is not a valid rationale
- Backfill without marking it — if recording a past decision, note the original date
- Let ADRs go stale — superseded decisions should reference their replacement

## ADR Lifecycle

```
proposed → accepted → [deprecated | superseded by ADR-NNNN]
```

- **proposed**: decision is under discussion, not yet committed
- **accepted**: decision is in effect and being followed
- **deprecated**: decision is no longer relevant (e.g., feature removed)
- **superseded**: a newer ADR replaces this one (always link the replacement)

Do not delete historical ADRs. When a decision changes, add a new ADR that explicitly supersedes the old one and update both links.

## Categories of Decisions Worth Recording

| Category | Examples |
|----------|---------|
| **Technology choices** | Framework, language, database, cloud provider |
| **Architecture patterns** | Monolith vs microservices, event-driven, CQRS |
| **API design** | REST vs GraphQL, versioning strategy, auth mechanism |
| **Data modeling** | Schema design, normalization decisions, caching strategy |
| **Infrastructure** | Deployment model, CI/CD pipeline, monitoring stack |
| **Security** | Auth strategy, encryption approach, secret management |
| **Testing** | Test framework, coverage targets, E2E vs integration balance |
| **Process** | Branching strategy, review process, release cadence |

## Integration with Other Skills

- **Planner agent**: when the planner proposes architecture changes, suggest creating an ADR
- **Code reviewer agent**: flag PRs that introduce architectural changes without a corresponding ADR

Complete when the accepted decision, status, alternatives, consequences, deciders, date, and index link are verified. On resume, reread the ADR index and current task from disk; keep proposed state in the task record until acceptance.

## Operating contract

- For long work, reread AGENTS.md, PROJECT.md, and the current task artifact from disk; keep in-progress state separate from completion evidence. Stop on missing authority, ambiguous targets, unsafe live dependencies, or repeated non-progress. Hand off with evidence; complete only after the scoped checks pass.
- Use existing ADR conventions as authority. Draft first, exclude secret values, obtain approval before superseding a decision, and keep external publication out of scope unless explicitly requested.
