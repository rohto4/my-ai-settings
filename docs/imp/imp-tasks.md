# 実装待ち

## AI-SET-REPO-01: tool-setからAI設定を中央repoへ移管する

- 状態: 初期集約済み・ユーザー精査待ち（2026-07-17）
- 対象: `skills/`、`profiles/`、`commands/`、`registry/`、`config/`、`plugins/`、`legacy/`、`intake/`
- 実施済み: `skills/` をCodex実行時skillの同期正本に切り替え、旧 `G:\devwork\tool-set\agents-v1` は `agents-v1-bk` に退避した。tool-set直下のAI設定候補、旧bootstrap、AI設定の評価・更新資料、関連するtask・完了・判断履歴は `intake/tool-set/` へ削除なしで回収した。
- 方針: `intake/`を直接見て正本昇格・統合・除外を決める。精査前に元のtool-set側や`intake/`を削除しない。
- 完了条件: 移管対象と非対象を確定し、tool-set側の旧配置を参照または廃止できる状態にする。
