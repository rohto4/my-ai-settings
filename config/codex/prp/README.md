# Codex PRP Artifacts

## 目的

PRP系skillから生成されるPRD、実装計画、実装レポートをCodex運用向けに保存する。

`.claude/PRPs` はECC/Claude Code由来の名残として扱い、この v1 では使わない。

Codexのcustom promptsは廃止予定のため、PRPワークフローは `$prp-create-prd`、`$prp-create-plan`、`$prp-implement-plan` を使う。

## 保存先

| 種別 | 保存先 |
| --- | --- |
| PRD | `.codex/prp/prds/{name}.prd.md` |
| Plan | `.codex/prp/plans/{name}.plan.md` |
| Report | `.codex/prp/reports/{name}-report.md` |
| Completed plan | `.codex/prp/completed/{name}.plan.md` |

## 注意

- secret、token、Cookie、未公開認証情報を書かない。
- PRP成果物がPJのタスク状態に影響する場合は、`docs/imp/imp-tasks.md`、`docs/imp/user-judge.md`、`docs/imp/imp-comp.md` に要約を同期する。
