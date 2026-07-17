# 完了記録

## 2026-07-17

- AI設定の中央Gitリポジトリ `G:\devwork\ai-settings` を新設し、`agents-v1` のskill母集団192件、profile、検証・同期command、registry、共通Codex設定候補を削除なしのコピーで初期集約した。新repoの `skills/` を同期正本に切り替え、`C:\Users\unibe\.codex\skills\` との `SKILL.md` hash一致192/192、同期manifestのsource、`Test-AgentSet.ps1`（error 0、既知warning 54件）を確認した。tool-set側の旧配置は利用者の精査が終わるまで残し、以後の正本昇格・統合・除外は `G:\devwork\ai-settings\docs\imp\imp-tasks.md` で管理する。

- CloudflareでのWeb公開を説明する日本語図解 `docs/candi-ref/cloudflare-web-publication-capability-diagram-2026-07-17.png` を追加した。要件を「配信・処理・保存・OS運用」に分け、Cloudflareのみで公開できる範囲、外部DB等と組み合わせる範囲、Workers / Pages単体では対象外の範囲を、判断点と責任範囲を含めて一枚に整理した。Workers公式の静的配信・API・SSR、D1 / KV / R2 / Durable Objects、CPU・メモリ・実行時間・料金枠の制約を確認して反映した。

## 2026-07-15

- `G:\devwork\pj-general\docs\imp\design-documentation-review-summary-2026-07-13.html` の「集計 → 比較表 → 行内の判断材料 → 読む順番」の構成を参照し、Cloudflare / AWSの役割把握用スタンドアロンHTML `docs/candi-ref/cloud-platform-knowledge-review-2026-07-15.html` を作成した。最優先の3役割、公式資料への入口、展開式の境界説明、ブラウザ内に保存する未読・読み中・読了状態を備える。
- 読みやすい知識提供HTMLの別案として、全体表と単一フォーカス欄を組み合わせる `knowledge-delivery-pattern-a-focus-matrix-2026-07-15.html` と、目的選択から必要な層だけを逆引きする `knowledge-delivery-pattern-b-question-navigator-2026-07-15.html` を `docs/candi-ref/` に追加した。
- B案を4セクション構成へ拡張し、選択した目的に連動して「目的 → 解決ルート → できること・単独ではできないこと・採用条件 → 15分・1時間・採用前の深掘り」を一続きで読めるようにした。
- B案のセクション3を31件の機能単位比較（Cloudflare / AWSの○・△・×と短文）へ再構成した。各短文からセクション4の対応詳細へ移動し、遷移先が1秒間緩く点滅する導線、機能ごとの役割・選び分け・確認手順・公式資料を追加した。
- `pj-general` のコンテキスト復帰運用を `tool-set` 用に採用した。`AGENTS.md` へ圧縮・セッション移動・handoff・要約復帰時の実体再読込、要約非正本、現行タスク補完を明記し、`docs/guide/implementation-context-reading-guide.md` で6作業役割の最小読込セットを定義した。`PROJECT.md`、README群、docs管理へ正本関係を同期し、復帰trigger、必須guide、task復元、6作業役割、リンク非再帰読込を確認した。

## 2026-07-16

- `knowledge-delivery-pattern-b-question-navigator-2026-07-15.html` を、単なる可否表から配置判断も読める形へ拡張した。冒頭に「Cloudflareを入口・edge、AWSをアプリ中核・正本に置く」代表形と、Cloudflare中心 / AWS中心 / 両者を組み合わせる3構成を追加し、必須構成ではないことと資料範囲を明記した。セクション3には関係列（補完しやすい、代替しやすい、AWS中核、Cloudflare中核、要件次第）を追加し、セクション4には機能ごとの推奨配置を追加した。既存の31機能行、詳細ジャンプ、1秒点滅、ローカル状態保存を維持し、NodeによるJavaScript構文検証、31行存在確認、必須UIマーカー確認、`git diff --check` を通した。ローカルfile URLの自動ブラウザ表示は実行環境ポリシーにより確認できなかった。

## 2026-07-17

- Cloudflare公開図のレビューで得た、矢印と配色の汎用図法を `G:\knowledge-vault\prompts\diagram-from-process-description.md` へ統合した。矢印を実際の情報・データ・リクエスト・設定・制御の受け渡しに限定し、照合・分類・判定とは混同しないこと、色相を登場人物・責任範囲、濃淡を同一主体内の階層に限定すること、状態は記号・文字・線種で表すことを追加した。候補台帳 `K-20260717-001` は `transferred` とし、保存先・日時を記録した。
- グローバルskill `C:\Users\unibe\.codex\skills\knowledge-explainer\` を作成した。知識解説を画像とスタンドアロンHTMLから選ぶ基準、ソース境界、矢印・配色の図法契約、画像生成時の指示項目、HTMLの構成・検証を収録し、`agents/openai.yaml`も追加した。公式validatorは同梱Pythonの`PyYAML`不足で起動できなかったため、frontmatter、UI設定、TODO残存、行数、skill名参照を静的検証した。候補台帳 `K-20260717-002` は、skill本文が再利用の正本であるためvaultへの重複記録を`skipped`とした。
- 利用者の指摘を受け、上記の一体skillを実行用の二つへ分割した。`knowledge-diagram-image` は一枚の図解画像と矢印・色相の図法を、`knowledge-explainer-html` は比較・段階的詳細・状態・HTML検証を担当する。`knowledge-explainer` は生成せず、出力形式が未指定の依頼を二つの専門skillへ振り分ける入口へ縮小した。3 skillのfrontmatter、TODO残存、行数を静的検証した。
- `agents-v1/.agents/skills/` を唯一の編集正本、`C:\Users\unibe\.codex\skills\` を全件同期する有効配置として採用した。知識解説の3 skillを母集団へ移管し、`agents-v1/skills-registry.csv` に作成・更新日時、作成・更新者、lifecycle、検証を記録した。`commands/Sync-AgentSkills.ps1` は母集団と同名のskillだけをコピーし、`.system`や母集団外のskillを削除せず、同期manifestへ日時・件数・hashを残す。`Test-AgentSet.ps1` は192 skill・error 0（warning 54）で通過し、同期後はsource 192件・manifest 192件・`SKILL.md`のhash差分0を確認した。
- `Sync-AgentSkills.ps1` の既存配備先へのcopyで、3 skillに同名の二重入れ子が生じる不具合を修正した。以後はskill directoryの中身を同期し、旧版が作った同名の入れ子だけを母集団側に存在しないことを確認してから除去する。再同期後、母集団192件と有効配置の`SKILL.md` hash差分0、二重入れ子0を確認した。

## 2026-07-10

- `G:\devwork\pj-general` の新PJ向け最小ルールセットを参照し、汎用ツールPJ用の `AGENTS.md`、`PROJECT.md`、`README.md`、`tech-stack.md`、docs構造、進行管理ファイルへ再構成した。
- 6時間ごとの knowledge-vault 転記監査について、対象判定、重複防止、PJ内完了通知、保留処理を `docs/ops/knowledge-vault-sync-schedule.md` に仕様化した。
- Codex ローカル定期実行 `knowledge-vault 転記監査（6時間ごと）`（ID: `knowledge-vault-6`）を登録した。

## 2026-07-11

- knowledge-vault 転記監査を実行した。対象11PJを確認し、新規転記は0件、既転記またはPJ固有のためスキップ10件、保存先判断待ちで保留1件（`ad-hoc-study` のローカルVLM実行基盤知見）とした。保留は同PJの `docs/imp/user-judge.md` に記録した。
- `G:\devwork` 直下の最近更新PJを再点検し、`obsidian-set` に不足していた `docs/imp/imp-comp.md` を追加してknowledge-vault転記監査の対象条件を満たした。`opencode` は外部OSSの作業ツリーのため対象外とした。

## 2026-07-12

- `agents-v1` のECC由来181 skillを保持したまま、Codex向け8 skillを追加して総数189件とした。
- 全skillのfrontmatterを`name`と`description`へ正規化し、元frontmatterを`agents-v1/skills-source-frontmatter.csv`へ保存した。欠けていた`skill-stocktake`の`name`も補正した。
- custom prompts廃止方針に合わせ、旧PRP commandと回答展開commandを`prp-create-prd`、`prp-create-plan`、`prp-implement-plan`、`expand-answer` skillへ移した。
- `verification-loop`、`knowledge-ops`、`skill-stocktake`をCodex / PowerShell / docs正本分離へ適応し、`docs-state-sync`、`monorepo-boundary-review`、`permission-modeling`、`oss-adoption-planning`を追加した。
- pj-general級profileをcore 30件と追加候補15件へ分け、初期skill一覧の概算を8,000文字未満へ抑えた。
- `Test-AgentSet.ps1`と`Export-AgentProfile.ps1`を追加し、構造検証error 0、profile書き出し30/30件、PowerShell/TOML/JSON構文正常を確認した。
- `PYTHONUTF8=1`、`PYTHONIOENCODING=utf-8`を指定し、公式`quick_validate.py`で189/189 skillのvalidを確認した。
- 第一改善バッチ時点で残る41件のClaude固有運用と22件の500行超skillを、削除せず次回修正優先度として`docs/candi-ref/ai-settings-audit-2026-07-12.md`へ記録した。
- pj-general coreの9 skillをCodex向けに再設計し、未知repo導入・repo監査・Codex surface監査、docs確認・候補探索、context計測・圧縮復帰、安全gateの役割境界を分離した。
- core 9件へ`agents/openai.yaml`と必要なreferenceを追加し、公式validator 9/9 valid、独自検証error 0を確認した。core初期一覧概算は7,195文字となった。
- Luna highで4系統のforward test、Terra highで独立stocktakeと修正後回帰監査を行い、旧Claude/Bash compaction hook、過広trigger、出力契約不足、Windows fallback不足を修正した。回帰監査は94/100、P0/P1なしだった。
- ECC由来`strategic-compact/suggest-compact.sh`は削除せず`agents-v1/ecc-legacy/`へ原文隔離した。残存warningはClaude固有32件と500行超22件である。
- core長大5 skillをprogressive disclosure化し、`coding-standards` 112行、`api-design` 127行、`backend-patterns` 72行、`frontend-patterns` 76行、`git-workflow` 82行へ縮小した。元の有用な詳細はtopic別`references/`へ保持した。
- Hono/BullMQ/Drizzle、Next.js App Router、RHF/Zod、shadcn/uiの条件付き導線、API/backendの契約handoff、dirty worktreeとremote URLを保護するGit運用を追加した。
- forward testで発見した`database-migrations`のPostgreSQL `ADD COLUMN` lock誤記とtransactional runner内`DO ... COMMIT`例を、PostgreSQL一次資料に基づき修正した。
- `Test-AgentSet.ps1`へactive resourceのClaude前提とprofile概算文字数の検証を追加した。第三バッチ時点の結果は189 skill、core 30、追加候補15、profile 7,237文字、metadata 26、500行超17、Claude本文32、active resource 5、error 0だった。
- 第三バッチは公式validator 6/6 valid、Terra high回帰監査100/100、P0-P3なしを確認した。
- `database-migrations`、`tdd-workflow`、`security-review`をprogressive disclosure化し、PostgreSQLのlock/runner、risk-based test、tenant/org/delegation/audit、OWASP一次資料、Codex Security routingを整備した。
- 旧security本文と旧cloud文書を削除せず`agents-v1/ecc-legacy/skills/security-review/`へ隔離し、active cloud guidanceをprovider/PJ正本・immutable pin・read-only review中心へ置換した。
- 改善優先度をA 7、B 25、C 109、D 48とし、言語・framework専用48件を後順位へ変更した。SQLは必要枠として維持した。
- A残件の`postgres-patterns`を50行へ再設計し、一律の型/index/pagination/RLS推奨を廃止して、target version・query/workload・EXPLAIN実測・pool/RLS境界を必須にした。Terra high独立reviewは100/100、P0-P3なしだった。
- スキル一覧2種へ`改善優先度`、`高品質化状態`、`高品質化コメント`を追加した。189件の同期差分0、完了29件、部分改善1件、コメント30件、A残件0を確認した。
- 全189 skillの公式validatorは189/189 valid。最終独自検証はprofile 7,221文字、metadata 29、dependency mutation 0、error 0だった。
- `docs/guide/new-project-bootstrap.md`を追加し、`G:\devwork\tool-set`と`agents-v1`を今後の新規PJ初期化・AI設定コピー元の正本として`PROJECT.md`と`README.md`へ反映した。
- 次回のAI設定群刷新について、profile適用の実セッション受入、作業別profile、優先度Bの横断skill、警告の意味別整理、plugin化とbootstrap実地改善の順序を`docs/candi-ref/next-ai-settings-refresh.md`へ記録した。
- knowledge-vaultへ今回の設定群改善を転記した。実施記録は`G:\knowledge-vault\records\2026-07-12-tool-set-codex-settings-v1.md`、再利用知識は`G:\knowledge-vault\knowledge\ai\codex-skill-mother-set-and-profile-operations.md`と`G:\knowledge-vault\knowledge\dev\new-project-ai-bootstrap-from-tool-set.md`を正本とする。
- Codex向けupstreamを再調査し、`openai/skills`がdeprecatedで、公式の現行exampleは`openai/plugins`であることを確認した。公開collectionは直接の正本にせず、隔離検証して採択する方針を`docs/candi-ref/codex-skill-upstream-survey-2026-07-12.md`とAI-SET-V1-11へ記録した。

## 2026-07-12 knowledge-vault 転記監査

- 対象12PJを確認し、新規転記2件、スキップ10件、保留0件とした。
- 転記先: `G:\knowledge-vault\knowledge\misskey\misskey-ops-index.md`（`io-bot-soul`）、`G:\knowledge-vault\knowledge\dev\self-built-intake-and-layered-pm-oss-selection.md`（`pj-general`）。
- 判定: `ad-hoc-study`のローカルVLM知見は既転記証跡あり。その他はPJ固有、単発ログ、または横断知見としての根拠不足のためスキップ。保存先不明による保留はなし。
- 実施日時: 2026-07-12 19:05:49 +09:00

## 2026-07-12 knowledge-vault 転記監査（ハートビート再監査）

- 対象12PJを再確認し、新規転記0件、スキップ12件、保留0件とした。
- 前回転記済みの`io-bot-soul` / `pj-general`はvaultと元PJの証跡が一致。後続の`pj-general` Thread Line TLロゴ選定はPJ固有のため転記対象外とした。
- 実施日時: 2026-07-12 19:22:55 +09:00

## 2026-07-13 knowledge-vault 転記監査（ハートビート再監査）

- 対象12PJを再確認し、新規転記0件、スキップ12件、保留0件とした。
- `pj-general`のThread Line画像、P0 UI受入、確認ダイアログ、observability fallbackは、PJ固有または既存の運用ガードと重複するため転記しなかった。前回転記済み2件の証跡も一致している。
- 実施日時: 2026-07-13 01:23:02 +09:00

## 2026-07-13 knowledge-vault 転記監査（ハートビート再監査）

- 対象12PJを再確認し、新規転記1件、スキップ11件、保留0件とした。
- 転記先: `G:\knowledge-vault\knowledge\dev\self-built-intake-and-layered-pm-oss-selection.md`（`pj-general` U02/U03、2項目）。
- `pj-general`のThread Line画像とUI受入項目はPJ固有または既存ガードとの重複としてスキップ。その他10PJは既転記、PJ固有、単発記録、または根拠不足のためスキップした。保存先不明による保留はなし。
- 実施日時: 2026-07-13 07:23:07 +09:00

## 2026-07-13 knowledge-vault 転記監査（ハートビート再監査）

- 対象12PJを再確認し、新規転記1件、スキップ11件、保留0件とした。
- 転記先: `G:\knowledge-vault\knowledge\dev\self-built-intake-and-layered-pm-oss-selection.md`（`pj-general` R04/R05のhash gate・安全停止・最終API確認を含む遠隔再配信ガード）。
- `pj-general` R06のTasks配色・テーマ変更はPJ固有としてスキップ。その他10PJは既転記、PJ固有、単発記録、重複、または根拠不足としてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-13 13:25:18 +09:00

## 2026-07-13 knowledge-vault 転記監査（ハートビート再監査）

- 対象12PJを再確認し、新規転記1件、スキップ11件、保留0件とした。
- 転記先: `G:\knowledge-vault\knowledge\dev\self-built-intake-and-layered-pm-oss-selection.md`（`pj-general`の配信状態・実機反映をP0定常受入ゲートにする運用原則）。
- `pj-general`のHub左レール・Tasksテーマ・導線はPJ固有としてスキップ。その他10PJは既転記、PJ固有、単発記録、重複、または根拠不足としてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-13 19:23:50 +09:00

## 2026-07-14 knowledge-vault 転記監査（ハートビート再監査）

- 対象12PJを再確認し、新規転記0件、スキップ12件、保留0件とした。
- `ad-hoc-study`のNeural Atlas、Afterimage / Zero、Experimental Game Quartet、CHROMA / SHIFTはPJ固有のデモ・ゲーム実装および単発公開記録としてスキップした。既転記済みのローカルVLM知見はvaultと元PJの証跡が一致している。
- `pj-general`の設計書化カバレッジ・最小読込境界は既存の設計書カバレッジノートと、コンテキスト圧迫の再調査は既存の自動圧縮復帰ノートと重複するためスキップした。UI・導線変更はPJ固有として扱った。その他9PJは新規未転記候補なし。保存先不明による保留なし。
- 実施日時: 2026-07-14 01:25:22 +09:00

## 2026-07-14 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記1件、スキップ12件、保留0件とした。
- 転記先: `G:\knowledge-vault\knowledge\ai\codex-skill-mother-set-and-profile-operations.md`（`harness-imp`のハーネス5層モデル、Profileとenforcementの分離、証拠・adapter・fail-closed原則）。
- `pj-general`のセッション境界再監査は既存の自動圧縮復帰ノートと重複し、`ad-hoc-study`のデモ・ゲームはPJ固有・単発のためスキップ。その他10PJは既転記、PJ固有、単発記録、重複、または新規未転記候補なしとしてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-14 07:26:39 +09:00

## 2026-07-14 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記1件、スキップ12件、保留0件とした。
- 転記先: `G:\knowledge-vault\knowledge\ai\codex-skill-mother-set-and-profile-operations.md`（`harness-imp`のportable report artifact分離、構造整合性照合、`structural_only`縮退検証）。
- `pj-general`のコンテキスト圧迫セッション境界再監査は既存の自動圧縮復帰知識と重複し、その他11PJは既転記、PJ固有、単発記録、重複、または新規未転記候補なしとしてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-14 13:28:09 +09:00

## 2026-07-14 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記0件、スキップ13件、保留0件とした。
- `harness-imp`のハーネス設計とportable report artifactは前回転記済みで、元PJの転記証跡とvault内容が一致している。`pj-general`を含むその他12PJは、既転記、PJ固有、単発記録、重複、または新規未転記候補なしとしてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-14 19:27:41 +09:00

## 2026-07-15 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記0件、スキップ13件、保留0件とした。
- 前回以降、対象PJの`docs/imp/imp-comp.md`に新規完了記録はなく、既存の転記証跡とvault内容も一致している。その他は既転記、PJ固有、単発記録、重複、または新規未転記候補なしとしてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-15 01:28:18 +09:00

## 2026-07-15 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記1件、スキップ12件、保留0件とした。
- 転記先: `G:\knowledge-vault\knowledge\ai\codex-skill-mother-set-and-profile-operations.md`（`harness-imp`のHarness Lab導入ゲート、declared/evidence分離、HTML視覚受入・状態隔離）。
- `pj-general`とその他11PJは既転記、PJ固有、単発記録、重複、または新規未転記候補なしとしてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-15 07:29:44 +09:00

## 2026-07-15 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記1件、スキップ12件、保留0件とした。
- 転記先: `G:\knowledge-vault\knowledge\dev\self-built-intake-and-layered-pm-oss-selection.md`（`pj-general`のWindows境界AI候補取込、accepted-only冪等化、4入口共通action / aspiration validator）。
- `harness-imp`は既転記、`pj-general`の配信・受入・context記録のうちPJ固有または既存知識と重複する部分、およびその他11PJはスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-15 13:33:11 +09:00

## 2026-07-15 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記0件、スキップ13件、保留0件とした。
- 前回転記した`pj-general`のWindows境界AI候補取込・4入口共通提案以降、新規の未転記完了項目はない。`harness-imp`を含むその他は既転記、PJ固有、単発記録、重複、または新規未転記候補なしとしてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-15 19:35:38 +09:00
## 2026-07-16 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記0件、スキップ13件、保留0件とした。
- `pj-general`の2026-07-15 P0受入星取表の現状再同期はPJ固有の進捗・受入状態の同期で、完了記録自身もknowledge-vault追記不要と判断している。`harness-imp`を含むその他12PJは既転記、PJ固有、単発記録、重複、または新規未転記候補なしとしてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-16 01:34:34 +09:00

## 2026-07-16 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記0件、スキップ13件、保留0件とした。
- `pj-general`の最新P0受入星取表再同期はPJ固有の進捗・受入状態で、完了記録によりknowledge-vault追記不要と明記されている。`harness-imp`は直近のHarness Lab・HTML視覚受入を既に転記済み。その他11PJも既転記、既存vaultのMisskey/PJ運用知識との重複、PJ固有・単発実装、または横断再利用候補なしとしてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-16 07:37:59 +09:00

## 2026-07-16 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記0件、スキップ13件、保留0件とした。
- 前回監査以降、対象PJの完了記録に新規更新はない。`pj-general`のP0受入星取表はPJ固有の進捗同期、`harness-imp`のHarness Lab・HTML視覚受入は既転記であり、その他11PJも既転記、既存vaultとの重複、PJ固有・単発実装、または横断再利用候補なしとしてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-16 13:38:00 +09:00

## 2026-07-16 knowledge-vault 転記監査（ハートビート再監査）

- 対象13PJを再確認し、新規転記0件、スキップ13件、保留0件とした。
- 前回監査以降、対象PJの完了記録に更新はない。`pj-general`のP0受入星取表はPJ固有の進捗同期で追記不要と明記され、`harness-imp`のHarness Lab・HTML視覚受入は既転記でvault側にも確認できた。その他11PJも既転記、既存vaultとの重複、PJ固有・単発実装、または横断再利用候補なしとしてスキップした。保存先不明による保留なし。
- 実施日時: 2026-07-16 19:38:12 +09:00

## 2026-07-16 直近5日間のknowledge-vault転記漏れ再監査（tool-set）

- 調査範囲: 2026-07-11 20:25:17〜2026-07-16 20:25:17の`tool-set`実ファイル更新、Git状態、`docs/imp/*`、既存`G:\knowledge-vault\knowledge`。除外対象を除く更新ファイルは308件で、主な大量更新は`agents-v1`のskill母集団だった。
- 転記済み確認: 2026-07-12のAI設定群v1・新規PJ bootstrapは、`G:\knowledge-vault\records\2026-07-12-tool-set-codex-settings-v1.md`、`knowledge\ai\codex-skill-mother-set-and-profile-operations.md`、`knowledge\dev\new-project-ai-bootstrap-from-tool-set.md`に反映済みで、`imp-comp.md`にも正本記録がある。
- 未転記候補: 2026-07-15〜16に完了したCloudflare/AWSの役割境界・選定軸と、全体把握から単一項目へ絞る知識提供パターンA/B。根拠ファイルは`docs/candi-ref/cloud-platform-knowledge-review-2026-07-15.html`、`knowledge-delivery-pattern-a-focus-matrix-2026-07-15.html`、`knowledge-delivery-pattern-b-question-navigator-2026-07-15.html`で、既存vault検索では該当テーマの正本・転記証跡を確認できなかった。
- 判定: 上記候補は横断再利用価値があるが、今回は調査依頼としてvault本体へは書き込まず、転記要否をユーザー判断待ちとした。コンテキスト復帰運用は既存vault知識と重複し、AI-SET-V1-11は未完了のユーザー評価予定のため転記対象外とした。
- 実施日時: 2026-07-16 20:25:17 +09:00

## 2026-07-16 PJ横断知識候補台帳・AGENTS同期基盤

- `docs/ops/knowledge-candidate-register-policy.md`を候補台帳の共通契約として追加した。
- 対象13PJの`AGENTS.md`へ共通契約への参照行を追加し、各PJの`docs/imp/knowledge-register.md`を入口として追加した。
- `docs/ops/pj-agents-sync-schedule.md`を追加し、6時間監査、差分検知、横断適用可否の分類、add-only反映、dry-run、検証、完了記録の手順を定義した。
- `docs/ops/knowledge-vault-sync-schedule.md`から候補台帳を監査トリガーとして参照するよう更新し、tool-setの`AGENTS.md`からAGENTS同期監査の正本を参照するよう更新した。
- 検証: 対象13PJの参照行13/13、候補台帳入口13/13、共通契約ファイル存在、`git diff --check`成功。
- 監査の実スケジュール登録や外部通知は行っていない。
- 実施日時: 2026-07-16 22:40:00 +09:00

## 2026-07-17 knowledge-vault 転記監査

- 対象13PJを確認し、新規転記1件、スキップ12件、保留0件とした。
- 転記先: `G:\knowledge-vault\knowledge\dev\docs-source-of-truth-update-rules.md`
- 対象: PJ内候補台帳を作業中の直接転記を避ける監査キューとして扱い、6時間監査の第一トリガー、状態遷移、AGENTS.mdの参照一行化、共通ルールのadd-only・dry-run同期を行う運用パターン。
- 13PJの`docs/imp/knowledge-register.md`は候補未登録の初期状態だったため、移行期間の補助入口として`imp-comp.md`の新規完了記録を確認した。上記は既存vaultに同一内容の転記証跡がなく、複数PJで再利用できるため転記した。
- その他12PJは、前回監査以降に新規の未転記完了項目がない、既転記、PJ固有・単発、または既存vaultとの重複のためスキップした。根拠不足・保存先不明による保留はない。
- 実施日時: 2026-07-17 01:39:20 +09:00

## 2026-07-17 knowledge-vault 転記監査（再監査）

- 対象13PJを再確認し、新規転記0件、スキップ13件、保留0件とした。
- 前回監査で転記した候補台帳・AGENTS同期運用は、元PJの証跡と既存vault内容が一致している。以降、13PJの候補台帳に`candidate`登録はなく、新規の未転記完了項目も確認できなかった。
- `tool-set`の完了記録にある前回監査の転記証跡は監査ログであり、新規候補として重複評価しなかった。その他12PJも既転記、PJ固有・単発、または既存vaultとの重複としてスキップした。根拠不足・保存先不明による保留はない。
- 実施日時: 2026-07-17 07:40:26 +09:00

## 2026-07-17 knowledge-vault転記・監査フローHTML

- `docs/ops/knowledge-vault-transfer-and-audit-flow.html`を追加し、候補台帳、対象限定、根拠・重複照合、判定ゲート、既存vaultへの追記、完了証跡、スキップ・保留、AGENTS同期監査を2つの図解と最小限の補足で整理した。
- 判断基準は複製せず、`knowledge-vault-sync-schedule.md`、`knowledge-candidate-register-policy.md`、`pj-agents-sync-schedule.md`、中央write policyを正本として参照する構成にした。
- `README.md`、`docs/README.md`、`knowledge-vault-sync-schedule.md`から全体図へ到達できるよう更新した。
- 検証: standalone HTMLをrender scriptで生成、本文fragmentのSVG 2件・候補台帳/証跡/AGENTS同期の主要ラベルを確認、`git diff --check`成功。
- 実施日時: 2026-07-17 08:45:00 +09:00

## 2026-07-17 図解生成プロンプトのvault保存

- `G:\knowledge-vault\prompts\diagram-from-process-description.md`を追加し、説明文から情報・成果物・判断・責任の流れを図解へ変換する、文脈非依存の再利用プロンプトを保存した。
- 既存の`G:\knowledge-vault\prompts\README.md`を索引として更新し、再利用プロンプトの保管先と用途を明記した。新しいvaultカテゴリは作成していない。
- 検証: プロンプト本文・索引を再読し、説明にない工程を補わないこと、構成を固定しないこと、secretを入力しないことを確認。`tool-set`の`git diff --check`も成功。
- 実施日時: 2026-07-17 08:44:35 +09:00

## 2026-07-17 knowledge-vault既存プロンプトの回収監査

- `G:\knowledge-vault`全102ファイル（Markdown 95件）を対象に、プロンプト・依頼文・指示文・定型化・テンプレートに関する語彙、見出し、`type: prompt`、コードブロック、`prompt`を含むファイル名を照合した。語彙候補は28ファイルだった。
- 原文例を確認できた新規PJ初期化依頼を`G:\knowledge-vault\prompts\new-project-ai-bootstrap.md`へ回収し、`prompts\README.md`から参照できるようにした。原文例の意図・置換箇所だけを補足し、本文は創作していない。
- `prompts\README.md`に候補台帳を追加した。図解化と新規PJ初期化を`済`、セッション開始時スコープ確定、4入口共通候補抽出、Harness Lab設計・受入開始を`未`として、根拠と次に具体化する条件を記載した。
- `未`の3件は、定型化の契機・必要要素は確認できたが、原文の依頼文または入力形式がないため、この監査ではプロンプト本文を作成していない。単発のOpenCode-Link依頼、AIセッション記録テンプレート、AGENTS.md参照断片、実行時compact overrideの説明は、再利用プロンプトの実体ではない、または既存記録と重複するため回収対象外とした。
- 検証: `prompts\README.md`の`済`2件・`未`3件、回収プロンプトの根拠・注意見出し、`tool-set`の`git diff --check`成功を確認。ユーザー判断待ちは発生していない。
- 実施日時: 2026-07-17 08:52:29 +09:00

## 2026-07-17 再利用プロンプトのObsidianプロパティ対応

- `G:\knowledge-vault\prompts\diagram-from-process-description.md`と`new-project-ai-bootstrap.md`へ、Raw Note Schema準拠のfrontmatterを追加した。
- 両ノートに`title`、`type: prompt`、`status`、`topic`、`source`、作成・更新日、`confidence`、`review_after`、`tags`を設定し、既存本文・リンク・コードブロックは変更していない。
- 検証: `type: prompt` 2件、bootstrapの根拠ファイル存在、`tool-set`の`git diff --check`成功を確認。ObsidianのDataview有効化済み設定により、以後はプロパティ検索・一覧の対象になる。
- 実施日時: 2026-07-17 12:52:23 +09:00

## 2026-07-17 3段階knowledge・prompt運用の実装

- 共通契約を、1) 各PJの作業中の最小候補メモ、2) 6時間監査の入口、3) vaultの実記録という3段階へ更新した。候補は`knowledge | prompt | undecided`で捕捉し、記事・promptの本文を作業中に書かない。
- `knowledge-vault-sync-schedule.md`を更新し、候補台帳を第一トリガー、直近`imp-comp.md`を記載漏れ検出だけの補助入口とした。knowledge記事とpromptに別の作成ゲートを設け、promptは実依頼文または復元可能な用途・入出力・制約がない限り作成しない。
- 13PJすべての`docs/imp/knowledge-register.md`へ共通の最小テンプレートを反映した。各PJの`AGENTS.md`は既存の共通契約参照を維持し、詳細ルールを重複させていない。
- `G:\knowledge-vault\templates\knowledge-note.md`と`templates\prompt.md`を追加し、中央write policyと`prompts\README.md`に作成契約を追記した。新規記事・promptはfrontmatter、根拠、注意、元PJの証跡を持つ。
- `knowledge-vault-transfer-and-audit-flow.html`へ3段階の役割分担とknowledge/prompt分岐を追加した。
- 検証: 対象13PJ、AGENTS参照13/13、仕分けテンプレート13/13、candidate状態テンプレート13/13、実候補0件、prompt未候補3件、記事・promptテンプレートのtype、HTMLの3段階・prompt分岐、`git diff --check`成功を確認。外部通知・実装コード変更は行っていない。
- 実施日時: 2026-07-17 13:05:16 +09:00

## 2026-07-17 作業中候補メモの証拠パケット化

- 第1段階の候補メモに、`事象`、`種別`、`仕分け`、`要約`、`根拠`、`確認範囲`、`きっかけ`、`状態`を1行ずつ残す契約を追加した。単なるメモではなく、監査が読む最小の根拠を再現する証拠パケットとして扱う。
- 記録トリガーを、判断・比較の確定、失敗復旧または検証ガード、検証済み成果、handoff、実依頼文または入出力・制約が揃うprompt候補に限定した。通常のファイル編集、単発ログ、根拠のない思いつきは記録しない。
- 監査の根拠範囲をP0直接根拠、P1補強根拠、P2 prompt固有根拠へ分離し、P0が未確定の作業中候補は`candidate`のまま維持する。生ログ・長い会話・無関係な変更一覧を根拠にしない。
- 13PJすべての候補台帳テンプレート、6時間監査仕様、AGENTS同期監査、全体フローHTMLを同じ契約へ更新した。
- 検証: 対象13PJで`事象`、仕分け、根拠、確認範囲、きっかけ、candidate状態を13/13確認。共通契約の記録トリガー・P0/P1/P2、監査の確認範囲、HTMLの証拠パケット説明、`git diff --check`成功を確認。
- 実施日時: 2026-07-17 13:10:08 +09:00

## 2026-07-17 knowledge-vault 転記監査

- 対象13PJを確認し、新規転記0件、スキップ12件、既転記確認1件、保留0件とした。
- `tool-set`の`K-20260717-001`は、`docs/imp/imp-comp.md`の「2026-07-17 図解生成プロンプトのvault保存」をP0根拠として確認し、`G:\knowledge-vault\prompts\diagram-from-process-description.md`と`prompts\README.md`の`済`項目に同一内容があるため、新規転記しなかった。候補台帳の転記証跡を実候補へ補正し、テンプレートから誤って混入した転記先・日時を除去した。
- その他12PJは`candidate`がなく、候補台帳が導入済みであるため`imp-comp.md`を直接転記の入口にせずスキップした。根拠不足、重複の疑い、保存先不明による保留はない。
- 実施日時: 2026-07-17 13:43:18 +09:00
