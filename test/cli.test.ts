import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const cli = path.resolve("dist/src/cli.js");
const root = path.resolve("test/fixtures/root");
const outsideLink = path.join(root, "allowed/outside-link");

test("CLI emits JSON for allowed check", () => {
  const output = execFileSync(process.execPath, [cli, "check", path.join(root, "allowed/file.txt"), "--root", root, "--allow", "allowed/**", "--json"], { encoding: "utf8" });
  const decision = JSON.parse(output);
  assert.equal(decision.ok, true);
});

test("check accepts options before its path", () => {
  const output = execFileSync(process.execPath, [cli, "check", "--root", root, "--allow", "allowed/**", path.join(root, "allowed/file.txt"), "--json"], { encoding: "utf8" });
  assert.equal(JSON.parse(output).ok, true);
});

test("value-taking options reject a following flag without consuming it", () => {
  for (const option of ["--root", "--allow", "--deny", "--config", "--input", "--symlink-policy"]) {
    const command = option === "--input" ? "batch" : "check";
    const prefix = command === "check" ? [command, path.join(root, "allowed/file.txt")] : [command];
    const result = spawnSync(process.execPath, [cli, ...prefix, option, "--json"], { encoding: "utf8" });
    assert.equal(result.status, 2, option);
    assert.match(result.stderr, new RegExp(`${option} requires a value\\.`), option);
  }
});

test("value-taking options report option-specific errors when values are absent", () => {
  for (const option of ["--root", "--allow", "--deny", "--config", "--input", "--symlink-policy"]) {
    const command = option === "--input" ? "batch" : "check";
    const prefix = command === "check" ? [command, path.join(root, "allowed/file.txt")] : [command];
    const result = spawnSync(process.execPath, [cli, ...prefix, option], { encoding: "utf8" });
    assert.equal(result.status, 2, option);
    assert.match(result.stderr, new RegExp(`${option} requires a value\\.`), option);
  }
});

test("missing deny value cannot consume --json and accidentally allow a path", () => {
  const result = spawnSync(process.execPath, [cli, "check", path.join(root, "blocked/secret.txt"), "--root", root, "--allow", "**", "--deny", "--json"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--deny requires a value\./);
  assert.doesNotMatch(result.stdout, /^ALLOW/m);
});

test("check requires exactly one path and rejects batch-only input", () => {
  const absent = spawnSync(process.execPath, [cli, "check", "--root", root], { encoding: "utf8" });
  assert.equal(absent.status, 2);
  assert.match(absent.stderr, /check requires a path/);

  const surplus = spawnSync(process.execPath, [cli, "check", "one", "two", "--root", root], { encoding: "utf8" });
  assert.equal(surplus.status, 2);
  assert.match(surplus.stderr, /check accepts exactly one path/);

  const input = spawnSync(process.execPath, [cli, "check", "one", "--input", "items.jsonl"], { encoding: "utf8" });
  assert.equal(input.status, 2);
  assert.match(input.stderr, /--input is only valid with batch/);
});

test("CLI returns non-zero for denied check", () => {
  const result = spawnSync(process.execPath, [cli, "check", path.join(root, "blocked/secret.txt"), "--root", root, "--allow", "**", "--deny", "blocked/**"], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /DENY/);
});

test("CLI rejects an invalid symlink policy before checking an outside-target symlink", { skip: !fs.existsSync(outsideLink) }, () => {
  const result = spawnSync(process.execPath, [cli, "check", outsideLink, "--root", root, "--allow", "allowed/**", "--symlink-policy", "typo"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--symlink-policy must be follow, refuse, or ignore/);
  assert.doesNotMatch(result.stdout, /ALLOW_MATCH/);
});
