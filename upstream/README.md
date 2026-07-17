# upstream clones

外部skill repositoryを比較・監査するためのread-only配置。clone本体は `.gitignore` 対象で、このREADMEだけをGit管理する。

## 運用境界

- 上流本文をこのrepoのactive skillとして直接同期しない。
- clone内を編集しない。比較対象は `registry/upstreams.csv` に記録したcommitへ固定する。
- 採用時は個別license、著作権表示、外部書込み・secret・hook、Codex固有記法、既存skillとの重複を確認する。
- 私用の編集版は `skills/codex/<skill-name>/` に別配置し、変更内容と来歴を台帳へ残す。

## 現在の比較対象

```powershell
git clone https://github.com/affaan-m/everything-claude-code.git .\upstream\ecc-everything-claude-code
git clone https://github.com/obra/superpowers.git .\upstream\obra-superpowers
git clone https://github.com/addyosmani/agent-skills.git .\upstream\addyosmani-agent-skills
git clone https://github.com/openai/skills.git .\upstream\openai-skills
git clone https://github.com/openai/plugins.git .\upstream\openai-plugins
```

`openai/skills`は上流READMEで非推奨とされているため履歴比較用とし、現行のCodex plugin / skill例は`openai/plugins`を主参照にする。実際の固定commitとlicense判定は `registry/upstreams.csv` を正本とする。
