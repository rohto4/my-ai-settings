# AI Settings Project Context

## 目的

Codexを中心としたAI設定を、一つのGitリポジトリで育成・検証・配備する。2026-07-17に `G:\devwork\tool-set\agents-v1` とtool-set直下のAI設定候補を、削除なしのコピーで集約開始した。

## 初期構造

```text
ai-settings/
├── skills/       # 193件のactive母集団をecc/codex/originalに分類
├── profiles/     # 採用セット
├── commands/     # Test / Sync / Export
├── registry/     # 来歴・分類・品質台帳
├── config/       # Codex設定候補
├── plugins/      # 共通plugin候補
├── intake/       # tool-set直下の散在設定を収集した来歴
├── legacy/       # 実行対象外の互換資源
├── upstream/     # Git管理外のread-only上流clone
└── docs/imp/     # 移管作業の状態
```

## 移管の境界

- このrepoへ昇格するもの: skill、profile、同期・検証command、共通template、再利用するCodex設定。
- 各PJに残すもの: PJごとの `AGENTS.md` / `PROJECT.md`、PJ固有の設定、実装・運用タスク。
- 保留: `intake/` の内容は、必要性・重複・secret混入を確認してから正規の位置へ昇格または除外する。

## skillの分類と上流採用

- `skills/ecc/`: `agents-v1-bk`から移管した189件。frontmatter内のcommunity等の原出典は `registry/skill-lineage.csv` で失わない。
- `skills/codex/`: 上流候補をそのまま置く場所ではない。licenseとCodex適合性を確認し、私用に編集・検証して採用したものだけを置く。
- `skills/original/`: このrepoで独自作成した4件。知識HTMLは構造skillとstyle skillを分離し、新規作成時だけ順次適用する。
- `upstream/`: 既存189件の主な母集団である`affaan-m/everything-claude-code`と、`obra/superpowers`、`addyosmani/agent-skills`、OpenAIの現行`openai/plugins`および非推奨になった`openai/skills`の比較用clone。clone本体は `.gitignore` 対象で、commitとlicenseだけを台帳へ固定する。
