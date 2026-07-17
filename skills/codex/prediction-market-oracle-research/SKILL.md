---
name: prediction-market-oracle-research
description: Research prediction markets as neutral, time-stamped information sources or oracle-like signals for products, dashboards, agents, and decision intelligence. Use when comparing venue mechanics, resolution rules, resolvers/oracles, market observations, and signal quality; do not use for trade planning, investment advice, wallet activity, position sizing, or order execution.
---

# Prediction Market Oracle Research

Evaluate a prediction-market signal without recommending or executing a financial action. Treat every price or probability as a venue-specific observation, not objective truth.

## Route The Request

Use this skill for questions such as:

- What exactly would resolve this market, and who or what determines the outcome?
- Can a market-implied probability serve as an informational input to a product, dashboard, alert, agent, or scenario analysis?
- How do venue rules, oracle/resolver design, liquidity, spreads, incentives, disputes, and timing affect signal quality?
- Do two venues describe or resolve apparently similar outcomes differently?

Do not use this skill to build a manual execution worksheet, inspect order prerequisites, prepare action links, or plan a basket adjustment; route those requests to `$ito-trade-planner`. Do not cross into trade recommendations, entry/exit timing, position sizing, expected returns, wallet setup, signing, approvals, deposits, withdrawals, order creation/cancellation/routing, or capital allocation. This skill never invokes execution-capable tooling.

## Restore Project Truth

1. Read the target project's `AGENTS.md`, `PROJECT.md`, current task record, and applicable research/data policies before collecting evidence.
2. After compaction, session transfer, or handoff, reread the project-required initialization files and current task state from disk. Treat conversation summaries as pointers, not source truth.
3. Keep ongoing research state in the project's task layer and completed evidence in its designated completion or research artifact. Do not invent a new source-of-truth location.

## Preserve The Source Boundary

Use current primary sources and record an explicit access or observation date for each material claim. Prefer, in order:

1. the exact market page or documented read-only market endpoint;
2. official venue rules, fee/liquidity definitions, access restrictions, and API documentation;
3. the named resolution source, resolver/oracle documentation, dispute rules, and relevant contract/explorer evidence when applicable;
4. official regulator, filing, statistics, election, court, company, or other authority named by the resolution criteria;
5. secondary reporting only for context or to identify a primary source.

Rules, market state, access restrictions, and API schemas can change. Verify them live when current accuracy matters. If browsing or the primary source is unavailable, state the missing evidence and do not present remembered or secondary details as current fact.

## Separate Venue, Oracle, Resolution, Fact, And Inference

Record these roles independently:

- **Venue/operator:** hosts the market and defines trading, access, fee, and market rules.
- **Market contract/question:** states the outcome options, close time, and resolution criteria.
- **Resolution source:** the external publication, event, dataset, or authority referenced by the criteria.
- **Resolver/oracle:** submits, attests, or computes the outcome used by the venue or contract.
- **Dispute/finality mechanism:** defines challenges, escalation, timing, and when the outcome becomes final.

Label observed facts separately from analytical inference.

- Facts include quoted/paraphrased rule meaning, market state, timestamps, displayed price, spread, volume/liquidity under the venue's own definition, resolver identity, dispute window, and source links.
- Inferences include interpreting price as probability, judging information quality, estimating manipulation or concentration risk, comparing unlike liquidity measures, and deciding whether the signal is usable for a stated decision.
- Never infer that a market price is calibrated, representative, accessible to the user, or predictive merely because it is displayed.

## Work Read-Only

Default to public documentation, public market pages, bounded GET/list/view calls, and saved read-only evidence. Use fake responses or local fixtures to design schemas, parsers, dashboard fields, thresholds, or alerts. Do not test an integration against live write endpoints.

Do not request or output API secrets, cookies, wallet addresses tied to a person, private keys, seed phrases, signatures, exchange credentials, or authorization headers. If a user explicitly requests an authenticated read-only source, use only the project-approved secret mechanism, avoid printing the value, and stop if the available credential could grant trading, transfer, signing, or administrative authority.

On Windows, use PowerShell for local evidence. Resolve paths with `Resolve-Path -LiteralPath`, read with `Get-Content -LiteralPath`, preserve drive letters and spaces, and do not construct cross-shell commands from enumerated filenames. Never place credentials in command arguments or saved research artifacts.

## Research Workflow

1. Define the decision or product behavior the signal would inform, without assuming the signal is suitable.
2. Identify the exact venue, market/question, outcome set, timestamps/time zone, resolution source, resolver/oracle, dispute mechanism, and finality rule.
3. Capture observations with UTC timestamp, source URL, units, and the venue's definitions. Do not compare values whose definitions differ without normalization or a caveat.
4. Assess signal quality: liquidity and spread, market age/staleness, participant/incentive concentration if evidenced, manipulation surface, rule ambiguity, data availability, access/geography constraints, resolution dependency, and dispute/finality lag.
5. Compare against independent primary sources relevant to the underlying event, such as filings, official statistics, polls with methods, research, or approved internal KPIs.
6. Classify the signal as usable, weak, or unsuitable for the stated informational purpose, and explain the inference and confidence. This classification is not a trade recommendation.

## Stop And Hand Off

Stop when the exact market or venue is ambiguous, primary rules are unavailable, resolution wording conflicts across sources, timestamps or units cannot be reconciled, authentication would expose execution authority, legal/access status is unclear, evidence may contain personal or secret data, or the request crosses into advice or execution.

Hand off with the sources already checked, dated observations, unresolved questions, the role boundary that failed, and the next safe read-only source or human decision needed. Do not compensate for missing evidence with confident speculation.

## Evidence-Backed Completion

Complete only when the output contains:

1. decision context and research scope;
2. a dated source table distinguishing primary and secondary sources;
3. a venue / market question / resolution source / resolver-oracle / dispute-finality map;
4. time-stamped market observations with definitions and units;
5. clearly separated facts and inferences, including confidence and caveats;
6. comparison with non-market primary evidence;
7. an informational-suitability conclusion, open questions, and unverified areas;
8. confirmation that no trade, wallet, order, transfer, signing, or other external write occurred.

End with:

```text
Prediction-market signals are informational inputs, not investment or trading advice. No trade, wallet, or order action was performed.
```

## Upstream domain reference

Read [Upstream domain guide](references/upstream-domain-guide.md) when the request needs source-specific procedures, examples, decision tables, or provider/framework details. Treat legacy runtime commands and live operations as non-authoritative examples subject to this skill's current safety and approval gates.
