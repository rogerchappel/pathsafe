import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowPath = new URL("../.github/workflows/ci.yml", import.meta.url);

test("CI installs dependencies and runs every required validation command", async () => {
  const workflow = await readFile(workflowPath, "utf8");

  for (const command of [
    "npm ci",
    "npm test",
    "npm run check",
    "npm run build",
    "npm run smoke",
    "npm run release:contract",
    "bash scripts/validate.sh",
  ]) {
    assert.match(workflow, new RegExp(`^\\s*- run: ${command.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "m"),
      `CI workflow must run ${command}`);
  }
});

test("CI configures setup-node with the Node version matrix and npm cache", async () => {
  const workflow = await readFile(workflowPath, "utf8");

  assert.match(workflow, /^\s*- uses: actions\/setup-node@\S+$/m);
  assert.match(workflow, /^\s*node-version: \$\{\{ matrix\.node-version \}\}$/m);
  assert.match(workflow, /^\s*cache: npm$/m);
});
