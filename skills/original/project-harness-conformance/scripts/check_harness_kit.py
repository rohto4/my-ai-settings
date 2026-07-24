#!/usr/bin/env python3
"""Read-only structural and scenario inspection for a project harness kit."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


REQUIRED = (
    "profiles/project.profile.json",
    "policy/policy.json",
    "schemas",
    "scenarios",
    "tests",
)


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def inspect(kit: Path) -> dict:
    result = {
        "status": "pass",
        "mode": "read-only-structural",
        "kit": str(kit.resolve()),
        "missing": [],
        "json_files": 0,
        "json_errors": [],
        "scenarios": 0,
        "cases": 0,
        "missing_requests": [],
        "claim": "structural_only",
        "limitations": [
            "No policy decision, runtime sandbox, hook, MCP, network, credential, or external service was exercised."
        ],
    }
    for rel in REQUIRED:
        if not (kit / rel).exists():
            result["missing"].append(rel)

    for path in sorted(kit.rglob("*.json")):
        result["json_files"] += 1
        try:
            load_json(path)
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            result["json_errors"].append({"path": str(path.relative_to(kit)), "error": str(exc)})

    scenario_dir = kit / "scenarios"
    if scenario_dir.is_dir():
        for path in sorted(scenario_dir.glob("*.json")):
            try:
                scenario = load_json(path)
            except (OSError, UnicodeError, json.JSONDecodeError):
                continue
            result["scenarios"] += 1
            cases = scenario.get("cases", [])
            result["cases"] += len(cases) if isinstance(cases, list) else 0
            for case in cases if isinstance(cases, list) else []:
                request = case.get("request")
                if not isinstance(request, str) or not (kit / request).is_file():
                    result["missing_requests"].append(
                        {"scenario": path.name, "case": case.get("id"), "request": request}
                    )

    if result["missing"] or result["json_errors"] or result["missing_requests"]:
        result["status"] = "fail"
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kit", required=True, type=Path)
    args = parser.parse_args()
    if not args.kit.is_dir():
        print(json.dumps({"status": "blocked", "reason": "kit_not_found", "kit": str(args.kit)}, ensure_ascii=False, indent=2))
        return 2
    result = inspect(args.kit)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
