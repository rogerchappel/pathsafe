import { readFile } from "node:fs/promises";

export function validateReleaseContract({ config, workflow }) {
  const errors = [];
  if (config.release?.publishNpm !== true) {
    errors.push("releasebox.config.json must enable release.publishNpm");
  }

  const requiredInOrder = [
    "ReleaseBox readiness check",
    "Run release checks",
    "Validate release identity",
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
  return errors;
}

export async function checkReleaseContract(root = new URL("../", import.meta.url)) {
  const config = JSON.parse(await readFile(new URL("releasebox.config.json", root), "utf8"));
  const workflow = await readFile(new URL(".github/workflows/release.yml", root), "utf8");
  const errors = validateReleaseContract({ config, workflow });
  if (errors.length) throw new Error(errors.join("\n"));
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await checkReleaseContract();
  console.log("release contract check passed");
}
