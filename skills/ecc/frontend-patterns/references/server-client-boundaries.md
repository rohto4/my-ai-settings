# Server / Client Boundaries

## Purpose

React Server Componentsを使える環境では、まずserver側で画面を組み立て、対話が必要な狭い部分だけをclient側へ切り出す。実際のディレクティブ、キャッシュ、Server Actions、Route Handlersの制約は、対象PJのpinned framework versionと現行公式ドキュメントで確認する。

## Boundary checklist

- server側: 認可に必要な情報、秘密、データ取得、初期整形、静的な表示。
- client側: event handler、ブラウザAPI、即時入力、ローカルな開閉/選択状態、client-only library。
- props: JSON相当のシリアライズ可能なデータだけを渡す。関数、DB接続、秘密、class instanceをまたがせない。
- URL: フィルタ、並び順、ページ、選択など共有・ブックマーク・戻る操作で復元すべき状態。
- server data: 取得元を正本にする。表示の都合だけでclient stateにコピーしない。

## Placement example

```tsx
// Server component: query and authorize here.
export default async function OrdersPage({ searchParams }: PageProps) {
  const filters = parseOrderFilters(searchParams)
  const orders = await listOrders(filters)

  return <OrderListClient initialOrders={orders} />
}

// Client component: retain only browser interaction.
'use client'

export function OrderListClient({ initialOrders }: { initialOrders: Order[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  return <OrderList orders={initialOrders} selectedId={selectedId} onSelect={setSelectedId} />
}
```

This pattern is only appropriate while `initialOrders` is a valid snapshot for the interaction. For mutations or long-lived screens, define the project's revalidation strategy instead of adding a second source of truth.

## Boundary review questions

1. Could the outer component remain server-rendered?
2. Does the client receive only data it is authorized to see?
3. Which state must survive refresh, navigation, or a copied URL?
4. After a mutation, what updates the rendered data, and what happens if it fails?
5. Does the client bundle now contain a large dependency that can remain server-only or load only on demand?
