# Contributing

Thanks for helping make `pathsafe` boring, predictable, and safe.

## Development

```sh
npm install
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Principles

- Keep decisions explainable.
- Prefer small dependency-free behavior unless a dependency clearly improves safety.
- Deny rules must continue to take precedence over allow rules.
- Add fixtures for filesystem edge cases.
- Document security tradeoffs instead of overstating guarantees.

## Pull Requests

Please include:

- the behavior change or bug fixed
- tests for the new behavior
- docs updates when CLI output, config, or security semantics change

## Commit Style

Use small, meaningful commits such as:

- `feat: add config loading`
- `test: cover symlink refusal`
- `docs: explain batch mode`
