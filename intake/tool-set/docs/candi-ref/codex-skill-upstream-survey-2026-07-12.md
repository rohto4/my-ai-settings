# Codex Skill Upstream 調査 2026-07-12

## 結論

ECC由来のmother setだけを長期の改善元にしない。Codex向けの構造、plugin、UI metadata、実セッション運用は現在の公式実装を上流として追随し、公開skillは用途単位で評価して採択する。

現時点で、個人または企業の公開collectionを新しい単独正本に置き換える根拠はない。collectionは探索索引、個別skillは候補、PJ内で検証済みの`agents-v1`は採択済みの正本として扱う。

## 上流の優先順位

| 優先 | 対象 | 扱い | 根拠 |
| --- | --- | --- | --- |
| 1 | `openai/plugins` | Codex構造・plugin形式・公式exampleの追随元 | `openai/skills`自身がdeprecatedとして、このrepositoryとBuild plugins guideを現行参照先に案内している。 |
| 2 | OpenAI Codex docs / `openai/codex` | discovery、metadata、config、skill authoring仕様の正本 | tool behaviorやvalidatorの解釈は公開collectionより優先する。 |
| 3 | `ComposioHQ/awesome-codex-skills` | discovery catalog | 実用skillの索引として有用。ただし掲載skillの品質・安全性・維持状況は個別評価する。 |
| 4 | 個別のCodex対応skill repository | 限定採択候補 | package構造、ライセンス、更新、実行権限、依存、forward testを確認してから採用する。 |
| 5 | ECC mother set | 保持対象・比較対象 | 既存資産と出所情報を保つが、Codex適合や最新性の根拠にはしない。 |

## 個別候補の初期評価

| 対象 | 候補用途 | 初期評価 | 扱い |
| --- | --- | --- | --- |
| `openai/plugins` | plugin manifest、skill-only plugin、MCP/agent/command分離 | 採用候補ではなく公式構造の追随元 | 毎回のplugin化・構造変更時に参照する。 |
| `yujiachen-y/codebase-recon-skill` | Git履歴による未知repoの初期診断 | narrowで検証可能。Codex plugin構造を持つ | `repo-scan`との重複と実出力を比較する候補。いきなりcoreへ入れない。 |
| `hyhmrright/brooks-lint` | コードレビュー、アーキテクチャ、テスト健全性 | Codex手順と設定が明示され、根拠資料を持つ | read-only review modeだけをsandboxでforward testする。auto-fixは採用しない。 |
| `chriscox/agent-skills` | proposalとdocs同期の責務分離 | cross-agent設計の参考になるが、小規模でCodex専用ではない | `prp-*`と`docs-state-sync`の比較材料にする。 |
| `troykelly/codex-skills` | issue-driven workflow、hook runner | Codex翻訳の事例にはなるが、hook、config追記、MCP、account snapshotまで扱う | 正本・直接導入の候補から外す。安全設計の反例としてだけ参照する。 |

## 採択ゲート

公開skillはcloneまたはinstall前に、次を満たすものだけを検証用隔離領域へ取り込む。

1. Codexの現行skill/plugin構造と整合する。
2. ライセンス、maintainer、更新時期、依存を確認できる。
3. secret、認証情報、account snapshot、既存configへの自動追記を要求しない。
4. 破壊操作、外部書込み、依存更新、auto-fixはread-onlyまたは明示承認へ分離できる。
5. `SKILL.md`を読んでtrigger、対象範囲、停止条件、出力、検証が判定できる。
6. 既存skillとの重複と差分を比較し、代表シナリオでforward testできる。
7. 採択してもprofileのcontext予算と発火精度を損なわない。

## 次の調査単位

1. `openai/plugins`から、skill-only pluginと開発workflowに近いexampleを抽出して構造差分を取る。
2. `codebase-recon-skill`と`brooks-lint`を、外部書込みなしの隔離検証で評価する。
3. 既存`repo-scan`、`workspace-surface-audit`、`security-review`、`tdd-workflow`との重複、追加価値、token costを記録する。
4. 採用したものだけを`agents-v1`へ適応し、出所・ライセンス・改修理由をCSVとreferenceへ残す。

## 参照

- https://github.com/openai/plugins
- https://developers.openai.com/codex/plugins/build
- https://github.com/ComposioHQ/awesome-codex-skills
- https://github.com/yujiachen-y/codebase-recon-skill
- https://github.com/hyhmrright/brooks-lint
- https://github.com/chriscox/agent-skills
- https://github.com/troykelly/codex-skills
