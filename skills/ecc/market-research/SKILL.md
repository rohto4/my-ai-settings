---
name: market-research
description: Conduct source-attributed market research, competitive analysis, investor diligence, market sizing, and technology or vendor scans that support a business decision. Use when the user needs a market, entry, competitor, fund, pricing, or build-versus-buy judgment. Do not use for a single web lookup, repo-local truth, outreach execution, private-person investigation, or broad non-business research better handled by deep-research.
---

# Market Research

Produce research that makes a stated decision easier. Separate observed facts, estimates, inferences, and recommendations.

## Establish the decision and source boundary

1. State the decision, reader, geography, segment, time horizon, and materiality threshold. Ask only for missing inputs that would change the research design.
2. When the request concerns a project or product in a workspace, read its actual `AGENTS.md`, `PROJECT.md`, prescribed initialization files, approved product or architecture documents, and current task state before external research. After compaction, session transfer, or handoff, reread them from disk.
3. Treat project files and user-provided facts as the source of truth for the project's current intent. Treat web evidence as external context; flag conflicts instead of silently replacing project decisions.
4. Define what is out of scope, especially adjacent segments, stale geographies, private companies with insufficient disclosure, and metrics that use incompatible definitions.

## Keep research read-only

- Use public or already-authorized read-only sources by default. Do not contact companies or investors, submit lead forms, buy reports, create accounts, scrape authenticated systems, update a CRM, or send outreach as part of research.
- Model a proposed survey, interview, purchase, outreach, or data pipeline with a fake payload or dry-run first. A live action is a separate task requiring explicit user approval of target, effect, and data boundary.
- Never put tokens, Cookies, credentials, paid-report contents, private contact data, or authenticated exports in prompts, artifacts, repositories, command lines, or logs. Use existing connectors or secret stores without echoing values.
- On Windows, inspect local evidence with PowerShell-safe commands, `-LiteralPath`, and explicit drive-letter paths. Save an artifact only to a user-specified or project-authorized location.

## Research workflow

### 1. Form hypotheses and disconfirmers

Write the main decision hypothesis and two to four sub-questions. Include at least one disconfirming question, such as why the market may be smaller, a competitor stronger, or an integration riskier than expected.

### 2. Plan evidence

Prefer, in order:

1. filings, official pricing and product documents, regulator or public datasets, and published methodology;
2. reputable independent analysis, papers, and reporting;
3. company claims, investor materials, job posts, reviews, forums, and social posts as signals with explicit bias limits.

Capture source date, metric definition, geography, segment, and whether a number is reported, derived, or estimated. Deduplicate sources that repeat the same underlying dataset or announcement.

### 3. Analyze the appropriate mode

#### Investor or fund diligence

Collect fund size, stage, typical check, relevant portfolio, public thesis, recent activity, fit reasons, conflicts, and visible red flags. Use only public professional information; do not infer sensitive traits or seek private contact details.

#### Competitive analysis

Compare the same dimensions across competitors: actual product capability, target customer, pricing evidence, distribution, traction evidence, funding when public, switching cost, strengths, weaknesses, and positioning gaps. Distinguish vendor claims from independently observed evidence.

#### Market sizing

- Define the unit, buyer, price basis, geography, and period before calculating.
- Use both a top-down estimate and a bottom-up sanity check when evidence permits.
- Show formulas and ranges; never present a point estimate without assumptions.
- Keep TAM, SAM, and SOM definitions consistent and avoid using one report's TAM as another model's SAM.

#### Technology or vendor research

Compare how it works, adoption evidence, integration effort, lock-in, security, compliance, operability, migration or exit cost, and the cost of doing nothing. Verify current vendor behavior against official documentation when it can change.

### 4. Synthesize for the decision

Explain which evidence supports or weakens each hypothesis. Make uncertainty visible through ranges, confidence, scenarios, or explicit unknowns. Recommendations must identify the decision criteria, expected upside, downside, reversibility, and the next evidence-gathering step.

## Optional parallel research

Do not spawn subagents by default. Use parallel agents only when the user or project instructions explicitly request delegation or parallel work and the workstreams are independent, such as one competitor per agent. The main agent must normalize definitions, verify citations, remove duplicate sources, compare on shared dimensions, and own the final recommendation. Delegation never grants outreach, purchase, login, or external-write authority.

## Output

Default structure:

1. decision and scope;
2. executive summary;
3. evidence and key findings;
4. counterevidence and downside cases;
5. implications and recommendation;
6. assumptions, gaps, and confidence;
7. sources and method.

## Completion, stop, and handoff

Complete only when the decision is answered within scope, material claims and numbers are cited or labeled as estimates, competing definitions are reconciled, counterevidence is included, duplicate evidence is removed, and the recommendation follows from explicit criteria. Stop when required primary evidence is unavailable, definitions cannot be reconciled, authentication or a secret would be exposed, or the next step is an external action not approved by the user. For context pressure or handoff, leave the decision, scope, completed workstreams, source ledger, assumptions, unresolved conflicts, artifact paths, and next read-only step, then resume through the project's prescribed recovery order.

## Related skill boundaries

- Use `exa-search` for a focused discovery query when Exa is available.
- Use `deep-research` for broad non-business synthesis or a multi-domain evidence report.
- Keep outreach, CRM updates, purchasing, and external survey execution in separately authorized workflows.
