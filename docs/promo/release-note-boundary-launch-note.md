# Launch Note Draft: Release Note Boundary Checks

Pathsafe can now be demonstrated with a release-note generator scenario:
`demo/release-note-boundary.sh` checks Markdown and asset write candidates
against a release workspace before any write happens.

## Why it is useful

Release automation often writes predictable files such as notes and screenshots.
The demo shows how to allow those paths, deny sensitive names such as `.env`,
and reject traversal attempts that leave the release root.

## Demo command

```sh
bash demo/release-note-boundary.sh
```

## Limitation to keep in the copy

Pathsafe is a deterministic local validation helper, not an OS sandbox or
race-free authorization layer. Validate as close as possible to the actual file
operation.
