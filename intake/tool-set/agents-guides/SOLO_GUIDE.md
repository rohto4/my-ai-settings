# ソロ開発運用ガイド

**対象**: VSCode単独開発（Claude Code、ChatGPT、Gemini）
**最終更新**: 2026-02-15

---

## 📚 必読ファイル

```
1. AGENTS.md（最重要）
2. docs/PROJECT.md（プロジェクト固有設定）
3. このファイル（SOLO_GUIDE.md）
```

---

## 🚀 開発開始フロー

### プロジェクト設定を用意
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

---

## 🛠️ 推奨開発フロー

### ターミナル構成（2つ並行）

**ターミナル1**: 開発サーバー
```bash
npm run dev
```

**ターミナル2**: 型チェック監視
```bash
npx tsc --noEmit --watch
```

---

## 📐 ドキュメント駆動開発（DDD）の流れ

### Phase A: アーキテクチャ設計

```markdown
docs/
├── architecture.md       # 全体アーキテクチャ
└── data-schema.md        # データベーススキーマ、型定義
```

### Phase B: 機能設計

```markdown
docs/
├── ui-spec.md            # UI/UX仕様
└── logic-flow.md         # ロジックフロー
```

### Phase C: 実装

```markdown
docs/
└── implementation-plan.md  # 実装計画
```

実装完了後、`docs/` を最新化（IMP-B）

---

## 🎯 DDD適用判断

### DDDを適用すべき ✅

- 開発期間が1週間以上
- コード行数が1000行以上
- 長期運用・保守が必要
- API連携やデータベースを使用

### DDDをスキップ可能 ⏸️

以下の**全て**に該当する場合のみ:
- 開発期間が1週間以内
- コード行数が1000行以下
- 一時的なツール・スクリプト

**迷ったらDDDを適用**

---

## 🚨 エラー対応フロー

### 基本方針

1. エラーを即座に確認（ターミナル2の型チェック監視）
2. 全エラーを分析（1つずつ対処しない）
3. 修正案をまとめて提示

### エラーが頻発する場合

```bash
# エラーレポート作成
touch temp-error-report.md

# AIに一覧化させる
「現在のエラーを全て分析して、temp-error-report.md にまとめてください」

# まとめて修正
「temp-error-report.md の修正案を全て実装してください」
```

---

## 🔄 Git運用（ソロ開発）

### コミットメッセージ規約

```bash
# 機能追加
git commit -m "feat: ユーザー投稿機能を実装

- 投稿フォームコンポーネント作成
- バリデーション実装
- API連携

Refs: docs/implementation-plan.md"

# バグ修正
git commit -m "fix: 投稿フォームのバリデーションエラーを修正"

# ドキュメント更新
git commit -m "docs: data-schema.md を最新化"

# リファクタリング
git commit -m "refactor: 投稿フォームのロジックを共通化"
```

---

**最終更新**: 2026-02-15
