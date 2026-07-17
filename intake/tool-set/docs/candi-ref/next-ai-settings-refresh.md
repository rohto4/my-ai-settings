# AI設定群 次回刷新計画

作成日: 2026-07-12

## 目的

`agents-v1`を、母集団の保管とPJごとの採択を両立できるCodex向け設定群として保守する。今回の完了状態を起点に、改善優先度Aを再開するのではなく、実運用で意味のある順に受入試験、profile、横断skillの改善を進める。

この文書は次回の候補と順序を示す。個別作業の状態は`docs/imp/imp-tasks.md`を正本にする。

## 現在の基準線

- skill母集団: 189件。ECC由来181件は保持し、Codex向け8件を追加。
- pj-general級profile: core 30件、追加候補15件。初期一覧概算は7,221文字。
- 検証: 公式validator 189/189 valid、`Test-AgentSet.ps1`はerror 0。
- 優先度: A 7件は完了、B 25件、C 109件、D 48件。
- 高品質化: 完了29件、部分改善1件、未着手159件。
- 残る警告: 本文のClaude前提32件、active resourceのClaude前提5件、500行超17件。

数値と個別skillの正本は`agents-v1/skills-retention-review.csv`、`agents-v1/skills-classification.csv`、`docs/candi-ref/ai-settings-audit-2026-07-12.md`である。

## 次回の実施順序

### 0. Codex向けupstreamの継続調査

ECC由来mother setを唯一の改善元とせず、Codexの公式plugin exampleと公開skillを定期評価する。`openai/skills`はdeprecatedであり、現在の公式参照先は`openai/plugins`である。

- 公式仕様と`openai/plugins`を構造・plugin形式の追随元にする。
- 公開collectionは探索索引として扱い、個別skillを隔離検証する。
- 検証前の第三者skillをmother setまたはprofileへ直接混入させない。
- 採択時は出所、ライセンス、更新時期、依存、実行権限、既存skillとの差分を残す。

候補と採択gateの正本は`docs/candi-ref/codex-skill-upstream-survey-2026-07-12.md`である。

### 1. profile適用と実セッション受入

最優先は、静的検証と実際のCodex skill発見を混同しないこと。

- `Apply-AgentProfile.ps1`をadd-onlyかつdry-run先行で追加する。
- 空の候補先と既存PJの両方で、差分、衝突、hash、manifestを確認する。
- 新規Codexセッションで、代表skillの発見、暗黙発火、意図した非発火、default promptを確認する。
- Desktop/CLIの実行権限が不足する場合は、静的検証で代替完了にせず、受入試験を保留として記録する。

完了条件は、profileを適用した実セッションで、採択skillだけが期待どおり発見・routingされること。

### 2. 作業別profileの導入

母集団は削除せず、用途ごとに小さいprofileを追加する。

- discovery / PRD
- implementation
- AI quality / evaluation
- delivery / container
- security
- Python、PowerShell、SQLなどのスクリプト言語・SQL

各profileは初期一覧のcontext予算、重複、相互に矛盾する指示を検証する。compiled language専用skillとframework専用skillは、採用PJが生じるまでD優先度のまま保持する。

### 3. 優先度Bの横断skillを改善

対象25件は、次の順に着手する。

1. profileに採択されるskill
2. 高頻度で広い変更範囲を扱うskill
3. active resourceを含むClaude前提、破壊操作、外部書き込みを持つskill
4. version依存の具体例が本文に固定されているskill

各skillは、trigger、必要な事前確認、停止条件、出力契約、検証をactive本文に残し、詳細例と技術固有の手順を`references/`へ移す。機械的な`Claude`文字列置換は行わず、Claude自体を対象ドメインにするskillは用途を維持する。

### 4. 警告と長大skillを意味別に解消

- 本文32件とactive resource 5件は、実行経路ごとに確認する。安全なdomain記述、legacy隔離、実行不能な旧hookの除去を区別する。
- 500行超17件は、対象言語・frameworkが採用されたPJでのみprogressive disclosure化する。
- 最新性の影響が大きい内容は、固定した実装例ではなく、一次資料確認とtarget versionの確認を必須にする。

この段階ではwarning件数だけをKPIにしない。domain上必要な記述は意図的に残せる。

### 5. plugin化とbootstrap改善

skillのtriggerとprofileが実セッションで安定した後、用途別に小さなCodex pluginへ分割する。189件を1つのpluginへ詰めない。

`docs/guide/new-project-bootstrap.md`は、実PJで2～3回適用した結果をもとに更新する。初期prompt、コピー対象、PJ固有追記、差分確認、最初の受入試験が過不足なく機能するかを確認する。

## 継続検証

- 変更ごとに公式validatorと`Test-AgentSet.ps1`を実行する。
- profileの初期一覧概算は8,000文字未満を保つ。
- skillの外部URL、security guidance、Codex仕様は、改修時点の一次資料で再確認する。
- 大きな改善バッチは、独立stocktakeと代表シナリオのforward testを分け、静的構造だけで完了にしない。

## 今回は対象外

- 改善優先度Dの言語・framework専用48件の一括改修。
- 既存mother setの削除や縮小。
- 実セッションで未検証のprofile JSONをCodex標準の有効化機構として扱うこと。
