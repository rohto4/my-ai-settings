#!/usr/bin/env bash
# Enumerate Markdown rule files from an explicit root and emit JSON to stdout.
# Usage: scan-rules.sh <rules-root>

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: scan-rules.sh <rules-root>" >&2
  exit 2
fi

for dependency in find sort grep sed jq wc; do
  if ! command -v "$dependency" >/dev/null 2>&1; then
    echo "Missing dependency: $dependency" >&2
    exit 2
  fi
done

if [[ ! -d "$1" ]]; then
  echo "Rules root not found: $1" >&2
  exit 1
fi

rules_root=$(cd "$1" && pwd -P)
items=()

while IFS= read -r file; do
  headings=$({ grep -E '^##[[:space:]]+' "$file" 2>/dev/null || true; } | sed -E 's/^##[[:space:]]+//' | jq -R . | jq -s '.')
  lines=$(wc -l < "$file" | tr -d ' ')
  items+=("$(jq -n \
    --arg path "$file" \
    --arg file "$(basename "$file")" \
    --argjson lines "$lines" \
    --argjson headings "$headings" \
    '{path:$path,file:$file,lines:$lines,headings:$headings}')")
done < <(find "$rules_root" -type f -name '*.md' -not -path '*/_archived/*' -not -path '*/.git/*' -print | sort)

if [[ ${#items[@]} -eq 0 ]]; then
  rules='[]'
else
  rules=$(printf '%s\n' "${items[@]}" | jq -s '.')
fi

jq -n \
  --arg rules_root "$rules_root" \
  --argjson rules "$rules" \
  '{rules_root:$rules_root,total:($rules|length),rules:$rules}'
