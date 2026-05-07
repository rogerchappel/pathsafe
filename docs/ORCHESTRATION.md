# Orchestration Notes

This MVP was built as a local-first OSS factory run.

## Constraints

- Repository: `/Users/roger/Developer/my-opensource/pathsafe`
- Target GitHub repo: `rogerchappel/pathsafe`
- Primary branch: `main`
- Package: TypeScript CLI plus reusable library

## Build Order

1. Preserve and expand product intent in `docs/PRD.md`.
2. Add task/orchestration tracking artifacts early.
3. Implement library primitives before CLI wiring.
4. Add fixtures and tests alongside behavior.
5. Harden docs, examples, metadata, and validation.
6. Verify locally before publishing.
7. Push to GitHub and best-effort protect `main`.

## Verification Gate

Run:

```sh
npm install
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

Also run a direct CLI smoke against fixture files and symlinks when the platform supports symlinks.
