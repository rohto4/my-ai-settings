---
name: plan-orchestrate
description: Map an approved multi-step plan into ordered execution units, dependencies, recommended skills, and verification gates. Use when the plan exists but execution routing is unclear; this skill is generative only and never starts agents, edits code, commits, or pushes.
---

# Plan Orchestrate

Convert an accepted plan into a deterministic execution map. This is routing, not replanning and not execution.

## Trigger and Non-Trigger

Use when:

- an approved PRD, RFC, architecture plan, or implementation plan has multiple steps;
- the user wants dependency order, safe parallelism, handoff boundaries, or the right skill per step;
- a fresh session must be able to resume from a durable map.

Do not use when the plan is still under product or architecture debate, when there is only one bounded task, or when the user asked to implement directly. Use `prp-create-plan` or `blueprint` to create the plan; use `prp-implement-plan` only after execution is authorized.

## Inputs

Read from disk:

- target PJ instructions and current task;
- one authoritative plan path;
- pinned stack and relevant architecture/verification docs;
- the current discoverable skill catalogue or profile.

If the plan path is missing, empty, contradictory, or lacks completion criteria, stop and return the exact gap. Do not invent an agent catalogue, command, slash command, or plugin namespace.

## Mapping Workflow

### 1. Extract execution units

Prefer explicit phases and steps. Otherwise split by verifiable output, not by arbitrary heading count.

Each unit must name:

- stable ID and short title;
- intended output and acceptance;
- inputs and prerequisite unit IDs;
- files, systems, or ownership boundary likely touched;
- authority needed: read-only, local edit, dependency change, external write, deployment;
- direct verification and handoff artifact.

Split a unit when it has multiple dominant risks or cannot be verified independently.

### 2. Resolve order and safe concurrency

Create dependencies only for real output or ownership constraints. Units may run concurrently only when they do not share mutable files, state, credentials, deployment targets, or unresolved decisions.

Do not recommend parallel agents by default. Mark a unit `parallel-candidate` only when concurrency is useful and the user or target PJ explicitly permits delegation.

### 3. Route skills

Assign the smallest relevant set:

- one primary skill that owns the work;
- optional specialist for security, database, browser, performance, or provider details;
- one verification skill or existing repo command when needed.

Use only skills actually available in the current environment. If no skill matches, route to repository instructions and state that no specialist was found. Never fabricate a skill name.

### 4. Preserve state

For every unit, state where progress lives and what proves completion. On compaction or handoff, reread `AGENTS.md`, `PROJECT.md`, the current task, and the plan from disk.

Keep:

- active unit, open questions, and next action in the task record;
- accepted decisions in canonical design/decision docs;
- finished evidence in the completion log.

### 5. Self-check

- every unit traces to the plan;
- every dependency has a reason;
- no unit silently authorizes external mutation;
- every acceptance item has direct evidence;
- recommended skills exist and their boundaries do not overlap ambiguously;
- parallel candidates have disjoint mutable surfaces;
- selection decisions and unresolved blockers are visible.

## Output

Produce one compact table:

| # | Unit / output | Depends on | Primary skill | Specialist | Authority | Verification | State / handoff |
|---|---|---|---|---|---|---|---|

Then list:

- critical path;
- parallel candidates and why they are safe;
- approval gates;
- unresolved decisions;
- the first executable unit after authorization.

Do not emit runnable agent or shell commands unless the user separately asks for them.

## Completion

Complete when every plan step maps to one or more bounded units, dependencies are acyclic, skill names are verified against the active catalogue, authority gates are explicit, and each unit has a proving check and durable handoff location.

## Upstream domain reference

Read [Upstream domain guide](references/upstream-domain-guide.md) when the request needs source-specific procedures, examples, decision tables, or provider/framework details. Treat legacy runtime commands and live operations as non-authoritative examples subject to this skill's current safety and approval gates.
