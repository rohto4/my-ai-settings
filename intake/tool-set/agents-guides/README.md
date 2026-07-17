# AI Agents Guides

AIエージェント（Claude、ChatGPT、Gemini）を使った開発のための統合ガイド。

---

## 📁 ファイル構成
```
/agents-guides/
├── README.md                    # このファイル（使い方ガイド）
├── AGENTS.md                    # エージェント共通設定（最重要）
├── SOLO_GUIDE.md                # ソロ開発運用ガイド
├── TEAM_GUIDE.md                # チーム開発運用ガイド
├── PROJECT_TEMPLATE.md          # プロジェクトテンプレート（なくても動く）
├── ohmyopencode-config.json     # OhMyOpenCode設定
└── ohmy-summary.md              # OhMyOpenCode設定サマリー
```
---

## 🚀 クイックスタート

### ソロ開発（VSCode + Claude/ChatGPT）
```
# 1. プロジェクトフォルダにガイドを配置
<プロジェクトフォルダ>/agents-guides/
├── README.md                    # このファイル（使い方ガイド）
├── AGENTS.md                    # エージェント共通設定（最重要）
└── SOLO_GUIDE.md                # 単一AIエージェント開発運用ガイド
<プロジェクトフォルダ>/docs/
└── PROJECT.md                   # PROJECT_TEMPLATEを固有設定に編集

# 2. VSCodeでAIを起動（Claude Code / ChatGPTなど）

# 3. 次の指示を実行
次の順でガイドを読み込んで
@agents-guides/AGENTS.md
@agents-guides/SOLO_GUIDE.md
@docs/PROJECT.md（プロジェクト固有設定、なかったらスキップ）

# 4. 開発開始！
```

### チーム開発（OhMyOpenCode）
```
# 1. プロジェクト設定を配置、チーム開発設定ファイルを配置
<プロジェクトフォルダ>/agents-guides/
├── README.md                    # このファイル（使い方ガイド）
├── AGENTS.md                    # エージェント共通設定（最重要）
├── TEAM_GUIDE.md                # AIエージェントチーム開発運用ガイド
└── ohmyopencode-config.json     # AIエージェントチーム開発設定ファイル（テンプレート）
<プロジェクトフォルダ>/docs/
└── PROJECT.md                   # PROJECT_TEMPLATEを固有設定に編集
```

```bash
# 2. OhMyOpenCode設定ファイルをプロジェクトルートにコピー
cp agents-guides/ohmyopencode-config.json ./ohmyopencode-config.json

# 3. bashでLock機構を初期化
mkdir -p .locks/{features,files,tasks}
cat > .locks/tasks/active-tasks.json <<'EOF'
{
  "tasks": []
}
EOF
```
```
# 4. 次の指示を実行
次の順でガイドを読み込んで
@agents-guides/AGENTS.md
@agents-guides/TEAM_GUIDE.md
@docs/PROJECT.md（プロジェクト固有設定、なかったらスキップ）

⚠️ 注意: Atlas-Orchestratorは /start-work コマンド経由でのみ使用してください。
直接呼び出すと正しく動作しません。

# 5. エージェントチーム開発開始！
```

---

## 📚 各ファイルの役割

### 1. AGENTS.md（必読）

全エージェント共通の基本ルール。

- ドキュメント駆動開発（DDD）の方針
- コード生成ルール
- エラー対応フロー
- モデル別（Claude/ChatGPT/Gemini）の機能・制約
- DDD適用判断基準

**読み込みタイミング**: 全ての開発で最初に読み込む

### 2. SOLO_GUIDE.md

ソロ開発時の運用ガイド。

- VSCodeでの開発フロー
- ファイル編集のベストプラクティス
- 型チェック・Lint運用

**読み込みタイミング**: VSCodeでソロ開発する時

### 3. TEAM_GUIDE.md

チーム開発時の運用ガイド。

- Lock機構の使い方
- タスク管理フロー
- Git規約
- エージェント間の競合回避ルール

**読み込みタイミング**: OhMyOpenCodeでチーム開発する時

### 4. PROJECT_TEMPLATE.md

プロジェクト固有設定のテンプレート。

**使い方**:
1. プロジェクトルート/docs/PROJECT.md にコピー
2. `[ ]` 部分を埋める（技術スタック、テーマ設定など）
3. AIに読み込ませる

### 5. ohmyopencode-config.json

OhMyOpenCode設定ファイル。

- モデル定義（Claude Sonnet 4.5、GPT 5.2 Codex、Codex Mini）
- エージェント役割定義

**使い方**: プロジェクトルートにコピーしてカスタマイズ

### 6. ohmy-summary.md

OhMyOpenCode設定サマリー（人間が編集しやすい形式）。

---

## ⚙️ DDD適用判断基準

### DDDを適用すべき ✅

- 開発期間が1週間以上
- コード行数が1000行以上
- 複数人で開発
- 長期運用・保守が必要

### DDDをスキップしてもよい ⏸️

- 開発期間が1週間以内
- コード行数が1000行以下
- 一時的なツール・スクリプト
- プロトタイプ・検証用

**迷ったらDDDを適用する**

---

**最終更新**: 2026-02-15
