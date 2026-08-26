# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Fixed

- `follow` policy now evaluates containment on canonical paths for targets that do not exist yet: symlinked parents are resolved through the deepest existing ancestor, so a pre-write check no longer allows a path that resolves outside the root or denies one inside a root reached through a symlink (for example `/tmp` on macOS).
- `checkPath` without a root returns a `ROOT_MISSING` decision instead of throwing a `TypeError`, making the documented reason code reachable from the library.

## 0.1.0 - 2026-05-08

### Added

- TypeScript library API for explainable path checks.
- `pathsafe check` CLI command.
- `pathsafe batch` JSONL command.
- Root containment, allow globs, deny globs, and deny precedence.
- Symlink policies: `follow`, `refuse`, and `ignore`.
- `.pathsafe.json` config loading.
- Tests, fixtures, smoke scripts, and examples.
