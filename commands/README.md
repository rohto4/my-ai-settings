# ai-settings commands

再利用する対話ワークフローは、中央の `skills/<group>/<skill-name>/` に置きます。このディレクトリには、検証・同期・profile書き出しなど、決定的に実行したいPowerShell commandだけを置きます。

## Commands

### Agent set validation

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Test-AgentSet.ps1 `
  -ProfilePath .\profiles\codex-desktop-default\profile.json
```

### Export a profile to an empty candidate directory

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Export-AgentProfile.ps1 `
  -ProfilePath .\profiles\pj-general-large-web-product\profile.json `
  -DestinationRoot ..\pj-agent-profile-candidate `
  -WhatIf
```

`Export-AgentProfile.ps1` は既存ファイルを上書きしません。出力先が空でない場合は停止します。

`Test-AgentSet.ps1` は、skill本文に加えて標準resourceディレクトリへのlocal link、active resource内のClaude固有運用、dependencyを変更するnpm command、500行超、UI metadata、profile参照、mother-set baseline、profile初期一覧の概算文字数も報告します。既定の概算上限は8,000文字で、`-ProfileDiscoveryBudget`で検証値を変更できます。

### Sync the active Codex Desktop profile

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Sync-AgentSkills.ps1
```

引数なしでは`profiles/codex-desktop-default/profile.json`の`skill_groups`だけを
`C:\Users\unibe\.codex\skills\<skill-name>\`へflatに同期する。別profileを使う場合は
`-ProfilePath`を指定する。

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Sync-AgentSkills.ps1 `
  -ProfilePath .\profiles\harness-engineering\profile.json
```

前回manifestで管理していたskillのうち、新しいprofileに含まれないものだけをruntimeから縮退する。
`.system`、plugin、manifest外のskillは変更しない。同名runtime directoryはstaging copyのtree
hashを検証してから完全置換し、正本から削除された旧resourceを残さない。同期後のmanifestには
profile、母集団件数、active件数、縮退件数、各skillのsource/destination tree hashを残す。
まず`-WhatIf`で追加・更新・縮退対象を確認する。

309件の母集団全体へ一時的に戻す場合だけ、明示的に`-FullMotherSet`を指定する。

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\commands\Sync-AgentSkills.ps1 `
  -FullMotherSet
```

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

### Audit every upstream skill and rebuild the review artifact

```powershell
C:\Users\unibe\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe `
  .\commands\audit-upstream-skills.mjs
```

`registry/upstreams.csv`で固定したcloneを読み、独立採用単位ごとにlicense、安全境界、Codex/Windows適合性、active重複、上流間重複を検査する。結果は `docs/review/` のCSV・summary JSON・standalone HTMLへ出力する。clone本体やactive skill本文は変更しない。
