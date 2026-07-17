# 完了記録

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
