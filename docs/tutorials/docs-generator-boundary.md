# Docs Generator Boundary Demo

This recipe checks a docs generator write plan before generated files are written
to a repository.

## Run it

```sh
bash demo/docs-generator-boundary.sh
```

The script builds the CLI, creates a temporary docs fixture root, evaluates
`examples/docs-generator-candidates.jsonl`, and writes a JSONL decision report
under `/tmp`.

## Fixture behavior

- `examples/docs-generator-root/docs/tutorials/install.md` is allowed by
  `docs/tutorials/**`.
- `examples/docs-generator-root/docs/reference/options.md` is allowed by
  `docs/reference/**`.
- `examples/docs-generator-root/public/demo/index.html` is allowed by
  `public/demo/**`.
- `examples/docs-generator-root/docs/generated/.cache/report.json` is denied by
  `docs/generated/.cache/**`.
- `examples/outside-docs-root.md` is denied because it sits outside the
  configured root.

The batch command exits non-zero when any candidate is denied. The demo captures
that as expected evidence and verifies allowed, denied, and outside-root reason
codes are all present.
