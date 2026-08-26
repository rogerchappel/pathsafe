import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkPath } from "../src/index.js";
import type { PathsafeOptions } from "../src/types.js";

const root = path.resolve("test/fixtures/root");

test("allows a path inside root that matches allow", () => {
  const decision = checkPath(path.join(root, "allowed/file.txt"), { root, allow: ["allowed/**"] });
  assert.equal(decision.ok, true);
  assert.equal(decision.reason, "ALLOW_MATCH");
  assert.equal(decision.relativePath, "allowed/file.txt");
});

test("follow policy canonicalizes a symlinked configured root", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "pathsafe-root-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const realRoot = path.join(directory, "real-root");
  const linkedRoot = path.join(directory, "root-link");
  fs.mkdirSync(path.join(realRoot, "sub"), { recursive: true });
  fs.writeFileSync(path.join(realRoot, "sub/file.txt"), "fixture\n");
  fs.symlinkSync(realRoot, linkedRoot, "dir");

  const decision = checkPath(path.join(linkedRoot, "sub/file.txt"), {
    root: linkedRoot,
    allow: ["sub/**"],
    symlinkPolicy: "follow"
  });

  assert.equal(decision.ok, true);
  assert.equal(decision.reason, "ALLOW_MATCH");
  assert.equal(decision.root, fs.realpathSync.native(realRoot));
  assert.equal(decision.relativePath, "sub/file.txt");
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

test("missing input reports INPUT_MISSING", () => {
  const decision = checkPath("", { root, allow: ["**"] });
  assert.equal(decision.ok, false);
  assert.equal(decision.reason, "INPUT_MISSING");
});

test("missing root reports ROOT_MISSING instead of throwing", () => {
  const decision = checkPath("some/file.txt", {} as PathsafeOptions);
  assert.equal(decision.ok, false);
  assert.equal(decision.reason, "ROOT_MISSING");
  assert.equal(decision.message, "A root directory is required.");
});

test("follow policy canonicalizes a symlinked root for non-existent targets", (t) => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "pathsafe-check-root-"));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const realRoot = path.join(base, "real");
  fs.mkdirSync(realRoot, { recursive: true });
  const linkedRoot = path.join(base, "linked-root");
  fs.symlinkSync(realRoot, linkedRoot);

  const decision = checkPath(path.join(linkedRoot, "brand-new.txt"), {
    root: linkedRoot,
    allow: ["**"],
    symlinkPolicy: "follow"
  });
  assert.equal(decision.ok, true);
  assert.equal(decision.reason, "ALLOW_MATCH");
  assert.equal(decision.realPath, path.join(realRoot, "brand-new.txt"));
});
