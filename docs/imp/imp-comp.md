# 完了記録

## AI-SET-RUNTIME-01: Codex Desktopのactive skillをprofile配備へ変更

- 完了日: 2026-07-24
- 原因: Codexへlocal 309件、system/pluginを含め約403件のskillを同時提示していたため、context予算の切り詰めで一部skillが候補から省略され、暗黙選択が不安定になっていた。profile画面の使用回数はlocal filesystem skillの暗黙利用を網羅する監査値としては扱わない。
- 構成: 正本 `G:\devwork\ai-settings\skills` の309件は維持し、日常配備用 `profiles/codex-desktop-default/profile.json` に60件を選定した。実行側は60件、退役249件となり、active 60件はすべて `agents/openai.yaml` を持つ。
- 同期: `Sync-AgentSkills.ps1` をprofile対応へ変更し、引数省略時も日常profileを使う。縮退対象は前回manifestに記録された管理skillだけとし、`.system`、plugin、manifest外skillを保持する。`-FullMotherSet` で309件へ復元できる。
- 検証: `Test-AgentSet.ps1` はskills 309、profile 60、error 0。模擬runtimeで60→309→60を実行し、完全復元、再縮退、`.system`保持、staging残骸0を確認した。初回本番同期はmanaged 309から249件を退役した。整形後の最終再同期manifestはmode `profile`、mother set 309、managed before 60、retired 0、active 60、source/destination tree hash不一致0、`.system`保持、staging残骸0である。
- 境界: hook、MCP、connector、secret、外部送信設定は変更していない。現在開いている長いtaskのskill catalogは再読込されないため、候補数削減と自動選択の実地確認は新規taskから行う。

## AI-SET-SKILL-07: Harness conformance・review customization skillの正本化

- 完了日: 2026-07-19
- 追加: `skills/original/project-harness-conformance`と`skills/original/harness-review-customization`を追加した。前者はProfile/policy/evidence/positive-negative caseをread-onlyで監査し、後者はHTMLから戻ったcomponent ID付きcommentをauthority変更だけ停止するscope限定customizationへ変換する。
- profile: `profiles/harness-engineering/profile.json`を新設し、既存の設計・権限・評価・HTML skillと2skillを狭いHarness用途へroutingした。`pj-general-large-web-product`の発見用集合は増やさず、母集団baselineだけ309へ更新した。
- 検証: 2skillは公式`quick_validate.py`をPJ内一時PyYAMLでpassし、UTF-8 JSON/Text正規化、44 JSON・5 scenario・13 caseのread-only構造検査をcandidateとruntime実体の双方でpassした。`Test-AgentSet.ps1`はHarness profileが17 + recommended 5・6,498文字、pj-general profileが30 + recommended 15・7,977文字、いずれもskills 309・errors 0。既存母集団由来のwarnings 24は維持した。
- 配布: `Sync-AgentSkills.ps1 -WhatIf`で309操作を確認後、正本309件をruntimeへ実同期した。manifestは`verification=full-tree-sha256`、skills 309、新規2skillはいずれも4ファイルでsource/destinationのtree hashが一致した。`project-harness-conformance`は`dcc573c7654c3b3d93d65d8a89766285b35a3ddbffd131d76b87e2bebcc99788`、`harness-review-customization`は`5d0b42c781617518480c252bee262b55742b1246f957bdf36ce882c4d56fc137`で、candidate / canonical / runtimeの3断面一致も独立確認した。
- 境界: hook、MCP、network、credential、外部write、OS/managed policyは追加していない。`harness-imp`の参照キットは正本skillへ複製せず、横断再利用できるworkflowとscriptだけを移した。既存dirty worktreeを保持し、この作業ではcommit/pushを行わない。

## AI-SET-OPS-01: skill追加・更新の短縮依頼を既定リリース化

- 完了日: 2026-07-18
- 運用: 「こういうskillがほしい、追加して」「$skillを更新して」は、正本更新、profile・secret検証、runtime同期、明示stage、commit・`origin/main`へのpush、readback、完了記録までを既定で含むよう`AGENTS.md`へ固定した。調査だけ、正本だけ、runtime非配布、commit/pushなしは明示的な留保として扱う。
- 安全境界: hook、plugin・依存の新規導入、認証情報、外部送信は既定リリースに含めず、対象と承認が明示された場合だけ扱う。`knowledge-register.md`は由来と採否が確定するまでstageしない。
- 利用入口: `README.md`に、そのまま使える短い依頼文と留保指定を追加した。

## AI-SET-RELEASE-01: 改修版skill集の本番配備と通常利用確認

- 完了日: 2026-07-18
- release: 意図した48ファイルだけを明示的にstageし、commit `543f11a feat: productionize Codex skill set`を`origin/main`へpushした。push後のreadbackで`HEAD`と`origin/main`は同じcommitを指し、working treeの差分は出所・採否未確定の未追跡`docs/imp/knowledge-register.md`だけである。これはstage・commitしていない。
- runtime: `C:\Users\unibe\.codex\skills`へ307 skillを完全同期済み。manifestは`skill_count=307`、`verification=full-tree-sha256`、source/destinationのfile count・tree hash不一致0、staging残骸0である。主要profile 45件の`SKILL.md`と`agents/openai.yaml`もsource/runtime SHA-256不一致0。
- 利用可能性: 通常skillは新しいCodexタスクで、descriptionに基づく自動選択または`$skill-name`による明示呼び出しで利用する。UI menu metadataは全307件中181件、主要profileは45件すべてにある。runtimeから選んだskillを使うHTML比較デモも別PJで作成し、配備済みskillがGドライブの編集正本に依存せず読めることを補助確認した。
- hook境界: 本番配備は通常skillの利用可能化を意味し、hookの自動登録・自動実行は含まない。`C:\Users\unibe\.codex\hooks.json`は既存のcompact復帰reminderのみを維持し、`ck`、`continuous-learning`、`continuous-learning-v2`のhookは未登録、`continuous-learning/config.json`は`enabled=false`のままである。これは未配備ではなく、event・保存内容・trustを別途明示承認してから有効化する安全境界である。
- 検証境界: `Test-AgentSet.ps1`はskills 307、core 30、recommended 15、discovery 7,977 / 8,000、errors 0、既存warnings 24。target監査はsource 968 / 968、target 358 / 358、`integrated=253`、`no_change_needed=105`、blocked 0。`git diff --check`、Node syntax、Python AST、runtime manifest readbackをpassした。公式`quick_validate.py`はbundled PythonにPyYAMLがないため実行せず、依存追加もしなかった。

## AI-SET-SKILL-06: profile主要skillのメニュー整備とruntime配布

- 完了日: 2026-07-18
- UI metadata: `pj-general-large-web-product`のcore 30件・recommended 15件を監査し、既存44件はdisplay name、25〜64文字のshort description、`$skill-name`入りdefault promptが整合していた。欠落していた`frontend-design`へ`agents/openai.yaml`を追加し、主要45件をすべてメニュー表示可能にした。全母集団では181 / 307件がUI metadataを持つ。
- 自動発火: メニュー情報はUI専用で、自動選択は`SKILL.md` frontmatterのdescriptionを使う境界を維持した。利用場面の記載がなかった`api-design`、`frontend-patterns`、`security-review`、`git-workflow`、`permission-modeling`、`prp-implement-plan`の6件だけを短文化しつつtriggerを追加した。
- context予算: 単純追記ではprofile discoveryが8,472 / 8,000文字になったため不採用とし、重複語を削って7,977 / 8,000文字へ戻した。profile validationはskills 307、core 30、recommended 15、errors 0、既存warnings 24。
- 配布: `Sync-AgentSkills.ps1 -WhatIf`で307操作を確認後、Gドライブ正本の全307skillを`C:\Users\unibe\.codex\skills`へ同期した。同名skillは完全置換し、`.system`は保持した。母集団外skillは現時点で0件だった。
- readback: manifestは`verification=full-tree-sha256`、skills 307、source/destination file count・tree hash不一致0、staging残骸0。profile 45件の`SKILL.md`と`agents/openai.yaml`はsource/runtime SHA-256不一致0。
- validator境界: `skill-creator`の`quick_validate.py`はbundled PythonにPyYAMLがなく起動できなかった。依存を追加せず、repo validator、45件のmetadata専用監査、runtime hash readback、`git diff --check`を検証境界とした。

## AI-SET-SKILL-05: blocker 4件のCodexネイティブ化

- 完了日: 2026-07-18
- 仕様根拠: 現行Codexの公式hook仕様で`SessionStart`、`Stop`、`PreToolUse`、`PostToolUse`、`PreCompact`、`PostCompact`とdocumented input/outputを確認した。transcriptのfile formatはstable contractではないため解析対象にせず、`hooks.json` / `commandWindows` / trust / `hookSpecificOutput.additionalContext`へ合わせた。
- `ck`: repo docsを正本とするproject-scoped handoffへ変更し、documented `SessionStart` hookだけを利用する。日本語だけのproject名はpath hash由来の安全なslugへfallbackし、PowerShell 5.1のUTF-8 pipe手順を追加した。register、resume context、明示確認付きforget、日本語保持を一時`CODEX_HOME`で確認した。
- `configure-ecc`: 旧upstream installerを廃止し、このrepoのinventory、profile validation、空directory export、明示的runtime syncを案内するskillへ変更した。profileは選択・export用で、runtime syncは307件の母集団全体であることを明記した。`mother_set_baseline`を307へ更新し、validatorで将来の不一致をerrorにした。
- `continuous-learning`: transcript自動解析とskill自動生成を廃止し、既定OFFのStop候補captureとhuman reviewへ変更した。documented fieldsだけを読み、再帰Stopを抑止し、message hashはraw本文でなくredaction後の保存本文から生成する。既定OFF、明示ON、redaction、hash、malformed inputを一時`CODEX_HOME`で確認した。
- `continuous-learning-v2`: Pre/Post tool hookをpayload非保存のmetadata観測へ変更した。session/turn/tool-use IDはhash参照、project root/remote/full cwdは保存せず、sensitive key名も伏せる。invalid configはfail-closed、Node hookとPython registryはWindowsを含むexclusive lockとatomic JSON replacementを使う。24並行hook、12並行CLI、payload/secret/path非保持を確認した。
- 配備command: `Sync-AgentSkills.ps1`は同名runtime directoryへのoverlay copyをやめ、staging tree検証、旧directory退避、完全置換、source/destination file count・tree SHA-256照合へ変更した。母集団外skillと`.system`は変更しない。一時runtimeで旧resourceが消えること、manifest照合一致を確認し、実runtimeへは307件の`-WhatIf`だけを実行した。
- target結果: 旧完了記録`AI-SET-SKILL-04`のblocked 4件はhistorical snapshotとして残す。現行進捗はsource 968 / 968、manual review 0、target 358 / 358、`integrated=253`、`no_change_needed=105`、blocked 0である。
- 検証: 4skillのNode syntax、Python AST、target legacy表現scan、`git diff --check`がpassした。`Test-AgentSet.ps1`はskills 307、profile 30、recommended 15、discovery 7,950 / 8,000、errors 0、既存warning 24。target監査はsource 968、target 358、local target 294、installed plugin target 7で整合した。
- validator境界: 公式`quick_validate.py`はbundled PythonにPyYAMLがなく、同梱pytestもpytest未導入のため実行できなかった。依存を追加せず、repo validator、構文検査、独立forward test、実runtime相当の一時directory testを完了証拠とした。
- 配布: Gドライブ正本だけを更新した。ユーザーから即時配布の指定はないため、`C:\Users\unibe\.codex\skills`への実同期は行っていない。

## AI-SET-SKILL-04: 上流skill全件の推奨処理を一括適用

- 完了日: 2026-07-17
- baseline: 大編集前の正本はcommit `7d2a7a0`。reviewで確定済みの判断をsource mappingとdestination統合の二相に分け、統合元を先に確定してから統合先を一度だけ編集した。
- source phase: 968 / 968件を完了し、manual review 0、旧正本選定待ち9件は同一sourceのaliasへ解消した。読む順レビュー上の継続候補149件というsource単位の分類は114 Codex私用版 + 35 installed plugin skillのままである。
- destination phase: 358 targetを判定し、`integrated=249`、`no_change_needed=105`、`blocked=4`とした。内訳はECC 180 target、Codex私用版114 target、plugin判断64 target。pluginは導入済み7 bundleだけを利用し、具体需要のない57 bundleは本文を複製・導入せず台帳へ判断を残した。
- Codex適応: 114件すべてに`SKILL.md`、`agents/openai.yaml`、`LICENSE.txt`、直接linkした`references/upstream-domain-guide.md`を配置した。domain手順・例・上流resourceを保持しつつ、Codex / Windows / read-only既定 / 外部作用の承認境界へ編集した。
- blocker: `ck`はsession-start hook入力とruntime storage、`configure-ecc`はrepo正本と旧Claude installerの配布契約、`continuous-learning`はStop hookとtranscript schema、`continuous-learning-v2`はsession hook・observer入力・永続storageがCodex側で未定義である。推測で移植せず、4件だけ理由付きblockedとして残した。
- registry: `skills-registry.csv` 118行、`skill-lineage.csv` 307行、`plugin-skill-adoptions.csv` 520行。各台帳に重複0、plugin license空欄0。active skillは307件となった。
- 検証: target監査はsource 968、target 358、local skill target 294、installed plugin target 7で整合。全体`Test-AgentSet.ps1`はskills 307、errors 0。pj-general profileはcore 30、recommended 15、発見用metadata 7,950 / 8,000文字、errors 0。新規Node command 5件は構文error 0、SKILL TODO 0、diff whitespace error 0。認証情報patternの3ファイルは同一の`risk-...` source IDを`sk-` tokenと誤認したfalse positiveで、secretではない。
- validator境界: 公式`quick_validate.py`はbundled PythonにPyYAMLがなく起動できなかった。依存を勝手に導入せず、repo validator、target自己監査、registry監査、参照/resource監査を完了証拠とした。
- artifact: `docs/imp/upstream-skill-bulk-edit-progress.json`を進捗正本、`docs/imp/upstream-skill-bulk-edit-progress-2026-07-17.html`を閲覧用とし、handoff policy/candidates、4つのtarget result manifest、生成・更新・最終監査commandを保存した。
- 配布: Gドライブの正本だけを更新し、`C:\Users\unibe\.codex\skills`へは同期していない。

## AI-SET-REVIEW-11: overviewのrisk説明帯削除と正本選定待ちfilter

- 完了日: 2026-07-17
- overview: 「riskは別軸」から始まるP0〜P3の説明帯を削除し、余ったgrid areaも除去した。行ごとのrisk値、risk列、risk filter、summary内のP0〜P3集計データは維持した。
- filter: おすすめ適用後エリアへ「正本選定待ちだけ表示（9件）」toggleを追加した。先読み表と全968件表の非該当行を隠し、全件表の表示件数へ反映する。再clickまたは一覧の「解除」で元に戻る。
- 既存操作: 継続利用以外のgray-out、列filter、cell filter、tag filter、sort、読書状態を維持した。選定待ちtoggleは既存filterとAND条件で併用できる。
- 検証: 監査/CSV/HTML行968、正本選定待ち9件、toggle 1、絞り込み条件1、overview risk説明帯0、risk説明文0、埋込JavaScript構文pass、generatorの`node --check` pass。

## AI-SET-SKILL-03: knowledge-html-styleの空間効率規則

- 完了日: 2026-07-17
- 正本運用: `AGENTS.md`へ、最新版は常に`G:\devwork\ai-settings`に置き、Cドライブへは即時利用または明示配布時だけ同期する規則を追加した。READMEにも入口を置き、既存の「skill変更後は必ず同期」という表現を条件付き同期へ補正した。
- density pass: `knowledge-html-style`へ、情報を削る前に余白・大きすぎる文字・冗長wrapperを削る、viewportを面積予算として扱う、短い兄弟群をwide画面で並列化する、同格列を同幅にする、短いcellだけfixed layoutにする、可読限界でresponsiveに戻す、という判断順を追加した。
- canonical CSS: compactな1行title、`review-summary-split`、4列既定の`review-metric-grid`、3列既定の`review-guidance-grid`、compact unit、`review-equal-peer-table`とkey/total/peerのcol幅、1250px/800pxのresponsive fallbackを追加した。
- metadata: description、`agents/openai.yaml`、`skills-registry.csv`を空間効率まで含む内容へ更新した。SKILL本文は58行で、詳細なCSSはassetへ分離した。
- 検証: `Test-AgentSet.ps1`はskills 193、profile 30、recommended 15、error 0。CSS brace 63/63、density rule、4 utility、受入済みreview HTMLの50/50・4列・3列・同格26%・埋込JavaScriptをすべて確認し、`git diff --check`もpassした。公式`quick_validate.py`はbundled PythonにPyYAMLがなく実行不可だった。
- forward test境界: 既存subagent 2件へ汚染なしの新規HTMLを渡したが、いずれも成果物生成前に長時間停止したため中断し、fixtureは削除した。未完のforward testを成功扱いせず、受入済み実artifactの回帰検証を完了根拠とした。
- 配布: 今回は即時利用依頼ではないためCドライブへ同期していない。source/runtimeのSKILL SHA-256不一致を確認し、Gドライブ正本だけが新しい状態を維持した。

## AI-SET-REVIEW-10: overviewの左右圧縮layout

- 完了日: 2026-07-17
- layout: 全体概要を左右50%のgridにし、4つのmetricを左半分の4列、3つの手順を右半分の3列へ配置した。集計table、gray-out操作、risk帯は全幅のまま維持した。
- 列幅: おすすめ適用後tableをfixed layoutにし、読む順10%、全体12%、継続利用／実質廃止／正本選定待ちを各26%へ統一した。
- responsive: 1250px以下はmetricと手順を上下へ戻し、800px以下はmetric 2列、手順1列とした。
- 変更境界: section、文言、件数、table列、gray-out、filter、sort、読書状態、paletteを変更していない。
- 検証: 50% overview grid 1、metric 4列rule 1、手順3列rule 1、状態3列同幅rule 1、監査行968、埋込JavaScript構文pass、`node --check` pass。

## AI-SET-REVIEW-09: overviewの不要項目削除

- 完了日: 2026-07-17
- 変更: 全体概要のmetricから「読む順 S」カードを削除し、おすすめ適用後tableから「グレーアウト対象」列を削除した。
- 保持: ランク別の全体／継続利用／実質廃止／正本選定待ち、gray-out buttonと対象819件の注記、先読み27件、全968件、filter、sort、読書状態、既存styleを維持した。
- 検証: overview「読む順 S」metric 0、グレーアウト対象列0、集計table 5列、集計行5、監査行968、埋込JavaScript構文pass、`node --check` pass。

## AI-SET-REVIEW-08: おすすめ適用後の継続・実質廃止集計

- 完了日: 2026-07-17
- 分類: `candidate_for_adaptation`と`use_installed_plugin`を継続利用、`compare_duplicate_sources`を正本選定待ち、残りを実質廃止とした。これは上流監査行を独立skillとして残すかの分類で、実ファイルの削除ではない。
- 集計: Sは全27／継続10／実質廃止17／選定待ち0、Aは58／12／44／2、Bは141／94／41／6、Cは742／33／708／1。合計は968／149／810／9で、gray-out対象は実質廃止と選定待ちの819件。
- 表示: 全体概要へランク別のcompact tableと定義注記を追加した。CSVへ`adoption_disposition`と日本語列、summary JSONへ全体・ランク別集計を追加した。
- 操作: 「継続利用以外をグレーアウト」buttonで、先に読む27件と全968件の`retire`／`select`行だけをgray-outする。再押下で解除し、既存filter、sort、読書状態は変更しない。
- style: 既存のdark navy/teal、強い罫線、低角丸、高密度tableを維持し、継続・廃止・選定待ちをgreen/red/yellowで区別した。gray-out行はhover時に可読性を戻す。
- 検証: 監査/CSV/HTML行968、3状態分類968、ランク別合計不一致0、先読み込み属性995、継続属性159、実質廃止属性827、選定待ち属性9、集計行5、button 1、sortable header 11、埋込JavaScript構文pass、`node --check`と`git diff --check` pass。読み取り専用subagentによる定義・全968行・button影響範囲の独立確認も問題0。

## AI-SET-REVIEW-07: header・概要案内・読書状態の補正

- 完了日: 2026-07-17
- header: titleを「上流skill全件 読む順レビュー」の1行にし、`BIZ UDPGothic`、最大1.55rem、太さ700へ変更した。既存のdark high-contrast themeとtable書式は維持した。
- overview: section titleを汎用的な「全体概要」へ変更した。3番目の案内は1行目「改善要約を読む」、2行目「調整をする場合コメントを入力」へ変更した。
- 読書状態: 先に読む27件のskill列直前へ「未読／検討中／読了」toggleを追加した。同じskillの先読み行と全件行は同じlocalStorage keyを使い、一方の操作を両方へ即時反映する。
- 変更境界: 母集団968件、評価値、使用場面／効果、列filter、cell filter、sort、Markdown previewを変更していない。
- 検証: 監査/CSV/HTML行968、先読み27、読書状態button 995、先読みbutton 27、先読みheader 11列、title内改行0、旧「検討済」状態名0、overview/案内文各1、sortable header 11、埋込JavaScript構文pass。

## AI-SET-REVIEW-06: 使用場面／効果の2段表示

- 完了日: 2026-07-17
- 列: 先読み27件と全968件の列名を「使用場面／効果」へ変更した。1行目は既存の日本語使用場面、2行目は`効果:`として、品質向上、risk低減、手戻り削減、判断・復旧高速化などの期待効果を表示する。
- 生成: 主要skillは個別効果を定義し、残りはsecurity、review、test、debug、deploy、research、plan、design、migration、docs、monitor、setup、build、operationと属性から日本語効果を生成する。CSVへ`effect_summary`を追加し、Markdown previewにも使用場面と効果を併記した。
- 変更境界: 列位置と390px幅を維持し、2つの行を個別ellipsis表示にした。section、filter、sort、読書状態、既存anchor、Markdown preview linkは維持した。
- 検証: 使用場面968、効果968、日本語不足・空欄各0、効果最大27文字。usage cell 995、effect line 995、preview 968、header 12列一致、sortable header 11、埋込JavaScript構文pass。

## AI-SET-REVIEW-05: 使用場面の日本語化

- 完了日: 2026-07-17
- 表示: 読む順Sの主要skillは個別の自然な日本語へ置換し、残りはskill名の技術語を保ちながら、設計・検証・調査・運用・導入などの用途別に「〜するとき」の日本語短文を生成するよう変更した。
- 保持: 英語frontmatter descriptionはcell titleと根拠/詳細に残し、列位置、1行ellipsis、使用場面sort、section、style、filter、読書状態、Markdown previewを変更していない。
- 検証: 全968件の使用場面に日本語を確認し、空欄0、最大61文字。先読み27件と全968件のusage cell 995、preview 968、raw SKILL.md link 0、title/filter header 12列一致、sortable header 11、埋込JavaScript構文pass。

## AI-SET-REVIEW-04: SKILL Markdownプレビューと使用場面列

- 完了日: 2026-07-17
- Markdown preview: 全968件の原文SKILL.mdを安全にescapeして、見出し、list、code block、table、linkを整形するlocal HTMLを `runtime/skill-previews/2026-07-17/` に生成した。skill名linkはraw `.md` ではなくこのpreviewを別タブで開き、previewからreview該当行・原文・固定commitへ戻れる。
- 配備境界: Codexでlocal `.md` をnative previewへ渡す公開schemeは確認できなかったため、server不要でCodex内ブラウザが既に表示できるlocal HTMLを採用した。preview 968ファイル・13,534,417 bytesはruntime派生物としてGit管理外にし、監査commandで再生成する。
- 使用場面列: frontmatter descriptionの`Use when` / `Load when`等を優先して最大141文字へ短文化し、先に読む27件と全968件のskill列直後へ1行・ellipsis表示で追加した。full descriptionはcell titleと詳細内に保持した。
- 既存機能: section、dark high-contrast style、読書状態、列filter、cell click filter、tag filterを維持し、使用場面を11個目のsort対象にした。全件表のtitle/filter headerは12列で一致する。
- 検証: 監査/CSV/HTML行968、usage summary 968、usage cell 995、unique preview 968、欠落・不正preview 0、raw SKILL.md link 0、preview link 995、sortable header 11、column filter 11、click filter 7,744、埋込JavaScript構文pass、generator `node --check` pass、`git diff --check` pass。preview内のcode blockは678件、tableは419件で整形を確認した。

## AI-SET-SKILL-02: HTML構造skillと好みのstyle skillの分離

- 完了日: 2026-07-17
- 責務分離: `knowledge-explainer-html`を情報構造・interaction専用へ変更し、`knowledge-html-style`を高contrast・高密度review-tableのvisual専用skillとして新設した。style単独ではsection、文言、data、挙動を変更しない。
- 順序制御: `knowledge-explainer`を司令塔とし、新規HTMLと構造＋style変更では`knowledge-explainer-html` → `knowledge-html-style`の順に適用する。構造だけ、既存HTMLのstyleだけでは該当skillだけを使う。構造skillにも新規作成時のstyle後続契約を置き、直接発火時の抜けを防いだ。
- style正本: `knowledge-html-style/assets/dense-review-theme.css`へ、上流skill全件reviewで確立した濃紺/青緑、白本文、黄link、強い罫線、低角丸、shadowなし、13/12/11pxの文字密度、列filter、active/focus/完了状態を固定した。
- metadata/台帳: 3skillの`agents/openai.yaml`と`skills-registry.csv`、`skill-lineage.csv`を更新した。active母集団は193件、originalは4件。
- 独立test: structure-onlyはstyle token 0のままoverview、独立列、header直下filter、sort、cell filter、detailsを生成した。style-onlyは入力の文言、section順、data、anchor、JavaScript一致を保ち、classとcanonical CSSだけを追加した。順次適用成果物はcanonical CSS、review class、overview/comparison/details、anchor、JavaScript構文、外部assetなしを確認した。
- 検証: `Test-AgentSet.ps1 -ProfilePath`はskills 193、profile 30、recommended 15、error 0。公式`quick_validate.py`は実行PythonにPyYAMLがなく起動不可だったため依存を追加せず、repo validatorとforward-testを完了証拠とした。
- 配備: `Sync-AgentSkills.ps1 -WhatIf`後に193件を`C:\Users\unibe\.codex\skills`へ同期した。3skillのSKILL/metadata/style assetはsource/destination SHA-256不一致0、manifest skill_count 193。

## AI-SET-REVIEW-03: 列対応フィルターとコントラスト改善

- 完了日: 2026-07-17
- 変更境界: セクション構成、掲載内容、読む流れは維持し、表の列、filter操作、配色だけを変更した。
- 列: 先に読むS全27件表も、重要度・頻度・難易度を独立列へ変更した。全件表と合わせて独立評価cellは2,985件、旧結合ラベルは0件。
- 列filter: 全件表の独立filter帯を廃止し、table headerの2段目へ読書状態、読む順、検索/source、重要度、頻度、難易度、属性、扱い、risk、解除を対応配置した。column filter controlは11件、旧filter帯は0件。
- click filter: 読む順、source、重要度、頻度、難易度、属性、扱い、riskの値をbutton化した。同じ値の再clickで解除し、header filterと選択状態を同期する。対象buttonは全968行で7,744件。
- contrast: panel背景をさらに暗くし、本文を白、link/詳細入口を反対色の黄、補助文字を明るい青灰へ変更した。contrast比は本文16.58、link 11.95、補助文字11.43、表見出し8.75、control 18.57。
- 自動検証: 生成/CSV/HTML行968、sortable header 10、tag filter 3,231、column filter row 1、fragment欠落0、埋込JavaScript構文pass。
- browser確認: 開いているlocal HTML tabの再読み込みはBrowserの`file://` URL policyで拒否された。別surfaceや迂回手段は使わず、ユーザー側の再読み込みを目視確認境界とした。

## AI-SET-REVIEW-02: 全件表の高密度化と列ソート

- 完了日: 2026-07-17
- 変更境界: 既存セクション、掲載内容、読む流れは維持し、全968件表の列構造、操作、CSS書式だけを変更した。
- 表列: 行内で重複していた「重要度 / 頻度 / 難易度」ラベルを廃止し、3指標を非改行の独立列にした。risk/tagと根拠・詳細も別列とし、表は横スクロール可能な最小幅1,900pxにした。
- sort: 読書状態、読む順、skill/source、重要度、頻度、難易度、属性、扱い、改善要約、risk/tagの10見出しをクリックして昇順・降順を切り替えられるようにした。読む順は初期状態を降順とした。
- 表示: 既存の設計書化review表を参照し、dark navy/teal、罫線中心、低角丸、shadowなし、小さい文字と余白の高密度CSSへ変更した。検討済みの強いgray-out、filter、tag絞り込み、localStorage状態は維持した。
- 自動検証: 生成行968、独立評価cell 2,904、risk/tag cell 968、詳細cell 968、sortable header 10、旧結合ラベル0、fragment欠落0、埋込JavaScript構文pass。

## AI-SET-REVIEW-01: 上流skill全件レビューの読む順評価

- 完了日: 2026-07-17
- 読む順評価: 全968件へ重要度・難易度・使用頻度、属性（成果品質 / 手順・運用 / 言語・FW専用 / その他・専門）、読む順S/A/B/Cを付与した。ECC既存評価181件、active対応評価18件を引き継ぎ、残る769件は静的推定とした。使用頻度は実測起動回数ではない。
- 集計: 読む順S 27件、A 58件、B 141件、C 742件。先に読む入口はS全27件をそのまま表示し、S件数の変化へ自動追従する。P0～P3は読む価値から分離し、riskとして残した。
- HTML: 3指標・属性・扱い・risk・sourceのfilter、クリック絞り込みtag、local SKILL.mdリンク、読書状態を実装した。検討済みは強いgray-outへ変更し、旧fit表示は削除した。
- 改善要約: 表示する提案を最大78文字へ短文化し、詳細提案は展開内へ移した。`hookify-rules`は68文字で、詳細412文字の17%になった。
- tag: MIT、再配布不可/license要確認、Claude前提、Codex前提、250行未満、250行以上、500行以上、検証手順あり/なしを意味説明付きbuttonにした。tag filter buttonは3,231件。
- 自動検証: 期待/生成/ID/CSV再読/HTML行/評価完備は各968件、local source欠落0、local SKILL.md link 988、fragment欠落0、埋込JavaScript構文pass、短文90文字超0。
- ブラウザ確認: Codex内ブラウザの自動操作はlocal `file://` URL policyで拒否された。HTMLからlocal SKILL.mdへのlink生成は静的検証済みだが、Codex native Markdown previewとしての表示は未確認であり、専用schemeは使用していない。

## AI-SET-REPO-02: 高評価な上流skillの隔離配置・来歴整備・全件改善レビュー

- 完了日: 2026-07-17
- 構成: active 192件を `skills/ecc/` 189件、`skills/codex/` 0件、`skills/original/` 3件へ分類した。実行時は `C:\Users\unibe\.codex\skills\<skill-name>\` のflat配置を維持する。
- 上流隔離: `affaan-m/everything-claude-code`、`obra/superpowers`、`addyosmani/agent-skills`、非推奨の`openai/skills`、現行の`openai/plugins`をGit管理外の`upstream/`へcloneした。固定commit、license境界、監査単位は `registry/upstreams.csv` に記録した。
- 来歴: active 192件を `registry/skill-lineage.csv` へ記録した。ECC取込時のcommitは不明のため推測で補完せず、現在の比較commitと分離した。
- 初回登録: root commit `c5e8e7a`（`chore: establish AI settings source of truth`）を `https://github.com/rohto4/my-ai-settings.git` の `main` へpushした。
- 全件監査: canonical ECC 278件、Superpowers 14件、Addy 24件、OpenAI Skills 44件、OpenAI Plugins 608件、合計968件をfile-levelで監査した。P0 105、P1 605、P2 246、P3 12。licenseはpermissive 861、restricted 94、conditional 11、unknown 2。
- 改善提案: `docs/review/upstream-skill-improvement-proposals-2026-07-17.html` とCSVへ、全968件の証拠、active重複、上流間重複、扱い、私用改善案を記録した。HTMLはfilter、詳細展開、未読/検討中/検討済のlocal stateを持つ。
- 自動検証: 期待968件、生成968件、ID一意968件、CSV再読968件、HTML行968件、fragment欠落0、埋込JavaScript構文pass。`Test-AgentSet.ps1` はactive 192件、profile 30件、recommended 15件、error 0。配備manifestとsource/destination hash不一致0。
- ブラウザ確認: Codex内ブラウザへの `file:///G:/devwork/ai-settings/...` 自動遷移はbrowser URL policyで拒否されたため、visual checkは未実施。別surfaceで回避せず、静的HTML/JavaScript検証結果だけを完了証拠とした。
- 採用境界: 上流本文はまだ `skills/codex/` へ導入していない。restricted/unknown licenseはコピーしない。OpenAI Pluginsはskill単体でなくplugin bundleとして扱う。
