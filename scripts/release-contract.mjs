import { readFile } from "node:fs/promises";

const artifactRequirements = [
  ["npm pack --json", "create a package artifact with npm pack --json"],
  ["result.length !== 1", "require exactly one npm pack result"],
  ["test -f \"$artifact_path\"", "verify the staged artifact exists"],
  ["tar -tzf \"$artifact_path\"", "verify the staged artifact is a readable tarball"],
  ["artifact_path=$artifact_path", "export the validated artifact path"],
];

function validateArtifactStaging(workflow, label) {
  const errors = [];
  const stageStart = workflow.indexOf("- name: Stage release artifact");
  if (stageStart === -1) return [`${label} is missing artifact staging`];
  const nextStep = workflow.indexOf("\n      - name:", stageStart + 1);
  const stage = workflow.slice(stageStart, nextStep === -1 ? undefined : nextStep);
  if (!stage.includes("id: package")) errors.push(`${label} artifact step must use id: package`);
  for (const [needle, message] of artifactRequirements) {
    if (!stage.includes(needle)) errors.push(`${label} must ${message}`);
  }
  if (stage.includes("npm pack --dry-run")) errors.push(`${label} artifact staging cannot use npm pack --dry-run`);
  return errors;
}

export function validateReleaseContract({ config, workflow, dryRunWorkflow = null }) {
  const errors = [];
  if (config.release?.publishNpm !== true) {
    errors.push("releasebox.config.json must enable release.publishNpm");
  }

  const requiredInOrder = [
    "ReleaseBox readiness check",
    "Run release checks",
    "Validate release identity",
    "Stage release artifact",
    "Publish package to npm",
    "Create GitHub release",
  ];
  let cursor = -1;
  for (const name of requiredInOrder) {
    const next = workflow.indexOf(`- name: ${name}`, cursor + 1);
    if (next === -1) errors.push(`release workflow is missing ordered step: ${name}`);
    else cursor = next;
  }

  if (!workflow.includes('npm publish --provenance --access public')) {
    errors.push("release workflow must publish with npm trusted-publishing provenance");
  }
  for (const guard of ['GITHUB_REF_NAME#v', 'npm pkg get name', 'npm pkg get version']) {
    if (!workflow.includes(guard)) errors.push(`release identity guard is missing: ${guard}`);
  }
  errors.push(...validateArtifactStaging(workflow, "release workflow"));
  if (workflow.includes("./*.tgz") || workflow.includes("*.tgz\n")) {
    errors.push("release workflow cannot pass an unchecked artifact wildcard");
  }
  if (!workflow.includes('"${{ steps.package.outputs.artifact_path }}"')) {
    errors.push("GitHub release must receive the validated artifact path");
  }
  if (dryRunWorkflow !== null) {
    errors.push(...validateArtifactStaging(dryRunWorkflow, "release dry-run workflow"));
    for (const requiredPath of ["scripts/release-contract.mjs", "test/release-contract.test.mjs"]) {
      if (!dryRunWorkflow.includes(`- ${requiredPath}`)) {
        errors.push(`release dry-run pull_request paths must include ${requiredPath}`);
      }
    }
  }
  return errors;
}

export async function checkReleaseContract(root = new URL("../", import.meta.url)) {
  const config = JSON.parse(await readFile(new URL("releasebox.config.json", root), "utf8"));
  const workflow = await readFile(new URL(".github/workflows/release.yml", root), "utf8");
  const dryRunWorkflow = await readFile(new URL(".github/workflows/release-dry-run.yml", root), "utf8");
  const errors = validateReleaseContract({ config, workflow, dryRunWorkflow });
  if (errors.length) throw new Error(errors.join("\n"));
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await checkReleaseContract();
  console.log("release contract check passed");
}
