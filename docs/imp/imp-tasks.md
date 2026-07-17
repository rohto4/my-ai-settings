# 実装待ち

## AI-SET-REPO-02: 高評価な外部skill / plugin候補を選定し、来歴構造を整える

- 状態: 実装・全件棚卸し中（2026-07-17）
- 目的: ECC由来の母集団だけに依存せず、支持・保守・ライセンス・実行権限・Codex適合性を確認した外部候補を比較し、採用前の隔離配置と来歴台帳の構造を決める。
- 評価軸: repositoryの支持度、最終更新、license、skill / pluginの実体、Codex向け記法、外部書込み・secret・hookの有無、既存skillとの重複、read-only検証結果。
- ライセンス境界: 本文の取得・改変・再配布は、個別licenseで許される場合だけ行う。許可される場合も上流名、license、著作権表示、変更の事実を保持する。license不明またはsource-available制約のあるものは、本文をrepoへ複製せず、参照・要件抽出・独立したオリジナル実装の候補に留める。
- 調査結果: 既存189件の母集団との現在差分を確認するため`affaan-m/everything-claude-code`も上流clone対象に含める。追加候補は`obra/superpowers`（MIT、Codex App / CLI pluginとして配布、約25.6万stars）と`addyosmani/agent-skills`（MIT、24工程skill、約5.95万stars）を優先候補とする。clone後の実体確認で`openai/skills`は非推奨かつ個別skill license方式と判明したため履歴比較用に降格し、案内先の`openai/plugins`を現行主参照として追加する。`anthropics/skills`はApache-2.0のexampleとsource-availableのdocument skillが混在するため、後者は複製しない。`awesome-codex-skills`と`awesome-copilot`は候補索引であり、個別skillのlicense確認なしに本文を流用しない。
- 停止条件: 私用のskill本文を編集する直前に、ユーザーがGPT-5.6 Sol・非常に高いへ切り替える。切替前は候補調査・来歴・ライセンス判定までで停止する。
- 停止条件の解除: ユーザーがGPT-5.6 Sol・非常に高いへ切り替え、構成変更、配置、GitHub登録、clone対象全skillの改善提案一覧作成を承認した（2026-07-17）。
- 実装方針: 現在の189件を`skills/ecc/`、ローカル作成3件を`skills/original/`へ移す。`skills/codex/`は評価後に採用・私用編集したskillだけを置き、上流の未編集cloneはGit管理外の`upstream/`へ隔離する。実行時の`C:\Users\unibe\.codex\skills\`は従来どおりskill名のflat配置とする。
- 完了条件: 候補ごとの採択・保留・却下理由を記録し、`ECC由来`、`Codex由来`、`オリジナル`、外部候補を混同しないrepo構造と台帳を用意する。候補のactive `skills/` への導入は別途評価後に行う。

## AI-SET-REPO-01: tool-setからAI設定を中央repoへ移管する

- 状態: 初期集約済み・ユーザー精査待ち（2026-07-17）
- 対象: `skills/`、`profiles/`、`commands/`、`registry/`、`config/`、`plugins/`、`legacy/`、`intake/`
- 実施済み: `skills/` をCodex実行時skillの同期正本に切り替え、旧 `G:\devwork\tool-set\agents-v1` は `agents-v1-bk` に退避した。tool-set直下のAI設定候補、旧bootstrap、AI設定の評価・更新資料、関連するtask・完了・判断履歴は `intake/tool-set/` へ削除なしで回収した。
- 方針: `intake/`を直接見て正本昇格・統合・除外を決める。精査前に元のtool-set側や`intake/`を削除しない。
- 完了条件: 移管対象と非対象を確定し、tool-set側の旧配置を参照または廃止できる状態にする。
