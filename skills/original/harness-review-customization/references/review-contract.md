# Review comment contract

## JSON export

The preferred format has `schema_version: 1` and a `sections` array. Each row contains `section_id`, `component_id`, `component_name`, and `comment`. Empty comments are preserved but do not request a change.

## Chat paste

```text
[HCOMP-007] Path read deny
コメント: .envに加えてprivate exportも読込禁止にしたい。

[HCOMP-012] External write approval
コメント: payloadの差分を承認画面に必ず表示したい。
```

The component ID is authoritative for routing. The name is human-readable context and may change between report versions.
