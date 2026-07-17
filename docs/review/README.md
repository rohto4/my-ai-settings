# Upstream skill review

上流cloneをactive母集団へ混ぜる前に、固定commitの全skillを同一基準で比較する成果物を置く。

- `upstream-skill-improvement-proposals-2026-07-17.html`: 人が読むstandalone HTML。全968件の重要度・難易度・使用頻度・属性・読む順、日本語の使用場面／効果2段表示、読む順Sの全件一覧、短文改善要約、クリック絞り込みtag、読書状態を持つ。おすすめ適用後を継続利用／実質廃止／正本選定待ちに分類し、ランク別件数と継続利用以外のgray-out操作を提供する。高contrast・高密度なdark review-table書式で、3指標・risk/tag・根拠/詳細を独立列にし、11見出しの昇順/降順sort、列直下filter、cell値clickによる絞り込みに対応する。skill名は `runtime/skill-previews/2026-07-17/` に生成したMarkdown preview HTMLを別タブで開く
- `upstream-skill-improvement-proposals-2026-07-17.csv`: 968件のfile-level evidence、読む順評価、短文要約、展開用の詳細改善案
- `upstream-skill-audit-summary-2026-07-17.json`: 集計と生成物validation

正本入力はGit管理外の `upstream/` cloneと `registry/upstreams.csv`。再生成コマンドは `commands/audit-upstream-skills.mjs`。

Markdown previewは原文SKILL.mdから再生成するruntime派生物でありGit管理外とする。Codex固有のlocal Markdown schemeやserverに依存せず、reportからlocal HTMLとして開く。

重要度・難易度・使用頻度はECC既存評価を優先し、対応評価がないskillは名前・description・操作境界から静的推定する。使用頻度は起動実績の計測値ではない。P0～P3は読む価値ではなく、license・安全・構造上のriskである。

このreviewは採用許可ではない。licenseがrestrictedまたはunknownの本文はコピーせず、OpenAI Pluginsのskillはplugin manifest、MCP/app、認証、licenseを含むbundleとして評価する。
