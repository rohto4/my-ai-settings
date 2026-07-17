# 新規PJ AI設定・構造 bootstrap

## 正本

今後の新規PJでは、AI設定、docs運用、初期ディレクトリ、skill選択の案内所を `G:\devwork\tool-set` とする。

- PJ初期化guide: `G:\devwork\tool-set\docs\guide\new-project-bootstrap.md`
- skill母集団、Codex設定、profile、検証command: `G:\devwork\tool-set\agents-v1`
- 汎用PJルール例: `G:\devwork\tool-set\AGENTS.md`、`PROJECT.md`、`tech-stack.md`、`docs\guide\docs-management-rules.md`
- `G:\devwork\pj-general` と `G:\devwork\obsidian-set` は、特定用途の比較材料または履歴参照であり、新規PJ初期化の正本ではない。

コピー元は変更せず、対象PJへ用途に合わせて適応する。

## 適応対象

原則として対象PJへ作る、または既存内容と統合する。

- `AGENTS.md`: 実行ルール、読み込み順、安全、docs更新、対象PJ固有の境界
- `PROJECT.md`: 目的、scope、正本関係、恒久構造、採用済み重要判断
- `tech-stack.md`: 採用済み、候補、未決を分けた技術正本
- `README.md`: 人とAIの短い入口
- `docs/guide/docs-management-rules.md`: docsの正本、同期、更新時点
- `docs/imp/user-tasks.md`、`user-judge.md`、`imp-tasks.md`、`imp-comp.md`: actor別の進行管理
- `.agents/README.md`: PJ内skillの出自、選択、注意点
- `apps/`、`services/`、`packages/`、`workers/`、`scripts/`、`infra/`、`tests/`、`docs/`: 用途に必要な境界だけ

## 条件付き採択

- `.agents/skills/`: `agents-v1/profiles/`から対象PJに必要なskillだけを選ぶ。母集団189件を新規PJへ無条件に全コピーしない。
- `.codex/config.toml`: model、provider、approval、sandbox、networkを固定せず、対象PJとユーザー設定の責務を確認する。
- `commands/`: 対象PJで反復する決定的処理だけを採択する。
- `.codex/prp/`: PRD / plan workflowを使うPJだけ作る。
- knowledge-vault、外部connector、automation: 対象、権限、通知先、運用正本が確定した場合だけ採択する。

## コピーしないもの

- `.git/`、secret、token、Cookie、認証済み設定、個人識別情報
- コピー元PJの未完task、判断待ち、完了履歴、handoff、session log
- automation ID、外部送信先、production path、account、tenant固有値
- コピー元のapps/services実装、生成物、依存cache、tmp、backup
- `agents-v1/ecc-legacy/`。これは出自保持用でありactive設定ではない。
- 対象PJで未採用のframework、language、cloud、認証方式を前提にしたskill

## 標準初期プロンプト

末尾の「PJ固有情報」だけを対象PJに合わせて書き換える。

```text
本PJは、末尾の「PJ固有情報」に記載した目的のPJです。

新規PJのAI設定、docs運用、初期ディレクトリ、skill選択は、次を正本として対象PJへ適応してください。
G:\devwork\tool-set

コピー元は参照専用とし、変更しないでください。最初に次をUTF-8で読み、正本関係と適応ルールを把握してください。
- G:\devwork\tool-set\AGENTS.md
- G:\devwork\tool-set\PROJECT.md
- G:\devwork\tool-set\tech-stack.md
- G:\devwork\tool-set\docs\guide\docs-management-rules.md
- G:\devwork\tool-set\docs\guide\new-project-bootstrap.md
- G:\devwork\tool-set\agents-v1\README.md
- G:\devwork\tool-set\agents-v1\.agents\README.md
- G:\devwork\tool-set\agents-v1\profiles\

次の順で実施してください。
1. 現在のworkspaceを対象PJルートとして解決し、既存ファイル、Git状態、採用済みstack、既存AI設定をread-onlyで把握する。
2. コピー元と対象PJを比較し、「そのまま採択」「PJ向けに変更」「採択しない」を整理する。
3. 既存ファイルやユーザー変更を上書き・削除せず、diff-firstで統合する。新規の空PJなら必要な最小構造を直接作成してよい。
4. AGENTS.md、PROJECT.md、tech-stack.md、README.md、docs管理、docs/impのactor分離を、対象PJの目的と規模に合わせて作る。
5. skillは母集団を全コピーせず、対象PJの規模・stack・作業phaseに合うprofileと追加skillだけを採択する。言語・framework専用skillは、その採用が確定している場合だけ含める。
6. 採用済み、候補、未決を明確に分ける。候補技術を現行実装として書かない。
7. secret、認証情報、コピー元のtask/history/handoff、automation ID、外部送信先、ecc-legacyをコピーしない。
8. 作成後、初期読み込み順、正本リンク、skill実在、local resource link、config/JSON/TOML/PowerShell構文を検証する。
9. 最後に、作成・変更・不採択、選択profile/skill、未決判断、ユーザー作業、実行した検証を分けて報告する。

PJ固有情報:
- PJ名:
- 目的・利用者:
- 想定規模:
- 現在のphase:
- 採用済みstack:
- 候補stack:
- 必要なapps/services/packages/workers/infra境界:
- 外部連携と権限:
- 必須のdocs・運用:
- 禁止事項・変更不可範囲:
- 初回に達成したい状態:
```

## 受入確認

- 対象PJの`AGENTS.md`から初期読み込み順と正本へ到達できる。
- `PROJECT.md`へtaskやsession logを混在させていない。
- 採用済みstackと候補stackが分かれている。
- user判断、user作業、実装task、完了、handoffが分離されている。
- skillはprofileまたは明示理由から選ばれ、言語専用skillを無条件採択していない。
- コピー元のsecret、履歴、外部送信設定、`ecc-legacy`を持ち込んでいない。
- 既存PJの場合、既存変更を保持した差分が確認できる。
