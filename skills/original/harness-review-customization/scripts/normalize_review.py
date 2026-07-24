#!/usr/bin/env python3
"""Normalize harness HTML review exports without modifying the target project."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


ID_PATTERN = re.compile(r"^\[(?P<id>[A-Za-z0-9._-]+)\]\s*(?P<name>.*)$")


def from_json(data: dict) -> list[dict]:
    if data.get("schema_version") != 1 or not isinstance(data.get("sections"), list):
        raise ValueError("unsupported review export")
    items = []
    for row in data["sections"]:
        if not isinstance(row, dict):
            raise ValueError("section must be an object")
        items.append(
            {
                "section_id": str(row.get("section_id", "")),
                "component_id": str(row.get("component_id", "")),
                "component_name": str(row.get("component_name", "")),
                "comment": str(row.get("comment", "")).strip(),
            }
        )
    return items


def from_text(text: str) -> list[dict]:
    items = []
    current = None
    for raw in text.splitlines():
        match = ID_PATTERN.match(raw.strip())
        if match:
            if current:
                current["comment"] = "\n".join(current.pop("lines")).strip()
                items.append(current)
            current = {
                "section_id": "chat-paste",
                "component_id": match.group("id"),
                "component_name": match.group("name").strip(),
                "lines": [],
            }
        elif current is not None:
            line = raw
            if line.strip().startswith("コメント:"):
                line = line.split("コメント:", 1)[1].lstrip()
            current["lines"].append(line)
    if current:
        current["comment"] = "\n".join(current.pop("lines")).strip()
        items.append(current)
    return items


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    args = parser.parse_args()
    try:
        text = args.input.read_text(encoding="utf-8-sig")
        try:
            items = from_json(json.loads(text))
            source_format = "json"
        except json.JSONDecodeError:
            items = from_text(text)
            source_format = "text"
        output = {
            "schema_version": 1,
            "source_format": source_format,
            "items": items,
            "non_empty": sum(bool(item["comment"]) for item in items),
            "requires_human_classification": True,
            "mutated_files": [],
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))
        return 0 if items else 1
    except (OSError, UnicodeError, ValueError) as exc:
        print(json.dumps({"status": "blocked", "reason": str(exc)}, ensure_ascii=False, indent=2))
        return 2


if __name__ == "__main__":
    sys.exit(main())
