import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

const cli = path.resolve("dist/src/cli.js");
const root = path.resolve("test/fixtures/root");

test("CLI emits JSON for allowed check", () => {
  const output = execFileSync(process.execPath, [cli, "check", path.join(root, "allowed/file.txt"), "--root", root, "--allow", "allowed/**", "--json"], { encoding: "utf8" });
  const decision = JSON.parse(output);
  assert.equal(decision.ok, true);
});

test("CLI returns non-zero for denied check", () => {
  const result = spawnSync(process.execPath, [cli, "check", path.join(root, "blocked/secret.txt"), "--root", root, "--allow", "**", "--deny", "blocked/**"], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /DENY/);
});
