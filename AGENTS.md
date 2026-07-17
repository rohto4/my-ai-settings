# AI Settings Repository

## 役割

このリポジトリは、複数PJで再利用するCodex中心のAI設定の正本である。skill、profile、配備・検証command、共通templateをここで管理する。`C:\Users\unibe\.codex\skills\` は実行時に同期する派生配置であり、直接編集しない。

## 作業開始・復帰

作業開始時、コンテキスト圧縮、session移動、handoff後は、次を実体から順に読む。

1. `AGENTS.md`
2. `PROJECT.md`
3. `README.md`
4. `docs/imp/imp-tasks.md`
5. 必要な対象skill、profile、command

完了した作業は `docs/imp/imp-tasks.md` から外し、`docs/imp/imp-comp.md` に成果と検証を残す。

## 正本と派生物

- `skills/ecc/`: ECC母集団として移管したskillの編集正本。個別の原著者・来歴は台帳で保持する
- `skills/codex/`: Codex向け上流候補を評価し、私用に編集・採用したskillの編集正本
- `skills/original/`: このrepoで独自に作成したskillの編集正本
- `profiles/`: PJ・用途ごとの採用セット
- `commands/`: 検証・同期の正本
- `registry/`: 来歴、分類、採用・品質状態の正本
- `config/`: 共通化できるCodex設定の候補・template
- `intake/`: 移管前の来歴を保つ収集物。正本昇格前に直接編集しない
- `legacy/`: 実行対象から外した互換・原文
- `upstream/`: 比較・監査用のread-only clone。clone本体はGit管理外で、active skillとして直接同期しない
- `C:\Users\unibe\.codex\skills\`: `commands/Sync-AgentSkills.ps1` で更新する派生物

## 編集正本とruntime配布

- skill、profile、commandの最新版は常に `G:\devwork\ai-settings` に置き、Cドライブ側を直接編集しない。
- Gドライブの正本更新だけではruntimeへ自動同期しない。更新内容をその場で使う場合、またはユーザーが配布を明示した場合だけCドライブへ同期する。
- 同期しない場合は、正本の検証まで行い、完了記録へ「runtime未同期」と残す。
- 同期する場合は、対象profile検証、`Sync-AgentSkills.ps1 -WhatIf`、実同期、manifestのsource/destination file count・tree hash一致の順で確認する。`.system`と母集団外skillは変更しない。

各PJの `AGENTS.md`、`PROJECT.md`、PJ固有の `.codex/config.toml` はそのPJの正本として残す。中央repoには共通templateまたは採用済みの横断ルールだけを置く。

## 安全境界

- secret、token、Cookie、個人情報、session履歴、認証済みplugin設定を追加しない。
- 同期は `-WhatIf` で確認できる。派生配置の `.system`、母集団外skillは削除しない。
- `upstream/` の本文は直接編集せず、採用時はlicense、著作権表示、固定commit、変更内容を `registry/` に記録してから `skills/codex/` へ独立コピーする。
- `skills/` を変更したら対象profileを検証する。上記のruntime配布条件を満たす場合だけ同期し、manifestのsource/destination file count・tree hash一致を確認する。groupをまたぐ同名skillは作らない。

## knowledge候補台帳

- 共通契約・入口: `G:\devwork\tool-set\docs\ops\knowledge-candidate-register-policy.md`
