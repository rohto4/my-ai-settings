#!/usr/bin/env bash
# Enumerate skill files from explicit roots and emit JSON to stdout.
# Usage: scan-skills.sh <skills-root> [<skills-root> ...]

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: scan-skills.sh <skills-root> [<skills-root> ...]" >&2
  exit 2
fi

for dependency in find sort awk jq stat date; do
  if ! command -v "$dependency" >/dev/null 2>&1; then
    echo "Missing dependency: $dependency" >&2
    exit 2
  fi
done

extract_field() {
  local file="$1" field="$2"
  awk -v field="$field" '
    BEGIN { frontmatter = 0 }
    /^---$/ { frontmatter++; next }
    frontmatter == 1 && index($0, field ":") == 1 {
      value = substr($0, length(field) + 2)
      sub(/^[[:space:]]+/, "", value)
      gsub(/^"|"$/, "", value)
      print value
      exit
    }
    frontmatter >= 2 { exit }
  ' "$file"
}

get_mtime() {
  local file="$1" seconds
  seconds=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null)
  date -u -d "@$seconds" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null ||
    date -u -r "$seconds" +%Y-%m-%dT%H:%M:%SZ
}

all_skills='[]'
root_summaries='[]'

for requested_root in "$@"; do
  if [[ ! -d "$requested_root" ]]; then
    echo "Skills root not found: $requested_root" >&2
    exit 1
  fi

  root=$(cd "$requested_root" && pwd -P)
  items=()
  while IFS= read -r file; do
    items+=("$(jq -n \
      --arg root "$root" \
      --arg path "$file" \
      --arg name "$(extract_field "$file" name)" \
      --arg description "$(extract_field "$file" description)" \
      --arg mtimeUtc "$(get_mtime "$file")" \
      '{root:$root,path:$path,name:$name,description:$description,mtimeUtc:$mtimeUtc}')")
  done < <(find "$root" -type f -name 'SKILL.md' -not -path '*/.git/*' -print | sort)

  if [[ ${#items[@]} -eq 0 ]]; then
    root_skills='[]'
  else
    root_skills=$(printf '%s\n' "${items[@]}" | jq -s '.')
  fi

  count=$(jq 'length' <<<"$root_skills")
  all_skills=$(jq -n --argjson current "$all_skills" --argjson added "$root_skills" '$current + $added')
  root_summaries=$(jq -n \
    --argjson current "$root_summaries" \
    --arg root "$root" \
    --argjson count "$count" \
    '$current + [{root:$root,count:$count}]')
done

jq -n \
  --argjson scan_summary "$root_summaries" \
  --argjson skills "$all_skills" \
  '{scan_summary:$scan_summary,total:($skills|length),skills:$skills}'
