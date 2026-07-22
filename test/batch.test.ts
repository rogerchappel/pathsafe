import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import test from "node:test";
import { checkBatch } from "../src/index.js";

const root = path.resolve("test/fixtures/root");
const cli = path.resolve("dist/src/cli.js");
const outsideLink = path.join(root, "allowed/outside-link");

test("checks JSONL batch input", async () => {
  const stream = Readable.from([
    JSON.stringify({ path: path.join(root, "allowed/file.txt") }) + "\n",
    JSON.stringify({ path: path.join(root, "blocked/secret.txt") }) + "\n"
  ]);
  const decisions = await checkBatch(stream, { root, allow: ["allowed/**"], deny: ["blocked/**"] });
  assert.equal(decisions.length, 2);
  assert.equal(decisions[0]?.ok, true);
  assert.equal(decisions[1]?.ok, false);
  assert.equal(decisions[1]?.reason, "DENY_MATCH");
});

test("batch CLI rejects an invalid item policy before checking an outside-target symlink", { skip: !fs.existsSync(outsideLink) }, () => {
  const input = JSON.stringify({ path: outsideLink, symlinkPolicy: "typo" }) + "\n";
  const result = spawnSync(process.execPath, [cli, "batch", "--root", root, "--allow", "allowed/**"], { input, encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Batch symlinkPolicy must be follow, refuse, or ignore/);
  assert.doesNotMatch(result.stdout, /ALLOW_MATCH/);
});
