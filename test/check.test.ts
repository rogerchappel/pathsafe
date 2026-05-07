import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { checkPath } from "../src/index.js";

const root = path.resolve("test/fixtures/root");

test("allows a path inside root that matches allow", () => {
  const decision = checkPath(path.join(root, "allowed/file.txt"), { root, allow: ["allowed/**"] });
  assert.equal(decision.ok, true);
  assert.equal(decision.reason, "ALLOW_MATCH");
  assert.equal(decision.relativePath, "allowed/file.txt");
});

test("denies traversal outside root", () => {
  const decision = checkPath(path.join(root, "../outside/outside.txt"), { root, allow: ["**"] });
  assert.equal(decision.ok, false);
  assert.equal(decision.reason, "OUTSIDE_ROOT");
});

test("deny rules take precedence over allow rules", () => {
  const decision = checkPath(path.join(root, "blocked/secret.txt"), { root, allow: ["**"], deny: ["blocked/**"] });
  assert.equal(decision.ok, false);
  assert.equal(decision.reason, "DENY_MATCH");
});

test("missing allow match denies", () => {
  const decision = checkPath(path.join(root, "blocked/secret.txt"), { root, allow: ["allowed/**"] });
  assert.equal(decision.ok, false);
  assert.equal(decision.reason, "NO_ALLOW_MATCH");
});
