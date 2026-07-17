# agents-v1

## 目的

ECC を skill 正本として取り込み、Codex 専用運用へ改善していくための v1 作業ツリー。

このフォルダは、現行 `G:\devwork\tool-set\.agents` を直接置き換えるものではない。まず評価、修正、整理を行うための候補置き場として扱う。

## 取り込み元

- 正本: `G:\devwork\clone-dir\everything-claude-code\skills`
- 補助: `G:\devwork\clone-dir\everything-claude-code\.agents\plugins`

## 配置

```text
agents-v1/
├── .agents/
│   ├── README.md
│   ├── plugins/
│   └── skills/
├── commands/
├── profiles/
└── .codex/
    ├── config.toml
    └── prp/
        ├── prds/
        ├── plans/
        ├── reports/
        └── completed/
```

## 方針

- skill はECCの `skills` を正本として全件取り込む。
- ECC由来181件は母集団として保持し、追加skillと区別して履歴を追えるようにする。
- PJごとの常用セットは `profiles/` で選択し、母集団の削除とは分ける。
- `.claude` や Claude Code 前提の記述はECC由来の名残として扱い、Codex向けに必要な箇所から段階的に修正する。
- PRP成果物の保存先は `.codex/prp/` とする。
- 対話型の旧custom promptはCodex skillへ移し、`commands/` には検証・profile出力など決定的なPowerShell commandを置く。
- project configはモデル名を固定せず、ユーザー設定を継承する。
- secret、token、Cookie、未公開認証情報はここに書かない。
- `agents-v1/.agents/skills/` を全skillの唯一の編集正本とする。実際にCodexが発見するグローバル配置 `C:\Users\unibe\.codex\skills\` は、`commands/Sync-AgentSkills.ps1` で母集団から同期する派生物として扱い、直接編集しない。
- 来歴台帳は `skills-registry.csv` とする。新規またはローカルで改変したskillは、作成・更新日時、作成・更新者、lifecycle、検証状態をここへ記録する。ECC由来skillのoriginは `skills-source-frontmatter.csv` を正本とし、存在しない作成日時を推測で埋めない。

## 入口

- 大規模Webプロダクトprofile: `profiles/pj-general-large-web-product/`
- 検証・profile出力: `commands/README.md`
- skill分類: `skills-classification.csv`
- 旧frontmatter証跡: `skills-source-frontmatter.csv`
