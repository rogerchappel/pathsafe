# pathsafe

Status: in-progress
Decision: selected for 2026-05-08 OSS factory run

## Scorecard

Total: 80/100
Band: build now
Last scored: 2026-05-08
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 16/20 | CLIs and agents frequently need to enforce safe workspace paths before reading/writing files. |
| Demand signal | 14/20 | Path traversal bugs, sandbox tooling, and local agent permissions make this a recurring need. |
| V1 buildability | 19/20 | Path normalization, allow/deny rules, symlink policy, and fixtures are tractable. |
| Differentiation | 13/15 | Tiny reusable CLI/library focused on local agent file boundaries with readable decisions. |
| Agentic workflow leverage | 12/15 | Good building block for safer coding agents, generators, and file tools. |
| Distribution potential | 6/10 | Small but useful package with clear examples. |

## Pitch

`pathsafe` answers one deceptively important question before your tool touches disk: “is this path actually allowed?” 🧭

## Why It Matters

`../`, symlinks, case differences, glob surprises, and workspace roots make file safety easy to get wrong. Local-first tools and agents need boring, deterministic path boundary checks with explainable decisions.

## Attribution / Inspiration

Inspired by sandbox boundary checks, path traversal mitigations, and agent file tool policies; implementation should be original and dependency-light.

## V1 Scope

- TypeScript CLI plus reusable library.
- `pathsafe check <path> --root <dir> [--allow glob] [--deny glob]`.
- Canonical path normalization with optional symlink following/refusal.
- Explainable allow/deny decision object with reason codes.
- Batch mode from JSON lines.
- Config file `.pathsafe.json`.
- Tests for traversal, symlinks, case sensitivity notes, globs, deny precedence, and batch output.
- README with examples for CLIs and agent file tools.

## Out of Scope

- OS sandboxing, kernel-level controls, ACL management, network paths, or guaranteed cross-filesystem security beyond documented checks.

## Verification

- `npm test`
- `npm run check`
- `npm run build`
- `npm run smoke`
- Real CLI smoke with fixture paths and symlinks where supported.

## Agent Prompt

Build a polished local-first TypeScript CLI/library named `pathsafe` from this PRD. Make safety decisions transparent and tests strong. Publish as `rogerchappel/pathsafe` after verification.
