# Security Workflow Routing

Choose by scope and evidence. First inspect which skills or Codex Security plugin workflows are actually available in the current session.

| Need | Route |
| --- | --- |
| Scoped security-sensitive code or configuration review | `security-review` |
| Git-backed PR, commit, branch, or working-tree security diff | `codex-security:security-diff-scan`, when installed |
| Standard repository or scoped-path security audit | `codex-security:security-scan`, when installed |
| Repeated multi-pass repository audit | `codex-security:deep-security-scan`, when installed |
| Repository threat model | `codex-security:threat-model`, when installed |
| Validate candidate findings | `codex-security:validation`, when installed |
| Fix a validated or plausible finding | `codex-security:fix-finding`, when installed |

The ECC-local `security-scan` skill audits Claude/ECC configuration and is not a substitute for the Codex Security repository-scan workflow. If the required qualified workflow is unavailable, stop at the scoped review boundary and report the missing capability instead of claiming full-scan, threat-model, or validation coverage.

Do not run exploit validation, production probing, issue creation, advisory publication, or external tracking without the authorization required by the selected workflow and current environment.
