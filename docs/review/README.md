# Upstream skill review

上流cloneをactive母集団へ混ぜる前に、固定commitの全skillを同一基準で比較する成果物を置く。

- `upstream-skill-improvement-proposals-2026-07-17.html`: 人が読むstandalone HTML。filter、詳細、読書状態を持つ
- `upstream-skill-improvement-proposals-2026-07-17.csv`: 968件のfile-level evidenceと改善案
- `upstream-skill-audit-summary-2026-07-17.json`: 集計と生成物validation

正本入力はGit管理外の `upstream/` cloneと `registry/upstreams.csv`。再生成コマンドは `commands/audit-upstream-skills.mjs`。

このreviewは採用許可ではない。licenseがrestrictedまたはunknownの本文はコピーせず、OpenAI Pluginsのskillはplugin manifest、MCP/app、認証、licenseを含むbundleとして評価する。
