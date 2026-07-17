# AI設定群 評価メモ 2026-07-09

## 目的

`G:\devwork\pj-general` 配下にある最新のAI関連設定群を、`tool-set` から参照して評価し、改善候補を整理する。

この文書は候補評価メモであり、採用済み運用ルールの正本ではない。採用が決まった内容は `docs/guide/`、実装タスクは `docs/imp/imp-tasks.md`、ユーザー判断は `docs/imp/user-judge.md` に移す。

## 読んだ主要ファイル

- `G:\devwork\pj-general\AGENTS.md`
- `G:\devwork\pj-general\PROJECT.md`
- `G:\devwork\pj-general\README.md`
- `G:\devwork\pj-general\tech-stack.md`
- `G:\devwork\pj-general\docs\README.md`
- `G:\devwork\pj-general\docs\guide\docs-management-rules.md`
- `G:\devwork\pj-general\docs\guide\bootstrap-ground-rules.md`
- `G:\devwork\pj-general\docs\guide\codex-foundation-sources.md`
- `G:\devwork\pj-general\docs\setting\README.md`
- `G:\devwork\pj-general\docs\imp\session-discipline.md`
- `G:\devwork\pj-general\.agents\README.md`
- `G:\devwork\pj-general\.agents\skills\knowledge-ops\SKILL.md`
- `G:\devwork\pj-general\.agents\skills\verification-loop\SKILL.md`
- `G:\devwork\pj-general\.agents\skills\tdd-workflow\SKILL.md`
- `G:\devwork\pj-general\.agents\skills\research-ops\SKILL.md`
- `G:\devwork\pj-general\.agents\skills\deep-research\SKILL.md`
- `G:\devwork\pj-general\.agents\skills\exa-search\SKILL.md`
- `G:\devwork\pj-general\.agents\skills\fastmcp-client-cli\SKILL.md`
- `G:\devwork\pj-general\commands\prp-plan.md`
- `G:\devwork\pj-general\commands\prp-implement.md`

## 現状評価

### 良い点

- `AGENTS.md` / `PROJECT.md` / `docs/guide/docs-management-rules.md` の正本分離は明確。
- 圧縮復帰時に正本ファイルを読み直す方針があり、会話要約だけに依存しない。
- `docs/imp` でユーザー判断、ユーザー作業、実装タスク、完了記録を分ける方針は再利用しやすい。
- `.agents/README.md` が docs 更新判断表の重複コピーを避ける方針を示している。
- `docs/guide/codex-foundation-sources.md` に、Codex運用土台の追随先と参考repoの扱いが明記されている。

### 主な改善候補

1. **Claude前提の残存**
   - `knowledge-ops` に `~/.claude/projects/*/memory/`、`TodoWrite`、Claude Code Memory が残っている。
   - `deep-research` に Claude Code の Task tool 前提が残っている。
   - `exa-search` は `~/.claude.json` への設定例が中心。
   - `commands/prp-*` は `.claude/PRPs/` へ成果物を保存する前提。

2. **Windows / PowerShell とのズレ**
   - `verification-loop` と `commands/prp-*` に `cat`、`grep`、`head`、`tail`、`mkdir -p`、`mv`、バックグラウンド実行など Unix 前提の例が多い。
   - `pj-general` の `tech-stack.md` は PowerShell を標準シェルとしているため、主要コマンドは PowerShell 版を併記する必要がある。

3. **設定の有効範囲が曖昧**
   - `.codex` は存在するが、確認時点では実体ファイルがない。
   - `.agents` は存在するが、どの skill を現行運用で有効扱いにするか、どれを試用扱いにするかの一覧がない。
   - `commands/` はECC由来の試用command置き場とされている。PRP出力先は `.claude/PRPs` ではなく `.codex/prp/` に寄せる方針に決定済み。

4. **knowledge-vault 連携の正本衝突リスク**
   - `pj-general` の正本は `G:\knowledge-vault\knowledge-vault-write-policy.md` 参照。
   - `knowledge-ops` skill は複数レイヤーへ同時保存する設計で、PJ内正本、Codex記憶、MCP memory、knowledge-vault の責務が混ざりやすい。

5. **secret 記載誘導のリスク**
   - `exa-search` の設定例は `EXA_API_KEY` をJSON内に書く形式。
   - 実値は書かれていないが、PJ方針としては secret をrepoに置かないため、ユーザー環境変数またはローカル未追跡設定への誘導へ寄せたい。

6. **検証skillのプロジェクト適応不足**
   - `verification-loop` は npm / pnpm 中心で、Bun、PowerShell、repo別検証コマンドの検出に弱い。
   - `tool-set` の OpenCode-Link では Bun が重要で、`pj-general` では pnpm が候補になっているため、共通skillは自動検出かPJ別上書きが必要。

## 初回改善方針

## skill / command 分類

### すぐ現行運用へ寄せやすい

| 対象 | 判定 | 理由 | 次アクション |
| --- | --- | --- | --- |
| `AGENTS.md` / `PROJECT.md` / `docs/guide/docs-management-rules.md` | 採用候補 | 正本分離と圧縮復帰ルールが明確 | `tool-set` 側との差分を後で整理する |
| `.agents/README.md` | 採用候補 | `.agents` にdocs更新ルールを重複させない方針が明確 | 重要skill追加時の入口として維持 |
| `mermaid-diagram-style` | 採用候補 | 日本語docsと相性がよく、外部secretやClaude依存が目立たない | 図作成時に個別利用 |
| `fastmcp-client-cli` | 条件付き採用 | MCP CLI利用の説明として有用 | Windows/PowerShell例を補う |
| `research-ops` | 条件付き採用 | 事実・推論・推薦の分離方針がよい | Codexの検索手段と公式情報優先ルールへ寄せる |

### 修正してから使う

| 対象 | 判定 | 主な問題 | 優先修正 |
| --- | --- | --- | --- |
| `knowledge-ops` | 要修正 | Claude memory、MCP memory、GitHub/Linear、KBの多層保存が現在の `G:\knowledge-vault` 中央policyと衝突しやすい | `G:\knowledge-vault\knowledge-vault-write-policy.md` を最上位参照にする |
| `verification-loop` | 要修正 | Claude Code表記、npm/pnpm中心、Unixコマンド中心 | PowerShell、Bun、pnpm、npm、Pythonを検出型にする |
| `tdd-workflow` | 要修正 | Jest/React/Supabase/Redis例が強く、pj-generalのNext.js候補やtool-setのSolidJS/Bunとズレる | PJ別テストコマンドとUIフレームワーク前提を分離する |
| `deep-research` | 要修正 | firecrawl/exa MCPとClaude Code Task tool前提 | 利用可能tool確認、ブラウズ必須条件、引用ルールへ寄せる |
| `exa-search` | 要修正 | `~/.claude.json` とAPIキー直書き例に寄っている | secretはローカル未追跡設定か環境変数へ誘導 |
| `commands/prp-*` | 要修正 | `.claude/PRPs`、Unix shell、PRD/Plan/Reportの保存先がCodex運用と合わない | `.codex/prp/` 案へ寄せる |

### 用途限定

| 対象 | 判定 | 理由 |
| --- | --- | --- |
| `article-writing` / `brand-voice` / `content-engine` | 用途限定 | コンテンツ制作には有用だが、AI設定基盤の中核ではない |
| `market-research` | 用途限定 | 調査・比較時のみ使う。外部情報は都度一次情報確認が必要 |
| `genshijin` | 保留 | descriptionが複数行で用途確認が未完了 |
| `expand-answer.md` | 用途限定 | 回答拡張用で、PJ設定基盤ではない |

## 改善優先順位

1. `commands/prp-*` の保存先とPowerShell例を直す。
   - 理由: 実行すると成果物が `.claude/PRPs` に散り、Codex特化運用から外れるため。
2. `verification-loop` をPJ検出型に直す。
   - 理由: 実装後の品質確認で毎回使うため、古いコマンド例の影響が大きい。
3. `knowledge-ops` を `G:\knowledge-vault` 中央policy参照型に直す。
   - 理由: 正本衝突と重複保存が起きやすい。
4. `research-ops` / `deep-research` / `exa-search` を、利用可能tool確認とsecret非記載へ寄せる。
   - 理由: 最新情報・外部調査は便利だが、APIキーやMCP前提を誤るとすぐ詰まる。

### Wave 1: 安全な整理

- `.agents` / `commands` / `.codex` / docs運用ルールの棚卸し表を作る。
- Claude前提、Unix前提、secret誘導、保存先衝突を一覧化する。
- 現行運用に入れてよいものと、試用・要修正扱いのものを分ける。

### Wave 2: Codex / Windows 適応

- `knowledge-ops` を Codex + `G:\knowledge-vault` 中心に直す案を作る。
- `verification-loop` を PowerShell / Bun / pnpm / npm 検出型に直す案を作る。
- `commands/prp-*` の出力先を `.claude/PRPs` から `.codex/prp/` へ寄せる案を作る。

### Wave 3: 採用ルール化

- 採用済みになった運用は `docs/guide/` に移す。
- 実装待ちは `docs/imp/imp-tasks.md` に残す。
- ユーザー判断が必要なものは `docs/imp/user-judge.md` に残す。

## 未決事項

- PRP成果物の保存先は `.codex/prp/` に決定。
- `.agents/skills` は最小セットを決めず、ECCの `skills` を正本として全件持ってくる方針に決定。
- `pj-general` 側は直接修正せず、まず `tool-set\agents-v1` 側で改善案v1を作る方針に決定。
- skillについては `pj-general` ではなくECCを正本にし、そこからCodex向け改善を加える。
