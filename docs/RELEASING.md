# Releasing

`pathsafe` is distributed as the public npm package
[`@rogerchappel/pathsafe`](https://www.npmjs.com/package/@rogerchappel/pathsafe). A
tagged release publishes to npm first and then creates the matching GitHub
release with the package tarball attached.

## Maintainer release

1. Confirm npm trusted publishing allows the `Release` workflow in this
   repository to publish `@rogerchappel/pathsafe`.
2. Update `package.json` and `package-lock.json` to the intended version and
   merge that reviewed change to `main`.
3. Run `npm ci` and `npm run release:check` from the release commit.
4. Create and push the exact matching tag, for example version `0.2.0` must use
   tag `v0.2.0`.
5. Review the `Release` workflow and confirm both the npm version and GitHub
   release exist.

The workflow validates the package name, tag/version match, complete package
contents, and ReleaseBox configuration, then creates and verifies exactly one
package tarball before `npm publish`. The exact validated tarball path is passed
to GitHub release creation. The pull-request dry run exercises the same
non-publishing staging checks. Publication uses npm trusted publishing with
provenance; no long-lived npm token is expected.

The pull-request dry run is triggered by every input class used by
`npm run release:check` or included in the npm package: source and tests,
TypeScript configuration, support scripts, examples and demos, documentation,
packed root files, package metadata, ReleaseBox configuration, and release
workflows. `test/release-contract.test.mjs` parses the workflow path filters and
keeps representative files from each class covered as these surfaces evolve.

## Recovery

- If validation, artifact staging, or npm publication fails, fix the cause without reusing or
  moving a published tag. Delete an unpublished failed tag if necessary, merge
  the correction, and create a new tag for the corrected release commit.
- If npm publication succeeds but GitHub release creation fails, do not rerun
  the whole workflow because npm versions are immutable. Download or recreate
  the tarball from the tagged commit, generate the release notes, and create
  the GitHub release for that existing tag manually.
- Never unpublish and replace a version as routine recovery. Publish a new
  patch version when package contents need correction.

Before any recovery action, check npm and GitHub independently so an already
published immutable npm version is not treated as an unpublished attempt.
