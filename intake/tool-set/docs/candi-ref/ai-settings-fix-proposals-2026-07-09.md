# AI設定群 改善案 2026-07-09

## 目的

`G:\devwork\pj-general` 由来のAI関連設定群を、Codex / Windows / PowerShell / PJ docs運用に合わせて直すための具体案を置く。

この文書は改善案であり、実ファイルへ反映する前の候補である。

## 1. PRP command の保存先

### 現状

- `commands/prp-prd.md`: `.claude/PRPs/prds/{name}.prd.md`
- `commands/prp-plan.md`: `.claude/PRPs/plans/{name}.plan.md`
- `commands/prp-implement.md`: `.claude/PRPs/reports/{name}-report.md`

### 問題

- PJの進行管理正本である `docs/imp` から外れる。
- 圧縮復帰時の読み込み順に自然に入らない。
- Claude専用ディレクトリ名がCodex運用とズレる。

### 検討したが不採用にした案

```text
docs/imp/prp/
├── prds/
├── plans/
├── reports/
└── completed/
```

運用:

- PRD: `docs/imp/prp/prds/{kebab-case-name}.prd.md`
- Plan: `docs/imp/prp/plans/{kebab-case-name}.plan.md`
- Report: `docs/imp/prp/reports/{kebab-case-name}-report.md`
- 完了済みPlan: `docs/imp/prp/completed/{kebab-case-name}.plan.md`

この案の利点:

- `docs/imp` 配下なので実装者の通常読み順に入る。
- `.codex` や `.claude` のようなツール固有名を避けられる。
- PRD / plan / report はPJ進行状態に近く、非表示ディレクトリへ置くより追いやすい。

### 2026-07-09 決定

ユーザー判断により、PRP成果物の保存先は `.codex/prp/` とする。

```text
.codex/prp/
├── prds/
├── plans/
├── reports/
└── completed/
```

理由:

- 現在はClaudeを使っておらず、Codex特化で運用するため。
- `.claude/PRPs` はECC/Claude Code由来の名残として扱う。
- PRP成果物がPJの実装状態に影響する場合は、`docs/imp/*` へ要約・状態だけ同期する。

## 2. PowerShell 対応

### 置換候補

| Unix例 | PowerShell例 |
| --- | --- |
| `cat package.json` | `Get-Content -Raw -Encoding UTF8 package.json` |
| `grep -A 20 '"scripts"'` | `Select-String -Path package.json -Pattern '"scripts"' -Context 0,20` |
| `head -30` | `Select-Object -First 30` |
| `tail -50` | `Select-Object -Last 50` |
| `mkdir -p path` | `New-Item -ItemType Directory -Force -Path path` |
| `mv src dst` | `Move-Item -LiteralPath src -Destination dst` |
| `grep -rn` | `rg -n` |

### 方針

- Windows標準はPowerShell例を先に置く。
- Linux/macOS互換が必要なcommandでは、PowerShell例とPOSIX例を分けて置く。
- 破壊的操作や移動は `-LiteralPath` を使う。

## 3. verification-loop 改善案

### 現状の問題

- Claude Code前提の説明。
- npm / pnpm中心で、Bun検出がない。
- Unixの `head` / `tail` / `grep` 前提。
- secret検索が単純で、誤検知・漏れの説明がない。

### 推奨フロー

1. PJ初期化ファイルを読む。
2. lockfileと `package.json` から実行系を検出する。
3. 利用可能な検証コマンドだけを実行する。
4. 失敗した検証は、コマンド、終了コード、先頭/末尾ログ、対応方針を記録する。
5. 実行結果を `docs/imp/imp-comp.md` または該当タスクへ要約する。

### 検出順

| 条件 | Runner |
| --- | --- |
| `bun.lockb` / `bun.lock` | `bun run` |
| `pnpm-lock.yaml` | `pnpm run` |
| `yarn.lock` | `yarn` |
| `package-lock.json` | `npm run` |
| `pyproject.toml` | `python -m` または `uv run` |
| `Cargo.toml` | `cargo` |
| `go.mod` | `go` |

### 出力形式

```text
検証結果
- Build: pass/fail/not-found
- Typecheck: pass/fail/not-found
- Lint: pass/fail/not-found
- Test: pass/fail/not-found
- Secret scan: pass/fail
- Diff review: pass/fail/not-run
```

## 4. knowledge-ops 改善案

### 現状の問題

- Claude memory、MCP memory、GitHub/Linear、KB repoが同時に出てきて、現在の正本関係と衝突しやすい。
- `G:\knowledge-vault\knowledge-vault-write-policy.md` が最上位ではない。
- 「常に複数レイヤーへ保存」のように読める箇所がある。

### 推奨フロー

1. まずPJ内正本か横断ナレッジかを分類する。
2. PJ固有の未完TODO、進捗、作業途中メモはPJ内 `docs/imp` に置く。
3. 複数PJで再利用できる知見だけ、`G:\knowledge-vault\knowledge-vault-write-policy.md` を読んで保存先を決める。
4. secret、token、Cookie、未公開認証情報は保存しない。
5. 反映した場合はPJ側の `docs/imp/imp-comp.md` に、保存先と要約だけ残す。

### 保存先判断

| 内容 | 優先保存先 |
| --- | --- |
| 現在PJの実装待ち | `docs/imp/imp-tasks.md` |
| ユーザー判断待ち | `docs/imp/user-judge.md` |
| ユーザー作業 | `docs/imp/user-tasks.md` |
| 完了記録 | `docs/imp/imp-comp.md` |
| セッション引き継ぎ | `docs/diary/` |
| 複数PJで再利用できる知見 | `G:\knowledge-vault` |
| secretや認証情報 | 保存しない |

## 5. research系skill改善案

### 現状の問題

- `deep-research` / `exa-search` はExaやFirecrawl MCPがある前提。
- `exa-search` に `~/.claude.json` へのAPIキー設定例がある。
- 外部情報の新鮮さ確認ルールが、Codex本体のブラウズ方針と重複する。

### 推奨フロー

1. 利用可能な検索toolを確認する。
2. 外部検索が必要か、ローカルdocsで足りるかを判定する。
3. 最新情報、仕様、API、価格、規約、セキュリティ判断は一次情報を優先する。
4. 出典リンク、日付、事実/推論/推薦の区別を明記する。
5. APIキーやtokenは設定例でもrepoに実値を書かない。

## 次の実作業候補

1. `commands/prp-*` のCodex/PJ版ドラフトを `.codex/prp/` 前提で作る。
2. `verification-loop` のCodex/Powershell版ドラフトを作る。
3. `knowledge-ops` のCodex/vault版ドラフトを作る。
