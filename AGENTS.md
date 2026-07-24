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

## skill追加・更新の既定リリース

ユーザーが「こういうskillがほしい、追加して」「$skillを更新して」のように依頼した場合、特に留保がなければ、これは本番利用可能にするまでの一連の依頼と解釈する。ユーザーは検証・配布・記録の個別手順を列挙する必要がない。

1. `G:\devwork\ai-settings`の正本だけを編集し、skillの分類、来歴、対象profileへの影響を整える。Cドライブ側を直接編集しない。
2. 対象profileとskill内容を検証し、意図しない差分とsecretを監査する。
3. `Sync-AgentSkills.ps1 -WhatIf`、実同期、runtime manifestのsource/destination file count・tree hash照合を行い、`.system`と母集団外skillを変更しない。
4. 意図したpathだけを明示的にstageし、commitして`origin/main`へpushする。push後に`HEAD == origin/main`、working tree、runtime manifestをreadbackする。
5. `imp-tasks.md`と`imp-comp.md`を更新し、変更内容、検証、runtime配布状態を残す。

「調査だけ」「設計だけ」「正本だけ」「runtimeへ配布しない」「commit/pushしない」のような留保があれば、その範囲だけを実施する。remote mainの進行、validation error、secret疑い、意図不明な差分があれば停止して報告する。

## hookと外部作用の境界

- hookの新規登録・有効化、pluginや依存の新規導入、認証情報の設定、外部サービスへの送信は、skill追加・更新の既定リリースには含めない。event、保存内容、trust、対象をユーザーが明示した場合だけ扱う。
- `docs/imp/knowledge-register.md`は由来と採否が確定するまでstageしない。
- 上流skillを採用する場合は、license、著作権表示、固定commit、変更内容を`registry/`へ記録してから`skills/codex/`へ独立コピーする。

各PJの `AGENTS.md`、`PROJECT.md`、PJ固有の `.codex/config.toml` はそのPJの正本として残す。中央repoには共通templateまたは採用済みの横断ルールだけを置く。

## 安全境界

- secret、token、Cookie、個人情報、session履歴、認証済みplugin設定を追加しない。
- 同期は `-WhatIf` で確認できる。派生配置の `.system`、母集団外skillは削除しない。
- groupをまたぐ同名skillは作らない。

## knowledge候補台帳

- 共通契約・入口: `G:\devwork\tool-set\docs\ops\knowledge-candidate-register-policy.md`
