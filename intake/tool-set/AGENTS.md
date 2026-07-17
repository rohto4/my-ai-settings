# Tool-set Agent Instructions

## コンテキスト圧縮復帰の最優先ルール

作業開始時、およびコンテキスト自動圧縮、セッション移動、handoff受領、要約コンテキストからの再開を検知した場合は、ユーザーへの通常回答、作業継続、ファイル編集、外部書き込みより前に、次の順で文脈をファイル実体から復元する。

1. `AGENTS.md`
2. `PROJECT.md`
3. `tech-stack.md`
4. `README.md`
5. `docs/imp/user-tasks.md`
6. `docs/guide/implementation-context-reading-guide.md`
7. 現行作業に対応する `docs/imp/imp-tasks.md`、`docs/imp/imp-comp.md`、`docs/imp/user-judge.md` の対象見出し
8. handoffがある場合だけ、該当する `docs/diary/*`

圧縮後の要約、会話履歴、memoryは復帰の補助情報であり、上記ファイル実体の代替正本として扱わない。初期化後は読込ガイドで作業役割を選び、対象外のdocs、source tree、過去diary、リンク先を再帰的に広く読まない。

非自明な作業は着手時に `docs/imp/imp-tasks.md` へ目的・状態・完了条件を記録する。進行中に状態が変わった場合は同ファイルを更新し、完了時は項目を `imp-tasks.md` から外して `docs/imp/imp-comp.md` へ成果物と検証結果を残す。`imp-tasks.md` に完了証拠や完了履歴を溜めない。圧縮復帰時に現行タスクの記録が不足していた場合は、作業を続ける前に補完する。

## 最優先ルール

1. 日本語で対応し、全ファイルを UTF-8 として扱う。
2. このPJは、複数用途で再利用するローカルツール、運用自動化、検証補助を作る汎用開発拠点として扱う。
3. secret、トークン、Cookie、未公開の認証情報をリポジトリに書かない。
4. 作業開始時と圧縮復帰時は、上記「コンテキスト圧縮復帰の最優先ルール」を必ず実行する。
5. PJ docsの更新判断は `docs/guide/docs-management-rules.md` を正本にする。タスク、判断待ち、完了記録は `docs/imp/` に置き、仕様本文や `PROJECT.md` に混在させない。
6. 横断ナレッジの記載前には必ず `G:\knowledge-vault\knowledge-vault-write-policy.md` を読み、PJ固有の未完TODOや一度きりのログを転記しない。
7. `G:\devwork` 横断操作では、対象PJの `AGENTS.md` と `PROJECT.md` を先に読み、対象範囲を必要最小限に限定する。削除、既存内容の上書き、外部送信はしない。

## 読み込み順

1. `AGENTS.md`
2. `PROJECT.md`
3. `tech-stack.md`
4. `README.md`
5. `docs/imp/user-tasks.md`
6. `docs/guide/implementation-context-reading-guide.md`
7. 現行作業に対応する `docs/imp/user-judge.md`、`docs/imp/imp-tasks.md`、`docs/imp/imp-comp.md` の対象見出し
8. 必要に応じて該当する `docs/diary/*`
9. 読込ガイドが指定する `docs/guide/*`、`docs/spec/*`、`docs/ops/*`、`.agents/skills/*/SKILL.md`、`commands/*.md` の必要箇所

## ディレクトリ方針

- `apps/`: 利用者向けツール・UI
- `services/`: API、通知、外部連携
- `packages/`: 再利用ライブラリ、共通モデル
- `workers/`: バッチ、定期ジョブ、AI補助処理
- `scripts/`: 継続利用するローカル運用スクリプト
- `infra/`: 実行環境、権限、監視
- `docs/`: 仕様、運用、候補、進行管理

## knowledge-vault 監視の運用

- 定期監査の正本は `docs/ops/knowledge-vault-sync-schedule.md`。
- PJ共通ルールのAGENTS.md更新監査の正本は `docs/ops/pj-agents-sync-schedule.md` とする。
- 対象は `G:\devwork` 直下の、`AGENTS.md`、`PROJECT.md`、`docs\imp\imp-comp.md` を持つPJだけとする。依存物、clone、バックアップ、隠しディレクトリは再帰監視しない。
- 未転記候補は `imp-comp.md` の完了項目と、PJ内の既存記録・`G:\knowledge-vault` の既存ノートを照合して判断する。推測だけで転記しない。
- 転記した場合は、そのPJの `imp-comp.md` に転記先・日時・対象を追記して完了通知とする。通知先を勝手に外部サービスへ増やさない。
- knowledge候補台帳の共通契約・入口: `G:\devwork\tool-set\docs\ops\knowledge-candidate-register-policy.md`
