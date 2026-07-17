# 実装待ち

## AI-SET-V1-01: Codex向けAI設定群 v1 の改善

- 状態: 第一改善バッチ完了（2026-07-12）
- 対象: `agents-v1/`
- 方針: ECC由来181 skillは母集団として保持し、PJごとの有効セットはprofileで選択する。
- 今回の実装:
  - skill frontmatterを現行Codex仕様へ合わせる。
  - pj-general級の大規模Webプロダクトprofileを作る。
  - 母集団検証とprofile展開のPowerShellスクリプトを作る。
  - 廃止予定custom promptをPRP系skillへ置き換える。
  - `verification-loop` と `knowledge-ops` をCodex / PowerShell / docs正本分離へ適応する。
  - 大規模PJ向けの不足skillを追加する。
- 完了条件: 構造検証が成功し、profile内の全skillが実在し、追加・更新skillがCodex skill仕様を満たす。
- 完了証拠:
  - 189/189 skillが公式`quick_validate.py`をUTF-8モードで通過。
  - `Test-AgentSet.ps1`はerror 0。
  - pj-general core 30件と追加候補15件に欠落・重複なし。
  - profile書き出し試験で30/30件を確認。

## AI-SET-V1-02: pj-general core本文のCodex化

- 状態: 完了（2026-07-12）
- 対象: `context-budget`、`strategic-compact`、`product-capability`、`codebase-onboarding`、`repo-scan`、`workspace-surface-audit`、`documentation-lookup`、`safety-guard`、`search-first`
- 完了条件: Claude固有tool、path、memory、agent名をCodexの実在surfaceまたは能力検出へ置き換え、各skillを公式validatorとforward testへ通す。
- 完了証拠:
  - 9件を最終52～86行の範囲へ再設計し、全件に`agents/openai.yaml`を配置した。
  - 公式`quick_validate.py`で9/9 valid、`Test-AgentSet.ps1`でerror 0を確認した。
  - Luna highの4系統forward testとTerra highの独立stocktakeを実施し、修正後94/100、P0/P1なしを確認した。
  - 旧Claude/Bash compaction hookは削除せず`agents-v1/ecc-legacy/`へ隔離した。

## AI-SET-V1-03: pj-general core長大skillの分割

- 状態: 完了（2026-07-12）
- 対象: `coding-standards`、`api-design`、`backend-patterns`、`frontend-patterns`、`git-workflow`
- 完了条件: `SKILL.md`を選択・手順・停止条件・出力・検証中心へ縮小し、長い例とframework別詳細を`references/`へ分離する。
- 追加確認: `git-workflow`のactive本文に残るBash hook例を、Windows/Codex運用から誤実行されない形へ分離する。
- 完了証拠:
  - 5件を71～127行へ縮小し、topic別`references/`へ元の有用情報を保持した。
  - 5件すべてに`agents/openai.yaml`を追加し、profile概算を7,237文字へ収めた。
  - 公式`quick_validate.py`で対象5件と安全修正した`database-migrations`の6/6 validを確認した。
  - Terra highの独立stocktake、3シナリオforward test、修正後回帰監査を行い、最終100/100、P0-P3なしを確認した。
  - `Test-AgentSet.ps1`はactive resourceとprofile概算文字数も検証し、error 0となった。

## AI-SET-V1-04: 作業別profileの追加

- 状態: 後続
- 対象: discovery、implementation、AI quality、delivery、security、script language / SQL
- 完了条件: 母集団を削除せず、各profileの初期skill一覧がCodexのcontext予算内に収まり、書き出しcommandで欠落なく生成できる。

## AI-SET-V1-05: 安定skillのCodex plugin化

- 状態: profileとtrigger安定後
- 方針: 181件を単一pluginにせず、用途別の小さなpluginへ分ける。
- 完了条件: `.codex-plugin/plugin.json`、marketplace entry、install/test手順が現行Codex仕様を満たす。

## AI-SET-V1-06: profile適用と実セッション受入試験

- 状態: 後続
- 対象: add-only / dry-runのprofile適用command、新規Codexセッションでのskill発見、暗黙発火、意図した非発火、default prompt。
- 背景: 静的validatorと明示skill forward testは完了したが、候補ツリーのprofile JSONはCodex標準の有効化機構ではない。
- 完了条件: 空の候補先と既存PJの双方で差分・衝突・hash・manifestを検証し、適用後の新規Codexセッションで代表skillの発見とroutingを再現できる。

## AI-SET-V1-07: pj-general core stack補正

- 状態: 完了（2026-07-12）
- 対象: `database-migrations`、`tdd-workflow`、`security-review`
- 方針: PJ正本とpinned stackを優先し、version依存の具体例は現行一次資料確認とtopic別referenceへ分離する。
- 完了条件:
  - `database-migrations`をprogressive disclosure化し、PostgreSQL + Drizzleの採用済み導線、lock、backfill、recoveryを安全に扱う。
  - `tdd-workflow`の固定coverage率を廃止し、Vitest / Playwrightとrisk-based coverageへ変更する。
  - `security-review`へBetter Auth、組織scope、delegation、audit、現行OWASP確認導線を追加する。
- 完了証拠:
  - `database-migrations` 71行、`tdd-workflow` 106行、`security-review` 114行へprogressive disclosure化した。
  - PostgreSQL lock/runner、risk-based test、tenant/org/delegation/audit、OWASP一次資料、Codex Security routingを追加した。
  - 旧security本文とcloud文書は削除せず`ecc-legacy/`へ隔離し、active cloud guidanceを安全化した。
  - Terra highのstocktakeとforward testで検出したP1/P2/P3を修正し、対象coreにP0/P1がないことを確認した。

## AI-SET-V1-08: 改善優先度Aの完了

- 状態: 完了（2026-07-12）
- 正本: `agents-v1/skills-retention-review.csv`
- 集計: A 7件、B 25件、C 109件、D 48件。
- A完了: `api-design`、`backend-patterns`、`docs-state-sync`、`postgres-patterns`、`prp-create-plan`、`prp-implement-plan`、`security-review`。
- A残件: 0件。
- 完了条件: `postgres-patterns`を言語/framework固定の一般論から、PostgreSQL target version・query/workload・実測に基づくSQL/runtime設計skillへ変更し、validatorとforward testを通す。
- 完了証拠:
  - `postgres-patterns`を50行へ縮小し、schema/index、query/concurrency、runtime/diagnostics、legacy例をreferencesへ分離した。
  - 一律の型、index、pagination、Supabase RLS、`ALTER SYSTEM`推奨を廃止し、target version・query/workload・EXPLAIN実測・pool/RLS境界を必須にした。
  - Terra high独立forward reviewは100/100、P0-P3なし。
  - `skills-retention-review.csv`と`skills-classification.csv`でA 7件すべてを完了、A残件0として同期した。

## AI-SET-V1-09: 改善優先度Bの横断skill

- 状態: 後続backlog（今回対象外）
- 対象: `skills-retention-review.csv`の改善優先度B 25件。
- 方針: profile採択、使用頻度、blast radius、Claude/active resource warningの順で着手する。

## AI-SET-V1-10: 言語・framework専用skill

- 状態: 後順位
- 対象: 改善優先度D 48件。
- 方針: 母集団に保持し、対象言語・frameworkを採用したPJで必要になった時点で高品質化する。mutable action等の明確な危険例はbacklogに残すが、横断skillより先に一括改修しない。

## AI-SET-V1-11: Codex向けupstream候補の定期評価

- 状態: ユーザー評価予定（期限: 2026-07-18）
- 対象: `openai/plugins`、現行Codex docs、公開Codex対応skill collectionと個別skill。
- 方針: ECC mother setを唯一の改善元にせず、公式plugin構造を追随する。公開collectionは索引として使い、個別skillを隔離検証してから採択する。
- 初期候補: `yujiachen-y/codebase-recon-skill`、`hyhmrright/brooks-lint`、`chriscox/agent-skills`。
- 除外方針: 既存configの自動追記、secret/account snapshot、無承認の外部書込み、auto-fixを含むものは直接導入しない。
- 完了条件: 候補ごとに出所、ライセンス、更新時期、実行権限、重複、token cost、代表forward testを記録し、採択・保留・却下を決める。

## GMAIL-DAILY-01: 毎朝の Gmail タスク整理

- 状態: 作成提案済み。Codex の作成カードで確認・有効化待ち
- 正本: `docs/ops/gmail-daily-task-brief.md`
- 完了条件: 毎朝08:00（Asia/Tokyo）の初回実行結果を確認し、抽出基準を必要に応じて調整する。

## KV-SYNC-01: knowledge-vault 転記監査の初回検証

- 状態: 定期スケジュール作成後に初回実行を確認
- 正本: `docs/ops/knowledge-vault-sync-schedule.md`
- 完了条件: 対象PJを限定して走査し、転記対象なし・あり・保留のいずれも根拠付きで報告できる。
