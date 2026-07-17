---
name: research-ops
description: Run evidence-first current-state research with source dates and fact-inference-recommendation separation. Use for fresh facts, comparisons, and recommendations.
---

# Research Ops

Use this when the user asks to research something current, compare options, enrich people or companies, or turn repeated lookups into a monitored workflow.

This is the operator wrapper around the repo's research stack. It is not a replacement for `deep-research`, `exa-search`, or `market-research`; it tells you when and how to use them together.

## Skill Stack

Pull these ECC-native skills into the workflow when relevant:

- `exa-search` for fast current-web discovery
- `deep-research` for multi-source synthesis with citations
- `market-research` when the end result should be a recommendation or ranked decision
- `lead-intelligence` when the task is people/company targeting instead of generic research
- `knowledge-ops` when the result should be stored in durable context afterward

## When to Use

- user says "research", "look up", "compare", "who should I talk to", or "what's the latest"
- the answer depends on current public information
- the user already supplied evidence and wants it factored into a fresh recommendation
- the task may be recurring enough that it should become a monitor instead of a one-off lookup

## Guardrails

- do not answer current questions from stale memory when fresh search is cheap
- on resume, read the target PJ's `AGENTS.md`, `PROJECT.md`, and current task record from disk; do not treat a conversation summary as the source of truth
- separate:
  - sourced fact
  - user-provided evidence
  - inference
  - recommendation
- do not spin up a heavyweight research pass if the answer is already in local code or docs
- keep research read-only unless the user explicitly requests an external write, message, publication, or monitor creation

## Workflow

### 1. Start from what the user already gave you

Normalize any supplied material into:

- already-evidenced facts
- needs verification
- open questions

Do not restart the analysis from zero if the user already built part of the model.

### 2. Classify the ask

Choose the right lane before searching:

- quick factual answer
- comparison or decision memo
- lead/enrichment pass
- recurring monitoring candidate

### 3. Take the lightest useful evidence path first

- use `exa-search` for fast discovery
- escalate to `deep-research` when synthesis or multiple sources matter
- use `market-research` when the outcome should end in a recommendation
- hand off to `lead-intelligence` when the real ask is target ranking or warm-path discovery

### 4. Report with explicit evidence boundaries

For important claims, say whether they are:

- sourced facts
- user-supplied context
- inference
- recommendation

Freshness-sensitive answers should include concrete dates.

### 5. Decide whether the task should stay manual

If the user is likely to ask the same research question repeatedly, say so explicitly and recommend a monitoring or workflow layer instead of repeating the same manual search forever.

### 6. Stop, hand off, and complete explicitly

- Stop when a required source is inaccessible, evidence conflicts materially, or the decision depends on a user preference that cannot be inferred safely.
- Hand off implementation planning to the relevant product or engineering skill; research does not authorize repository changes or external actions.
- Complete only when important claims have source/date coverage, inference is labeled, the question is answered, and open uncertainty is visible.
- For long-running research, keep current questions and state in the PJ's task file; move only finished evidence to its completion log.

## Output Format

```text
QUESTION TYPE
- factual / comparison / enrichment / monitoring

EVIDENCE
- sourced facts
- user-provided context

INFERENCE
- what follows from the evidence

RECOMMENDATION
- answer or next move
- whether this should become a monitor
```

## Pitfalls

- do not mix inference into sourced facts without labeling it
- do not ignore user-provided evidence
- do not use a heavy research lane for a question local repo context can answer
- do not give freshness-sensitive answers without dates

## Verification

- important claims are labeled by evidence type
- freshness-sensitive outputs include dates
- the final recommendation matches the actual research mode used
