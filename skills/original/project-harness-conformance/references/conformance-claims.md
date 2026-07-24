# Conformance claim vocabulary

| State | Meaning | Minimum evidence |
| --- | --- | --- |
| `declared` | Intent exists in instructions, profile, or schema | source link and owner |
| `mapped` | Vendor-neutral control maps to a runtime surface | adapter mapping and current primary source |
| `simulated` | Deterministic fake/synthetic cases pass | positive and negative results |
| `enforced` | Every in-scope action reaches a blocking execution mechanism | real runtime path plus observed blocked attempt |
| `evidenced` | Enforcement result is retained and auditable | immutable or integrity-checked evidence artifact |

For each control capture: `owner`, `enforcement_point`, `failure_mode`, `positive_case`, `negative_case`, `artifact`, `observed_at`, and `limitations`.
