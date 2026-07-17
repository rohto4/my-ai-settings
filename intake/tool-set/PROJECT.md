# Tool-set Project Context

## 目的

このPJは、複数の開発・運用PJで使うツール、定期処理、検証補助を設計・実装する汎用拠点である。最初の成果物は、`G:\devwork` 配下の完了記録を定期評価し、必要な知見を `G:\knowledge-vault` に要約・転記する運用である。

## 正本と作業入口

- 毎チャット共通の起動・圧縮復帰・実行ルール: `AGENTS.md`
- PJ目的・恒久構造: `PROJECT.md`
- 技術・実務ツール: `tech-stack.md`
- 作業役割別の最小読込: `docs/guide/implementation-context-reading-guide.md`
- docs管理: `docs/guide/docs-management-rules.md`
- 新規PJ初期化の正本: `docs/guide/new-project-bootstrap.md`
- AI設定母集団・profile・検証: `agents-v1/`
- 定期監査の運用仕様: `docs/ops/knowledge-vault-sync-schedule.md`
- ユーザー作業: `docs/imp/user-tasks.md`
- ユーザー判断: `docs/imp/user-judge.md`
- 実装待ち: `docs/imp/imp-tasks.md`
- 完了記録: `docs/imp/imp-comp.md`

## 構造

```text
G:\devwork\tool-set
├── AGENTS.md / PROJECT.md / README.md / tech-stack.md
├── apps/ services/ packages/ workers/ scripts/ infra/ tests/
├── .agents/                         # PJ固有skill・補助設定
├── agents-v1/                       # 新規PJ向けAI設定母集団・profile・検証
├── commands/                        # 再利用可能な操作手順
└── docs/
    ├── guide/ spec/ candi-ref/ imp/ diary/ setting/
    ├── ops/                         # 定期処理・保守運用
    ├── product/ arch/ org/ data/    # 必要になった段階で利用
    └── README.md
```

## 恒久方針

- 1ファイル1責務、正本は1つだけにする。
- コンテキスト圧縮・セッション移動・handoff後は、要約を補助情報として扱い、`AGENTS.md` が指定する初期化ファイルと `docs/imp/*` の現行タスクをファイル実体から復元してから作業を続ける。
- 初期化後の追加読込は `docs/guide/implementation-context-reading-guide.md` で作業役割に対応する最小範囲へ限定する。
- 新規PJのAI設定・docs運用・初期構造は、このPJのbootstrap guideと`agents-v1`をコピー元の正本にする。
- knowledge-vault の中央方針は `G:\knowledge-vault\knowledge-vault-write-policy.md` であり、このPJへ複製しない。
- 自動化は、対象・根拠・転記先を追跡可能にし、重複転記を避ける。判断に自信がない事項は転記せず、対象PJのユーザー判断へ残す。
