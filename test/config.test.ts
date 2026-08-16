import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { findConfig, loadConfig, mergeOptions } from "../src/index.js";

test("finds nearest .pathsafe.json", () => {
  const found = findConfig(path.resolve("test/fixtures/root/allowed"));
  assert.ok(found?.endsWith("test/fixtures/root/.pathsafe.json"));
});

test("loads and merges config with CLI overrides", () => {
  const config = loadConfig(path.resolve("test/fixtures/root/.pathsafe.json"));
  const merged = mergeOptions(config, { root: "/tmp/root", deny: ["tmp/**"] });
  assert.equal(merged.root, "/tmp/root");
  assert.deepEqual(merged.allow, ["allowed/**"]);
  assert.deepEqual(merged.deny, ["tmp/**"]);
});

test("rejects invalid config shapes with source-aware errors", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "pathsafe-config-"));
  const configPath = path.join(directory, ".pathsafe.json");
  const cases: Array<[unknown, string]> = [
    [null, "expected a JSON object"],
    [42, "expected a JSON object"],
    [[], "expected a JSON object"],
    [{ root: 42 }, "root must be a string"],
    [{ root: [] }, "root must be a string"],
    [{ allow: "**" }, "allow must be an array of strings"],
    [{ deny: {} }, "deny must be an array of strings"],
    [{ allow: [42] }, "allow must contain only strings"],
    [{ deny: ["tmp/**", null] }, "deny must contain only strings"],
    [{ symlinkPolicy: "sometimes" }, "symlinkPolicy must be follow, refuse, or ignore"]
  ];

  try {
    for (const [value, message] of cases) {
      fs.writeFileSync(configPath, JSON.stringify(value));
      assert.throws(() => loadConfig(configPath), (error: Error) => {
        assert.match(error.message, new RegExp(`^Invalid config ${configPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:`));
        assert.match(error.message, new RegExp(message));
        return true;
      });
    }
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});
