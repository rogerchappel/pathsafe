import assert from "node:assert/strict";
import test from "node:test";
import { checkReleaseContract, validateReleaseContract } from "../scripts/release-contract.mjs";

test("repository release contract is internally consistent", async () => {
  await checkReleaseContract();
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
