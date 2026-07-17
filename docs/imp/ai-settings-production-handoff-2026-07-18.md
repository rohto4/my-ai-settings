# 改修版skill集・本番運用handoff

## 目的

`G:\devwork\ai-settings`の未コミット差分を最終監査し、意図したファイルだけをcommit・`origin/main`へpushする。その後、新しいCodexタスクでruntimeへ配布済みのskillメニュー、自動選択、明示呼び出しをsmoke testする。

## 再開時に必ず読む順番

1. `AGENTS.md`
2. `PROJECT.md`
3. `README.md`
4. `docs/imp/imp-tasks.md`の`AI-SET-RELEASE-01`
5. このhandoff
6. `docs/imp/imp-comp.md`の`AI-SET-SKILL-06`、`AI-SET-SKILL-05`、`AI-SET-SKILL-04`

会話要約を正本にせず、上記ファイルとGit・runtimeの実体を再確認してからstageする。

## 現在のGit状態

- branch: `main`
- remote: `origin = https://github.com/rohto4/my-ai-settings.git`
- HEAD: `5c4b45b feat: apply upstream skill recommendations`
- 確認時点では`HEAD == origin/main`。
- working treeは未コミット。確認時点のtracked diffは39ファイル、約777 insertions / 2,680 deletions。handoffとtask追記後は件数が増えるため、再開時に再集計する。
- commit・pushはまだ行っていない。

## 今回commitする予定の成果

1. 上流968 source / 358 targetの一括処理完了。現行targetは`integrated=253`、`no_change_needed=105`、blocked 0。
2. blockerだった`ck`、`configure-ecc`、`continuous-learning`、`continuous-learning-v2`をCodexのdocumented hook・storage契約へ再設計。
3. `Sync-AgentSkills.ps1`をoverlay copyから、staging・完全置換・source/destination full-tree SHA-256照合へ強化。
4. `pj-general-large-web-product`のcore 30件・recommended 15件を全てメニュー表示可能にし、6skillの自動発火descriptionを短く明確化。
5. progress JSON / HTML、target result、`imp-comp.md`へ完了証拠を反映。
6. 新規resourceとして次を含める予定:
   - `skills/ecc/ck/agents/openai.yaml`
   - `skills/ecc/configure-ecc/agents/openai.yaml`
   - `skills/ecc/continuous-learning/agents/openai.yaml`
   - `skills/ecc/continuous-learning/hooks/stop-candidate.mjs`
   - `skills/ecc/continuous-learning-v2/agents/openai.yaml`
   - `skills/ecc/continuous-learning-v2/hooks/observe.mjs`
   - `skills/ecc/frontend-design/agents/openai.yaml`
7. Claude Code前提の旧observer・shell hook資源は、Codex版へ置換したため削除予定。削除一覧は`git status --short`で再確認する。

## stage前に分離するファイル

`docs/imp/knowledge-register.md`が2026-07-18 02:36:45に未追跡で出現した。今回の対話では作成しておらず、commit対象として未承認である。

- 内容はknowledge/prompt candidate registerの空template。
- `G:\devwork\tool-set\docs\ops\knowledge-candidate-register-policy.md`を参照している。
- 由来と、このrepoへ置くことが正しいかを確認するまで`git add -A`しない。
- 採用する場合も、今回のskill改修commitと分けるかを判断する。

## runtime配布状態

- `C:\Users\unibe\.codex\skills`へ307 skillを実同期済み。
- runtime manifest: `C:\Users\unibe\.codex\skills\.tool-set-agent-skills.json`
- 確認時点: `skill_count=307`、`verification=full-tree-sha256`、tree mismatch 0、staging残骸0。
- profile主要45件の`SKILL.md`と`agents/openai.yaml`はsource/runtime SHA-256不一致0。
- `.system`は保持済み。母集団外runtime skillは確認時点0件。
- profile validation: skills 307、core 30、recommended 15、discovery 7,977 / 8,000、errors 0、既存warnings 24。
- sourceを追加修正しない限り再同期は不要。修正した場合だけvalidation → `-WhatIf` → 明示的実同期 → manifest照合をやり直す。

## hook状態と運用境界

- user `C:\Users\unibe\.codex\hooks.json`には既存のcompact復帰reminderだけがある。
- `ck`、`continuous-learning`、`continuous-learning-v2`のhookは未登録。
- `continuous-learning/config.json`は`enabled=false`。通常は`$continuous-learning`を意味のある訂正・再発防止・安定ルールの発生時だけ手動利用する方針を推奨した。
- skill本文をruntimeへ置くだけではhookは動かない。hook導入は別タスクとしてevent、保存内容、trustを確認し、ユーザーの明示指示後に行う。

## 検証済み内容

- `Test-AgentSet.ps1`: errors 0、既存warnings 24。
- profile menu audit: 45 / 45。
- Node syntax / Python AST: pass。
- `ck`日本語project register・forget: pass。
- `continuous-learning` redaction後hash: pass。
- `continuous-learning-v2`: 24並行hook、12並行CLI、invalid config fail-closed: pass。
- 一時runtimeで旧resource除去、file count・tree hash一致: pass。
- target audit: source 968、target 358、blocked 0。
- `git diff --check`: pass。
- `quick_validate.py`はbundled PythonにPyYAMLがないため未実行。依存は追加していない。

## 次セッションの実施順

1. 初期化ファイルとこのhandoffを読む。
2. `git fetch origin`後、`main`と`origin/main`の差分を確認する。remoteが進んでいたらpush前に停止して調整する。
3. `git status --short`、`git diff --stat`、`git diff --check`を再実行する。
4. `docs/imp/knowledge-register.md`の由来・採否を確認し、未確定なら除外する。
5. profile validationとtarget auditを再実行する。
6. 意図したpathだけを明示的にstageする。`git add -A`は使わない。
7. staged diffとsecret patternを確認する。
8. 例: `feat: productionize Codex skill set`でcommitし、`origin/main`へpushする。
9. push後に`HEAD == origin/main`、working tree、runtime manifestをreadbackする。
10. 新しいCodexタスクまたはapp再起動後、`$frontend-design`、`$ck`、`$configure-ecc`のメニュー・明示呼び出しをsmoke testする。
11. 完了証拠を`imp-comp.md`へ移し、`AI-SET-RELEASE-01`を`imp-tasks.md`から外す。この一時handoffは削除するか、必要な恒久情報だけを完了記録へ移す。

## 停止条件

- remote mainが進んでいる。
- 意図不明の新規・変更ファイルが増えている。
- validation error、tree mismatch、secret疑いがある。
- hook追加、外部設定変更、別repo変更が必要になった。

これらは推測で解消せず、証拠と対象pathを提示してユーザー判断へ戻す。
