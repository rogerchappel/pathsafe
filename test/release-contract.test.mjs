import assert from "node:assert/strict";
import test from "node:test";
import {
  checkReleaseContract,
  parsePullRequestPaths,
  validateReleaseContract,
  validateReleaseDryRunPaths,
} from "../scripts/release-contract.mjs";

test("repository release contract is internally consistent", async () => {
  await checkReleaseContract();
});

test("release dry-run paths cover every checked and packed input class", () => {
  const workflow = `
  pull_request:
    paths:
      - src/**
      - test/**
      - tsconfig.json
      - scripts/**
      - examples/**
      - demo/**
      - docs/**
      - README.md
      - LICENSE
      - SECURITY.md
      - CONTRIBUTING.md
      - CHANGELOG.md
      - CODE_OF_CONDUCT.md
      - ROADMAP.md
      - package.json
      - package-lock.json
      - releasebox.config.json
      - .github/workflows/release*.yml
`;
  assert.deepEqual(validateReleaseDryRunPaths(workflow), []);
  assert(parsePullRequestPaths(workflow).includes("test/**"));
});

test("release dry-run paths report a representative omitted input", () => {
  const workflow = `
  pull_request:
    paths:
      - package.json
`;
  const errors = validateReleaseDryRunPaths(workflow);
  assert(errors.some((error) => error.includes("src/check.ts")));
  assert(errors.some((error) => error.includes("test/check.test.ts")));
  assert(errors.some((error) => error.includes("scripts/package-smoke.sh")));
  assert(errors.some((error) => error.includes("README.md")));
});

test("contract rejects publishing before validation", () => {
  const workflow = `
- name: Publish package to npm
  run: npm publish --provenance --access public
- name: Validate release identity
  run: echo \"\${GITHUB_REF_NAME#v} \$(npm pkg get name) \$(npm pkg get version)\"
- name: Create GitHub release
- name: ReleaseBox readiness check
- name: Run release checks
`;
  const errors = validateReleaseContract({ config: { release: { publishNpm: true } }, workflow });
  assert(errors.some((error) => error.includes("ordered step")));
});

test("contract rejects disabled npm publication", () => {
  const errors = validateReleaseContract({ config: { release: { publishNpm: false } }, workflow: "" });
  assert(errors.some((error) => error.includes("publishNpm")));
});

const validArtifactStep = `
- name: Stage release artifact
  id: package
  run: |
    pack_json="$(npm pack --json)"
    node -e 'if (result.length !== 1) process.exit(1)'
    test -f "$artifact_path"
    tar -tzf "$artifact_path"
    echo "artifact_path=$artifact_path" >> "$GITHUB_OUTPUT"
`;

const validWorkflow = `
- name: ReleaseBox readiness check
- name: Run release checks
- name: Validate release identity
  run: echo "\${GITHUB_REF_NAME#v} $(npm pkg get name) $(npm pkg get version)"
${validArtifactStep}
- name: Publish package to npm
  run: npm publish --provenance --access public
- name: Create GitHub release
  run: gh release create "$GITHUB_REF_NAME" "\${{ steps.package.outputs.artifact_path }}"
`;

const config = { release: { publishNpm: true } };

test("contract accepts validated artifact staging before publication", () => {
  assert.deepEqual(validateReleaseContract({ config, workflow: validWorkflow }), []);
});

test("contract rejects npm pack dry-run as artifact staging", () => {
  const workflow = validWorkflow.replace("npm pack --json", "npm pack --dry-run");
  const errors = validateReleaseContract({ config, workflow });
  assert(errors.some((error) => error.includes("npm pack --json")));
});

test("contract rejects a workflow that omits artifact creation", () => {
  const workflow = validWorkflow.replace(validArtifactStep, "");
  const errors = validateReleaseContract({ config, workflow });
  assert(errors.some((error) => error.includes("missing artifact staging")));
});

test("contract rejects artifact creation after npm publication", () => {
  const workflow = validWorkflow.replace(validArtifactStep, "").replace(
    "- name: Create GitHub release",
    `${validArtifactStep}\n- name: Create GitHub release`,
  );
  const errors = validateReleaseContract({ config, workflow });
  assert(errors.some((error) => error.includes("ordered step")));
});

test("contract rejects an unchecked wildcard passed to the GitHub release", () => {
  const workflow = validWorkflow.replace('"${{ steps.package.outputs.artifact_path }}"', "./*.tgz");
  const errors = validateReleaseContract({ config, workflow });
  assert(errors.some((error) => error.includes("unchecked artifact wildcard")));
});
