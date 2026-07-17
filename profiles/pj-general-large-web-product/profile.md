# pj-general large Web product profile

## 適用対象

要件確定前から実装・運用までを扱い、将来100万行規模を想定するWebプロダクトモノレポ向けの既定profileです。

想定する境界:

- `apps/`: 利用者向け体験
- `services/`: API、認証、同期、通知などのプロセス境界
- `packages/`: 安定した再利用コードとドメイン契約
- `workers/`: 非同期処理、ジョブ、索引、AI補助
- `plugins/`: 外部OSSや拡張との境界
- `infra/`: 実行環境、権限、監視、デプロイ
- `docs/`: product、spec、arch、data、ops、imp、diaryの正本分離

## 選択方針

`profile.json` の30件を常用coreとします。ECC由来181件と追加skillを含む母集団は削除せず、言語別、業務ドメイン別、特殊セキュリティ、メディア、外部サービス別skillは必要なPJや作業で追加採択します。

`recommended_additions` は常時有効化せず、次の作業時に追加する候補です。

| 追加群 | 主な用途 |
| --- | --- |
| `discovery` | 問題探索、PRD、深い外部調査、OSS採用判断 |
| `implementation` | 境界実装、API連携、UI設計、Next.js、ブラウザQA |
| `ai_quality` | AI機能設計、AI回帰評価 |
| `delivery` | デプロイ、コンテナ |
| `maintenance` | skill母集団監査、回答の追加展開 |

`commands/Export-AgentProfile.ps1` はcore 30件だけを空の候補ディレクトリへ書き出します。追加群は対象PJまたは作業フェーズで選んでから採用します。

## 横断routing

- 未知repoの構造・規約・入口把握は `codebase-onboarding`、所有権・vendored/generated混入・構造リスクの監査は `repo-scan`、Codexのtool・plugin・connector・権限状態の監査は `workspace-surface-audit` を使います。
- 対象libraryが未確定なら `search-first`、対象が確定しており現行APIや設定だけを確認するなら `documentation-lookup` を使います。
- 文脈コストの計測と削減案は `context-budget`、安定境界での復帰状態保存と圧縮可否判定は `strategic-compact` を使います。
- 破壊的操作、外部書き込み、権限変更、不可逆操作、production mutationの直前には `safety-guard` を先行させます。通常の読み取りや局所的な非破壊編集へ常時発火させません。
- task、判断、完了、handoffはexport先または適用先PJの正本へ保存し、`agents-v1`候補ツリーを実行中PJの状態保存先にはしません。

## pj-general向け補正

- 実装例は対象PJの `tech-stack.md` を優先し、skill内のExpress、Prisma、Jest等を自動採用しません。
- package配置はフォルダ名ではなく、プロダクト責務、データ所有、実行境界、将来分割で判断します。
- user判断、user作業、実装タスク、完了記録、handoffを混在させません。
- PRPは下書きを `.codex/prp/` に置き、採用内容と状態だけをPJ正本へ反映します。
- security skillは母集団ですべて保持し、作業対象に応じて専門skillを追加します。

## 推論設定

同梱 `.codex/config.toml` はモデル名を固定しません。ユーザー設定のモデルを継承し、通常作業をhigh、Plan modeをxhigh、出力密度をmediumとする候補です。権限、sandbox、network、connectorは対象PJの方針に委ねます。
