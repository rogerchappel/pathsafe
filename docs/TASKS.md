# pathsafe MVP Tasks

## Foundation
- [x] Keep PRD as source of truth.
- [x] Add TypeScript package metadata and build scripts.
- [x] Add orchestration notes and machine-readable run state.

## Library
- [x] Normalize input paths against an explicit root.
- [x] Enforce root containment before allow rules.
- [x] Support allow and deny glob rules with deny precedence.
- [x] Add symlink policy: follow, refuse, or ignore.
- [x] Return explainable decision objects with reason codes.
- [x] Load `.pathsafe.json` config files.
- [x] Process JSONL batches.

## CLI
- [x] `pathsafe check <path>` command.
- [x] `pathsafe batch` command.
- [x] JSON output and human output.
- [x] Exit codes suitable for automation.

## Quality
- [x] Unit tests for traversal, globs, deny precedence, config, batch, and symlinks.
- [x] Fixtures and examples.
- [x] README, SECURITY, CONTRIBUTING, and validation script.
- [x] Verification scripts and smoke tests.

## Release
- [x] Create GitHub repository `rogerchappel/pathsafe`.
- [x] Push directly to `main`.
- [x] Attempt branch protection for `main`.
