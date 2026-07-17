# 実装待ち

## AI-SET-RELEASE-01: 改修版skill集をcommit・pushして運用開始する

- 状態: 次セッションへhandoff（2026-07-18）
- 目的: 検証・runtime同期済みの改修版skill集を、無関係な未追跡ファイルを混ぜずにcommit・pushし、新しいCodexタスクでskillメニューと明示呼び出しをsmoke testする。
- 再開入口: `docs/imp/ai-settings-production-handoff-2026-07-18.md`
- 完了条件: 意図した差分だけをcommitして`origin/main`へpushし、commit後のworking tree、remote追従、runtime manifest、主要skillの呼び出しを確認する。完了証拠を`imp-comp.md`へ移し、この項目と一時handoffを整理する。
- 停止条件: 出所未確定の`docs/imp/knowledge-register.md`は、由来と採否を確認するまでstageしない。hookは別の明示依頼なしに追加・有効化しない。

## AI-SET-REPO-01: tool-setからAI設定を中央repoへ移管する

- 状態: 初期集約済み・ユーザー精査待ち（2026-07-17）
- 対象: `skills/`、`profiles/`、`commands/`、`registry/`、`config/`、`plugins/`、`legacy/`、`intake/`
- 実施済み: `skills/` をCodex実行時skillの同期正本に切り替え、旧 `G:\devwork\tool-set\agents-v1` は `agents-v1-bk` に退避した。tool-set直下のAI設定候補、旧bootstrap、AI設定の評価・更新資料、関連するtask・完了・判断履歴は `intake/tool-set/` へ削除なしで回収した。
- 方針: `intake/`を直接見て正本昇格・統合・除外を決める。精査前に元のtool-set側や`intake/`を削除しない。
- 完了条件: 移管対象と非対象を確定し、tool-set側の旧配置を参照または廃止できる状態にする。
