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

test("accepts typed per-record overrides", async () => {
  const stream = Readable.from([JSON.stringify({
    path: path.join(root, "allowed/file.txt"),
    root,
    allow: ["allowed/**"],
    deny: ["blocked/**"],
    symlinkPolicy: "ignore"
  }) + "\n"]);
  const [decision] = await checkBatch(stream, { root, allow: [] });
  assert.equal(decision?.ok, true);
  assert.equal(decision?.symlinkPolicy, "ignore");
});

for (const [name, record, message] of [
  ["non-object record", [], "record must be a JSON object"],
  ["missing path", { root }, "path must be a string"],
  ["non-string path", { path: 123 }, "path must be a string"],
  ["non-string root", { path: "allowed/file.txt", root: 123 }, "root must be a string"],
  ["non-array allow", { path: "allowed/file.txt", allow: "allowed/**" }, "allow must be an array of strings"],
  ["non-string allow entry", { path: "allowed/file.txt", allow: [1] }, "allow must be an array of strings"],
  ["non-array deny", { path: "allowed/file.txt", deny: {} }, "deny must be an array of strings"],
  ["non-string deny entry", { path: "allowed/file.txt", deny: [false] }, "deny must be an array of strings"]
] as const) {
  test(`rejects ${name} with line context`, async () => {
    const stream = Readable.from(["\n", JSON.stringify(record) + "\n"]);
    await assert.rejects(checkBatch(stream, { root }), new RegExp(`Batch input line 2: ${message}`));
  });
}

test("reports invalid JSON with source context", async () => {
  await assert.rejects(checkBatch(Readable.from(["{nope}\n"]), { root }), /Batch input line 1: invalid JSON/);
});

test("batch CLI rejects an invalid item policy before checking an outside-target symlink", { skip: !fs.existsSync(outsideLink) }, () => {
  const input = JSON.stringify({ path: outsideLink, symlinkPolicy: "typo" }) + "\n";
  const result = spawnSync(process.execPath, [cli, "batch", "--root", root, "--allow", "allowed/**"], { input, encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Batch input line 1: symlinkPolicy must be follow, refuse, or ignore/);
  assert.doesNotMatch(result.stdout, /ALLOW_MATCH/);
});
