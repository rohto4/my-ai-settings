# ai-settings

Codex中心のAI設定を育成し、検証して配備するGitリポジトリです。

最初に `AGENTS.md`、`PROJECT.md`、`docs/imp/imp-tasks.md` を読みます。

## 配備

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Test-AgentSet.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Sync-AgentSkills.ps1 -WhatIf
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Sync-AgentSkills.ps1
```

`skills/ecc/`、`skills/codex/`、`skills/original/` が正本で、`C:\Users\unibe\.codex\skills\` はflatな派生配置です。比較用の上流cloneは `upstream/` に置き、active母集団へ直接混ぜません。

## 初回の確認場所

- `skills/ecc/`: ECC母集団として移管した189件
- `skills/codex/`: 上流を評価後、Codex向けに私用編集して採用したskill
- `skills/original/`: このrepoで独自作成した3件
- `upstream/`: Git管理外のread-only上流clone。取得元、commit、licenseは `registry/upstreams.csv` で管理
- `profiles/`: PJ・用途に応じて採用するskillの選択セット
- `commands/`: 検証、同期、profile書き出しのPowerShell command
- `registry/`: skillの出所・分類・見直し状態の台帳
- `config/` / `plugins/`: 共通化候補。認証済み設定は含めない
- `intake/tool-set/`: tool-setから削除なしで回収した設定、旧bootstrap、評価資料、AI設定に関係するタスク・完了・判断の履歴。ここは精査後に正本へ昇格・統合・除外する

最初は `intake/` を含めて不足・重複・PJ固有物を確認し、内容を直接変える前に `docs/imp/imp-tasks.md` の移管方針を更新します。

## 上流skillの全件レビュー

- [上流skill全件 改善提案レビュー](docs/review/upstream-skill-improvement-proposals-2026-07-17.html): 5repository・968採用単位を絞り込み、読書状態保存、詳細展開付きで確認するstandalone HTML
- `docs/review/upstream-skill-improvement-proposals-2026-07-17.csv`: 全件の証拠と改善提案
- `docs/review/upstream-skill-audit-summary-2026-07-17.json`: 件数・比較差分・検証結果

再生成は `commands/audit-upstream-skills.mjs` を使う。上流clone本文はGit管理外で、報告書だけをcommitする。
