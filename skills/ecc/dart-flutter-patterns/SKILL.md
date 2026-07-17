---
name: dart-flutter-patterns
description: Apply idiomatic Dart and Flutter architecture, state, widget, async, performance, and testing patterns. Use when implementing or reviewing a Flutter or Dart code path. Do not use for general UI design direction or non-Dart mobile stacks.
---

# Dart and Flutter Patterns

## Workflow

1. Read repository instructions, pinned versions, existing conventions, and validation commands.
2. Identify the smallest owning boundary and its observable contract.
3. Make the smallest repository-consistent change.
4. Run the narrow checks that cover the changed path.
5. Report commands, observed results, and unverified surfaces.

## Decision guide

- Keep state at the lowest stable owner and preserve the selected state-management pattern.
- Model loading, success, empty, cancellation, and failure explicitly.
- Measure before adding caching, memoization, or custom painting.
- Isolate platform code behind an adapter and test the Dart boundary with fakes.

## Detailed patterns

Read [references/detailed-patterns.md](references/detailed-patterns.md) only when the current task needs the expanded examples and checklists.
