# ECC legacy resources

ECC母集団から取り込んだ資源のうち、現行Codex skillのactive pathへ置くと誤実行され得るものを原文保持する隔離先です。

- 削除や現行運用への採用を意味しません。
- active skillから参照しません。
- 再採用する場合は、対象Codex surfaceとOSで設定・実行・停止条件を再設計し、forward testを通します。

## 保存物

- `skills/strategic-compact/suggest-compact.sh`: Claude Codeのhook、Bash、`/compact`を前提としたECC原文。
- `skills/security-review/legacy-security-review-guidance.md`: 自動dependency更新や固定platform例を含む旧security review本文。
- `skills/security-review/cloud-infrastructure-security.md`: 環境変数の一律否定やmutable action参照を含む旧cloud security補助文書。
