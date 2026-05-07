import assert from "node:assert/strict";
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
