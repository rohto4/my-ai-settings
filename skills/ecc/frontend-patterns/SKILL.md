---
name: frontend-patterns
description: Design or review React and Next.js boundaries, state and data flow, forms, UI states, accessibility, performance, and responsive behavior.
---

# React / Next.js Frontend Boundaries

設計・実装・レビューでは、画面を動かすことより先に責務、データ境界、失敗時の利用可能性を明確にする。対象PJの `AGENTS.md`、技術スタック、既存のUI・テスト規約を正本とし、このskillは補助指針として使う。

## Trigger and boundary

- React または Next.js の画面、コンポーネント、フォーム、データ表示、インタラクションを設計・変更・レビューするときに使う。
- server/client boundary、state ownership、data flow、loading/error/empty/success、アクセシビリティ、性能、レスポンシブ挙動を伴うときに使う。
- API契約、認可、データベース、デザインシステムの正本は各担当skill・対象PJの文書へ委ねる。境界をまたぐ変更は、先にその正本を読む。
- 採用されていないライブラリ、古い実装例、特定のアニメーションライブラリを既定にしない。必要性と依存関係を確認してから提案する。

## Workflow

1. **Read local truth.** 対象PJの指示、pinned version、既存のルーティング、コンポーネント、テスト、UI規約を確認する。version依存のAPIや推奨事項は、現行の公式ドキュメントも確認する。
2. **Map the user journey.** 利用者の目的、入力、表示データ、権限、成功、空、待機、失敗、復旧操作を列挙する。曖昧な業務判断やAPI契約は実装前に確認する。
3. **Place ownership.** 各状態を、URL、server、最も近い共有親、単一コンポーネント、または外部ストアのいずれが所有するか決める。二重の状態源を作らない。
4. **Set the boundary.** server側を既定にし、ブラウザAPI、イベント、即時入力、クライアント専用状態が必要な最小部分だけをclient化する。シリアライズ不能な値や秘密を境界越しに渡さない。
5. **Define the flow.** 読み取り元、キャッシュ/再検証、更新の起点、楽観更新の可否、失敗時のロールバック、表示の更新契機を明示する。
6. **Implement by states.** semantic HTMLを基準に、各UI状態と復旧操作を実装する。フォームはクライアントとサーバーの双方で入力を検証し、送信中の重複実行を防ぐ。
7. **Check non-functional behavior.** キーボード、フォーカス、エラー通知、狭い画面、拡大表示、低速回線、大量データ、不要なclient JavaScriptを確認する。
8. **Verify locally.** 対象PJの型検査、lint、unit/integration/e2eのうち変更リスクに見合う既存コマンドを実行し、必要なら代表的なviewportと支援技術で手動確認する。

## Decision rules

### Server/client boundary

- 読み取り、認可判定、秘密を使う処理、初期データ整形はserver側に置く。
- `use client` は葉に近い対話部分へ限定する。clientコンポーネントを親へ引き上げてserver subtreeを不必要に含めない。
- URLで共有・復元・リンク可能にすべき状態はURLへ置く。serverデータのコピーをローカルstateに常駐させない。
- 境界とキャッシュの詳細は [server-client-boundaries.md](references/server-client-boundaries.md) を読む。

### State ownership and data flow

- 派生値は保存せず、正本から計算する。stateは最も近い利用箇所に置き、複数の独立した領域が必要になったときだけ共有化する。
- 更新は一方向に追跡可能にする: user action -> validation -> mutation -> invalidation/revalidation -> rendered state。
- Contextや外部ストアは、広く共有され頻繁に変わる状態の根拠を示してから使う。データフローの選択は [state-and-data-flow.md](references/state-and-data-flow.md) を読む。

### Forms and failure states

- ラベル、入力制約、フィールド単位エラー、フォーム全体エラー、送信中、成功後の遷移/通知を設計する。
- 信頼境界の検証はserver側で必ず行う。client側の検証は即時フィードバックのためであり、認可の代替ではない。
- loading、empty、error、permission denied、network interruption、retry を画面単位で扱う。利用者がデータを失わず復旧できる方法を用意する。
- 詳細は [forms-and-failure-states.md](references/forms-and-failure-states.md) を読む。

### Accessibility and responsive behavior

- ネイティブ要素を優先し、必要なARIAだけを追加する。キーボード完結、可視フォーカス、意味のある見出し順、エラーの関連付け、ダイアログの焦点復帰を確認する。
- レイアウトはコンテンツ量、狭い幅、拡大表示、横スクロール、タッチ操作、縮小モーション設定でも破綻させない。
- 詳細は [accessibility-and-responsive-ui.md](references/accessibility-and-responsive-ui.md) を読む。

### Performance

- 計測または明確なボトルネックを根拠に最適化する。不要なclient化、過大な依存、ウォーターフォール、無制限リスト、画像/フォントの劣化を先に疑う。
- `memo`、`useMemo`、`useCallback`、仮想化、遅延読み込みは必要性を説明できる箇所に限定する。
- 詳細は [performance.md](references/performance.md) を読む。

## Stop conditions

次のいずれかなら実装を止め、根拠または判断を求める。

- 権限、機密データ、更新競合、失敗時の正しい振る舞いが未定義。
- URL、server state、client stateのいずれが正本か決められず、二重管理になる。
- pinned version、フレームワーク設定、既存規約と提案が衝突する。
- 新規依存、外部送信、分析計測、アクセシビリティを損なうUI変更を正当化できない。

## Output and verification

- 変更時は、境界、状態の正本、データ更新経路、各UI状態、アクセシビリティ/レスポンシブ上の判断、実行した検証を簡潔に報告する。
- レビュー時は、最も重大な境界違反、状態不整合、失敗復旧不能、アクセシビリティ問題、性能退行を根拠とともに優先して示す。
- 対象PJが `pj-general` で、採用済みスタックの実装詳細が必要な場合だけ [pj-general-next-app-router.md](references/pj-general-next-app-router.md) を読む。
- 任意・旧来パターンの採否判断には [optional-and-legacy-patterns.md](references/optional-and-legacy-patterns.md) を読む。例を正解として複製しない。
