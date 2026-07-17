# 上流skill引継ぎ運用規則

## 目的と適用範囲

この規則は、`docs/review/upstream-skill-improvement-proposals-2026-07-17.csv` の968 sourceを、統合先skill、Codex採用候補、plugin判断、参照記録、除外記録、正本選定へ漏れなく引き継ぐための実行契約である。review HTML/CSVで確定済みの `recommendation` はmapping中に再審議しない。不整合はrecommendationを書き換えず `manual_review` として止める。

source単位の引継ぎ完了とdestination単位の統合完了を分離する。sourceが完了してもdestinationはfinalではない。物理的に同じ `registry/plugin-skill-adoptions.csv` を使う場合も、dependency keyは `plugin:<name>:<version-or-candidate>` のようにplugin単位で分ける。

## 状態と必須記録

各sourceは、progress JSONまたはその後継schemaに次を機械判定できる形で持つ。

- `source_id`、固定済み `recommendation`、source path/URL、repository commit、license判断
- `handoff_target_key` と物理 `target_path`。active destinationがない場合も `reference:*`、`fixture:*`、`selection:*` のdecision nodeを割り当てる
- `retained_elements`: targetへ残すbehavior、境界、安全条件、検証、resource。本文の丸ごとコピーではなくsource sectionと差分理由を示す
- `no_unique_elements`: booleanと、targetの該当箇所または比較証拠。名前の類似、source未読、取得失敗だけでは `true` にしない
- `manual_review`: boolean、理由、判断owner。未解決ならsourceを完了にしない
- `source_state`: `not_started`、`source_mapped`、`manual_review`、`selection_pending`、`source_complete`
- destination側の `destination_state`: `blocked`、`ready`、`integrating`、`final`、`no_change_needed`

`source_mapped` は上記記録が揃った状態、`source_complete` はmanual blockerも解消した状態である。全968件が `source_mapped` または理由付き`manual_review`になればglobal mapping gateを通過する。manual reviewは全体を止めず、関係destinationだけをblockする。pending件数を0に見せるための暫定統合はしない。

destinationは、同じ `handoff_target_key` へ流入する全sourceが判明し、全て `source_complete`、license・来歴・名前衝突・plugin権限のblockerが解消し、retained/no-unique一覧が重複排除済みの場合だけ `ready` にする。全流入が `no_unique_elements=true` なら編集せず `no_change_needed` とし、比較証拠を残す。

## recommendation別の引継ぎ契約

| recommendation（件数） | handoff targetと残す要素 | source完了・固有要素なし・manual review | destination ready条件 |
| --- | --- | --- | --- |
| `merge_compare_with_active`（193） | `skill:<active_overlap_skill>`。activeにないbehavior、trigger/non-trigger、安全境界、Windows/Codex差分、検証だけを残す | semantic diffを記録すれば固有要素なしにできる。target不在、複数候補、矛盾、複数source間の競合はmanual | 同じactive targetへ入る全sourceがcomplete後、一度だけ統合・検証 |
| `candidate_for_adaptation`（114） | `codex:<skill_name>` と `skills/codex/<skill_name>/`。用途・trigger・固有workflow/resourceを残し、Codex/Windows/承認境界へ再設計 | permissive licenseと帰属、group横断の同名なしを確認。予想外の固有要素なしは固定recommendationと衝突するためmanual | source complete、license/NOTICE、lineage・skill registry、metadata、局所検証の計画が揃う。既存の先行作成先は再作成せずfinal passへ送る |
| `use_installed_plugin`（35） | `plugin:<name>:<installed-version>`。本文は複製せず、source skill→plugin/version、利用可能性、検証証拠だけを残す | local wrapperに固有要素なしが正常。cache/version不一致、registry欠落、認証・外部作用はmanual | plugin内の全対象sourceがcompleteし、実在versionと全skillのregistry行が一致。installや外部writeは行わない |
| `evaluate_as_plugin_bundle`（453） | `plugin:<name>:candidate`。skillごとの能力・重複・権限・外部作用・license条件をbundle decisionへ集約 | source単位でbundleに寄与しない理由を示せば固有要素なし。bundle評価は必ずmanual | 同pluginの全source mapping後に一回だけbundle評価。採用時のinstallは別の明示承認、非採用時も根拠をregistryへ残す |
| `evaluate_plugin_if_needed`（32） | `plugin:<name>:deferred`。必要になる具体trigger、能力、権限だけを残し、本文は複製しない | 現在の利用要求なしは `deferred/no_change` の根拠。要求発生、install、認証、外部write前はmanual | 現時点はdeferred判断の記録でready。導入destinationは具体需要、全source mapping、license/権限評価、明示承認後だけready |
| `reference_only_license`（84） | `reference:license:<repository>:<plugin-or-skill>`。URL、commit、license種別、複製不可理由だけを残す | 表現本文は残さず、metadataだけを固有記録とする。license変更・個別許諾が提示された場合だけmanual再確認 | reference記録が揃えば `no_change_needed`。active skill/plugin destinationは作らない |
| `reference_only_deprecated`（44） | `reference:deprecated:<repository>`。deprecated証拠、後継source、履歴上の対応だけを残す | deprecated本文は移植しない。後継不明、現行sourceとの対応衝突はmanual | 全sourceが後継または後継なしへmappingされれば `no_change_needed` |
| `exclude_fixture`（4） | `fixture:<plugin>:<source_path>`。fixtureである根拠と除外範囲だけを残す | 固有要素なしを既定とする。配布対象・実行対象の可能性があればmanual | 除外証拠が揃えば `no_change_needed`。active destinationを作らない |
| `compare_duplicate_sources`（9） | 同名の現行plugin sourceをalias先とし、使用場面・効果・triggerを連想しやすい名前を後続target名の基準にする。source authorityの優劣を再審議せず、固有要素を同じplugin bundle nodeへ集約する | 同内容のduplicateである証拠とalias先があれば`source_alias`で完了。内容差・license矛盾・target不明だけを理由付きmanual reviewにする | aliasを含む全source mapping後、plugin bundle判断または明確なactive/Codex targetへ一度だけhandoffする。manual reviewが残れば関係targetだけblock |

## 既存80件の扱い

progress JSONの既存 `completed` 80件は、source handoffと先行編集の証拠であり、destination finalの証拠にはしない。全968 sourceが `source_mapped`または理由付き`manual_review`になるまで新たなdestination統合を止め、mapping完了後に次を行う。

1. 既存80件が触れた全destinationを `early_integrated` としてfinal integration passへ戻す。
2. destinationごとに全流入sourceのretained/no-unique/manual判断を集約し、重複を一度だけ解消する。
3. 単一source destinationも、group横断同名、plugin bundle、license/referenceとの衝突を再確認する。
4. 一度だけ編集または `no_change_needed` を確定し、target検証、registry/lineage、license、参照切れを確認して `final` にする。

先行時点の `Test-AgentSet passed`、target fileの存在、sourceの `completed` はfinal integration passを省略する根拠にしない。

## 2026-07-17監査スナップショット

- review CSVは968行・968 unique ID、progress JSONも968 entryで欠落IDなし。状態は `completed=80`、`not_started=879`、`selection_pending=9`。
- recommendationは、plugin bundle 453、merge 193、candidate 114、license reference 84、deprecated reference 44、installed plugin 35、plugin if needed 32、selection pending 9、fixture 4。
- merge 193 sourceは180 active targetへ収束し、10 targetが複数source流入、最大3流入。180 targetは全て現存する。したがってfile存在だけではreadyを判定できない。
- candidate 114 sourceは114個の固有名targetだが、監査時点ではcandidate `completed=8` に対し12 target directoryが現存した。作成済みとsource完了は同義ではない。
- pluginに紐づく5 recommendationは608 source・73 plugin。内訳はbundle 453/51 plugin、installed 35/7、if-needed 32/6、license 84/9、fixture 4/1。
- plugin registryは21行・4 pluginで、`installed_plugin=14` 行はcloudflare/github/notionの3 plugin、`evaluated_not_adopted=7` 行はsuperpowers。reviewのinstalled 7 pluginに対し、gmail、google-calendar、google-drive、slackのregistry groupが未記録である。
- 既存80件はmerge 55、installed plugin 14、candidate 8、plugin bundle 3で、55 dependency keyに分かれる。うちsuperpowersは3/14、cloudflareは8/9、notionは2/4 sourceだけがcompletedであり、3 plugin destinationに未処理流入が残る。

## 曖昧さと誤完了risk

- 現行 `completed` はsource完了、編集完了、destination finalを区別しない。上記二層stateなしでは80件をfinalと誤認する。
- 共有registry pathだけをtargetにするとplugin単位のdependencyが潰れ、部分登録を全plugin完了と誤認する。
- `retained_elements`、`no_unique_elements`、manual理由の専用記録がないと、未読・比較失敗・単なる重複名が「固有要素なし」へ化ける。
- reference、deprecated、fixtureの完了を採用完了と同じ集計に混ぜると、複製禁止sourceをactive化したように見える。
- selection pendingをsource未mappingのまま残すと全体依存が閉じない。decision nodeへのmappingと、選定後downstream handoffを分ける。
