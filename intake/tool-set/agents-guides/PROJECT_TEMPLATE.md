# プロジェクト設定テンプレート

**使い方**: プロジェクトルート/docs/PROJECT.md にコピーし、`[ ]` 部分を埋める

---

## 📌 プロジェクト基本情報

### プロジェクト名
```
[ プロジェクト名を記入 ]
```

### プロジェクト概要
```
[ プロジェクトの概要を1-3文で記入 ]
```

### 開発期間
```
[ 開発期間を記入 ]
例: 2026-02-01 〜 2026-03-31（2ヶ月）
```

### 想定コード行数
```
[ 想定コード行数を記入 ]
例: 5,000行程度
```

---

## 🎯 DDD適用判断

### 判定結果
`[ はい / いいえ ]`

### 理由
```
[ DDDを適用する/しない理由を記入 ]

例（適用する場合）:
- 開発期間が2ヶ月と長期
- コード行数が5,000行以上
- 長期運用・保守が必要
- データベース・API連携を使用

例（適用しない場合）:
- 開発期間が3日程度
- コード行数が200行以下
- 一時的なツール・スクリプト
```

---

## 🛠️ 技術スタック

### フレームワーク
```
[ 使用するフレームワークを記入 ]

例:
- Next.js 15 (App Router)
- React 19
- TypeScript 5
```

### CSS / UI
```
[ CSSフレームワーク、UIライブラリを記入 ]

例:
- Tailwind CSS v4
- shadcn/ui
- Lucide Icons
```

### バックエンド / データベース
```
[ バックエンド、データベースを記入 ]

例:
- Supabase
  - Auth (Google OAuth)
  - Database (PostgreSQL 15+)
  - Storage
```

### その他のライブラリ
```
[ その他の重要なライブラリを記入 ]

例:
- Tiptap 2.x (リッチテキストエディタ)
- Zod (バリデーション)
- React Hook Form (フォーム管理)
```

### デプロイ先
```
[ デプロイ先を記入 ]

例:
- Vercel (本番環境)
```

---

## 📁 プロジェクト構成

### ディレクトリ構造
```
[ プロジェクトのディレクトリ構造を記入 ]

例:
project-root/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reactコンポーネント
│   │   ├── ui/          # shadcn/ui
│   │   └── features/    # 機能別コンポーネント
│   ├── lib/             # ユーティリティ
│   │   ├── actions/     # Server Actions
│   │   └── utils/       # ヘルパー関数
│   ├── types/           # TypeScript型定義
│   └── styles/          # グローバルCSS
├── docs/                # ドキュメント（DDD適用時）
│   ├── lv1/            # 要件・設計
│   ├── lv2/            # データ・API
│   ├── lv3/            # 実装詳細
│   └── lv4/            # 機能別実装状況
└── public/              # 静的ファイル
```

---

## 🎨 デザインテーマ

### カラーテーマ
```
[ カラーテーマを記入 ]

例:
- ライトモードのみ（ダークモード廃止）
- パステルオレンジ（黄色寄り）ベース
```

### フォント
```
[ 使用フォントを記入 ]

例:
- 見出し: Inter
- 本文: Noto Sans JP
- コード: Geist Mono
```

---

## 🔐 認証・権限

### 認証方式
```
[ 認証方式を記入 ]

例:
- Supabase Auth
- Google OAuth
- メールアドレス + パスワード（管理者のみ）
```

### 権限レベル
```
[ 権限レベルを記入 ]

例:
- 一般ユーザー: 閲覧のみ
- 管理者: 記事投稿、編集、削除
```

---

## 📊 データベーススキーマ（概要）

### 主要テーブル
```
[ 主要テーブルを記入 ]

例:
- posts（記事）
  - id: UUID
  - title: VARCHAR(200)
  - slug: VARCHAR(200) UNIQUE
  - content: JSONB (Tiptap JSON)
  - status: VARCHAR(20) (draft/scheduled/published)
  - published_at: TIMESTAMPTZ

- tags（タグ）
  - id: UUID
  - name: VARCHAR(100) UNIQUE
  - slug: VARCHAR(100) UNIQUE
```

詳細: DDDを適用する場合、`docs/lv2/data-schema.md` に記載

---

## 🚀 主要機能

### 機能一覧
```
[ 主要機能を記入 ]

例:
1. 記事管理
   - 記事一覧表示
   - 記事詳細表示
   - 記事作成・編集・削除（管理画面）
   - タグフィルタリング
   - 検索機能

2. 認証機能
   - Google OAuthログイン
   - ログアウト
   - 認証保護（管理画面）
```

---

## 🔧 開発環境

### 必須ツール
```
[ 必須ツールを記入 ]

例:
- Node.js 20.x
- npm 10.x
- Git
- VSCode（推奨）
```

### 環境変数
```
[ 環境変数を記入 ]

例:
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

---

## 📝 コーディング規約（プロジェクト固有）

### ファイル命名規則
```
[ ファイル命名規則を記入 ]

例:
- コンポーネント: PascalCase（例: PostCard.tsx）
- ユーティリティ: camelCase（例: formatDate.ts）
- 定数: UPPER_SNAKE_CASE（例: API_BASE_URL.ts）
```

### 禁止事項（プロジェクト固有）
```
[ プロジェクト固有の禁止事項を記入 ]

例:
- ダークモード実装（ライトモードのみ）
- any型の使用
- コメントの過剰な記載（CODE-001参照）
- インラインスタイル（Tailwind使用）
```

---

## 🚨 特記事項

### プロジェクト固有の注意点
```
[ プロジェクト固有の注意点を記入 ]

例:
- Tiptap使用時は必ず `immediatelyRender: false` を設定（SSR対応）
- 画像は必ず `next/image` を使用（最適化）
- Server Actions は必ず `'use server'` ディレクティブを追加
- 外部画像ドメインは `next.config.ts` の `remotePatterns` に登録
```

---

**最終更新**: 2026-02-15
