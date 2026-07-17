# ai-settings commands

再利用する対話ワークフローは、中央の `skills/<group>/<skill-name>/` に置きます。このディレクトリには、検証・同期・profile書き出しなど、決定的に実行したいPowerShell commandだけを置きます。

## Commands

### Agent set validation

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Test-AgentSet.ps1 `
  -ProfilePath .\profiles\pj-general-large-web-product\profile.json
```

### Export a profile to an empty candidate directory

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Export-AgentProfile.ps1 `
  -ProfilePath .\profiles\pj-general-large-web-product\profile.json `
  -DestinationRoot ..\pj-agent-profile-candidate `
  -WhatIf
```

`Export-AgentProfile.ps1` は既存ファイルを上書きしません。出力先が空でない場合は停止します。

`Test-AgentSet.ps1` は、skill本文に加えて標準resourceディレクトリへのlocal link、active resource内のClaude固有運用、dependencyを変更するnpm command、500行超、UI metadata、profile参照、profile初期一覧の概算文字数も報告します。既定の概算上限は8,000文字で、`-ProfileDiscoveryBudget`で検証値を変更できます。

### Sync the entire mother set to active Codex skills

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Sync-AgentSkills.ps1
```

`skills/ecc/`、`skills/codex/`、`skills/original/` を唯一の編集正本として再帰的に列挙し、実行時は全skillを `C:\Users\unibe\.codex\skills\<skill-name>\` へflatにコピーする。groupをまたぐ同名skillがあれば安全のため停止する。同期先の `.system` や母集団にないskillは削除しない。旧版が作った同名の二重入れ子だけは、母集団側に同名子directoryがないことを確認してから除去する。同期後は `.tool-set-agent-skills.json` にsource、group、日時、件数、各`SKILL.md`のhashを残す。まず`-WhatIf`で対象を確認できる。

## Replaced prompt commands

| 旧command | Codex skill |
| --- | --- |
| `prp-prd.md` | `$prp-create-prd` |
| `prp-plan.md` | `$prp-create-plan` |
| `prp-implement.md` | `$prp-implement-plan` |
| `expand-answer.md` | `$expand-answer` |

### Rebuild active skill lineage

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Update-SkillLineage.ps1
```

group再配置やECC比較cloneのcommit更新後に、active母集団192件の来歴と現行ECC上流での同名有無を `registry/skill-lineage.csv` へ再生成する。過去取込時のcommitは不明のため推測で補完しない。
