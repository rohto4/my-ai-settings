---
name: agent-self-evaluation
description: Audit a completed AI deliverable against the user's request, repository truth, and observable verification evidence. Use when the user asks for a self-review, before a high-impact handoff, or after a complex task where omissions or unsupported completion claims matter; do not use as a substitute for testing, code review, security review, or head-to-head agent benchmarking.
---

# Agent Self Evaluation

Evaluate the delivered result, not hidden reasoning, confidence, effort, or personality. A self-score is an aid to finding gaps and never proves correctness.

## Trigger And Routing

Use this skill when:

- the user explicitly asks the agent to rate, audit, or critique its completed work;
- a complex or high-impact deliverable needs a concise pre-handoff gap check;
- completion evidence exists but its coverage against the original request is uncertain;
- repeated corrections suggest the final artifact may still omit a requirement.

Do not auto-run after every task or emit a long scorecard when the user asked only for the result. Use `verification-loop` to execute functional checks, a code/security review skill to inspect implementation defects, and `agent-eval` for controlled comparison between agents or models. If the task is still in progress, finish or clearly delimit it before evaluating the deliverable.

## Restore The Evaluation Basis

1. Read the target PJ's `AGENTS.md`, `PROJECT.md`, current task, referenced specification, and completion rules from disk.
2. After compaction, handoff, or session movement, reread those sources. Treat summaries and memory as pointers, not the current source of truth.
3. Collect the original user requirements, explicit later corrections, delivered files or output, current repository state, and observable validation results.
4. Separate required scope from optional improvements. Do not penalize the deliverable for work the user did not request.

Default to read-only inspection. Do not modify files, rerun live integrations, send external messages, deploy, commit, push, or alter task state merely to improve a score. If a gap should be fixed, report it first; perform the fix only when it is already authorized by the active task or the user separately approves it.

Do not expose secrets, private data, hidden chain-of-thought, internal scratch reasoning, or credential-bearing tool output. Use observable artifacts and concise rationales.

## Build A Requirement-Evidence Matrix

For every explicit requirement, identify the strongest current evidence:

| Requirement | Evidence | Finding |
| --- | --- | --- |
| Exact requested outcome | artifact, rendered behavior, or readback | met / partial / unmet / unknown |
| Named command or test | current command output and scope | passed / failed / not run / insufficient |
| Safety or authority gate | implementation and observed execution boundary | met / gap / not applicable |
| Documentation or state update | actual canonical file | current / stale / missing |
| External action | provider readback or immutable identifier | verified / unverified / not performed |

Do not treat absence of an error, an agent's statement, or a narrow test as proof of a broader requirement. Mark indirect or stale evidence as insufficient.

## Score Five Axes

Use a 1–5 score only after the matrix is built:

| Axis | Question |
| --- | --- |
| Accuracy | Are material claims supported by current evidence? |
| Completeness | Does the result cover every requested requirement and named deliverable? |
| Clarity | Can the user distinguish outcome, evidence, uncertainty, and next action quickly? |
| Actionability | Is the artifact usable now, with exact paths, links, controls, or follow-up boundaries? |
| Conciseness | Is information density appropriate without hiding necessary evidence? |

Scoring guide:

- **5:** evidence covers the full requirement and no material gap is found;
- **4:** complete enough to use, with a minor non-blocking improvement;
- **3:** usable but a notable requirement, proof, or presentation gap remains;
- **2:** a material gap makes the result unreliable or difficult to use;
- **1:** the delivered result does not satisfy the core request.

Every score needs a short evidence statement. Never assign 5 from confidence alone. Do not average away a critical failure: report the lowest material axis and any stop condition separately.

## Output

Keep the review compact:

```text
Self-evaluation
- Overall: usable / usable with gaps / not ready
- Accuracy: x/5 — evidence
- Completeness: x/5 — evidence
- Clarity: x/5 — evidence
- Actionability: x/5 — evidence
- Conciseness: x/5 — evidence

Highest-impact gaps
1. requirement — missing or contradictory evidence — exact next check/fix

Evidence checked
- canonical paths, artifact versions, and current test/readback results
```

If no gap is found, state the verification coverage and its limits instead of inventing criticism. If evidence is missing, say `unknown`; do not guess a favorable score.

## Stop, Handoff, And Completion

Stop when the original request, canonical artifact, current repository state, or material verification output is unavailable. Hand off the missing source, why it matters, and the smallest read-only check needed.

Complete only when every explicit requirement is represented in the matrix, each score cites observable evidence, unsupported completion claims are called out, critical gaps are not hidden by the average, and no unapproved mutation or external action occurred.

## Upstream domain reference

Read [Upstream domain guide](references/upstream-domain-guide.md) when the request needs source-specific procedures, examples, decision tables, or provider/framework details. Treat legacy runtime commands and live operations as non-authoritative examples subject to this skill's current safety and approval gates.
