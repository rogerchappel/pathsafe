import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkPath, type SymlinkPolicy } from "../src/index.js";

const root = path.resolve("test/fixtures/root");
const link = path.join(root, "allowed/outside-link");

test("refuse policy rejects paths that cross symlinks", { skip: !fs.existsSync(link) }, () => {
  const decision = checkPath(link, { root, allow: ["allowed/**"], symlinkPolicy: "refuse" });
  assert.equal(decision.ok, false);
  assert.equal(decision.reason, "SYMLINK_REFUSED");
});

test("follow policy checks real symlink target containment", { skip: !fs.existsSync(link) }, () => {
  const decision = checkPath(link, { root, allow: ["allowed/**"], symlinkPolicy: "follow" });
  assert.equal(decision.ok, false);
  assert.equal(decision.reason, "OUTSIDE_ROOT");
});

test("ignore policy evaluates lexical symlink path", { skip: !fs.existsSync(link) }, () => {
  const decision = checkPath(link, { root, allow: ["allowed/**"], symlinkPolicy: "ignore" });
  assert.equal(decision.ok, true);
  assert.equal(decision.reason, "ALLOW_MATCH");
});

test("invalid runtime policy fails closed with a config error", { skip: !fs.existsSync(link) }, () => {
  const decision = checkPath(link, { root, allow: ["allowed/**"], symlinkPolicy: "typo" as SymlinkPolicy });
  assert.equal(decision.ok, false);
  assert.equal(decision.reason, "CONFIG_ERROR");
  assert.match(decision.message, /must be follow, refuse, or ignore/);
});

interface TestContextLike {
  after(fn: () => void): void;
}

function symlinkFixture(t: TestContextLike): string {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "pathsafe-symlink-"));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const rootDir = path.join(base, "root");
  const outside = path.join(base, "outside");
  const inner = path.join(rootDir, "inner");
  fs.mkdirSync(inner, { recursive: true });
  fs.mkdirSync(outside, { recursive: true });
  fs.symlinkSync(outside, path.join(rootDir, "evil"));
  fs.symlinkSync(inner, path.join(rootDir, "goodlink"));
  return rootDir;
}

test("follow policy resolves non-existent targets through symlinked parents", (t) => {
  const rootDir = symlinkFixture(t);
  const outside = path.join(rootDir, "..", "outside");
  const outsideDecision = checkPath(path.join(rootDir, "evil", "would-be-new.txt"), {
    root: rootDir,
    allow: ["**"],
    symlinkPolicy: "follow"
  });
  assert.equal(outsideDecision.ok, false);
  assert.equal(outsideDecision.reason, "OUTSIDE_ROOT");
  assert.equal(outsideDecision.realPath, path.join(outside, "would-be-new.txt"));

  const insideDecision = checkPath(path.join(rootDir, "goodlink", "brand-new.txt"), {
    root: rootDir,
    allow: ["**"],
    symlinkPolicy: "follow"
  });
  assert.equal(insideDecision.ok, true);
  assert.equal(insideDecision.reason, "ALLOW_MATCH");
});

test("refuse policy rejects non-existent targets that cross symlinked parents", (t) => {
  const rootDir = symlinkFixture(t);
  for (const target of ["evil", "goodlink"]) {
    const decision = checkPath(path.join(rootDir, target, "would-be-new.txt"), {
      root: rootDir,
      allow: ["**"],
      symlinkPolicy: "refuse"
    });
    assert.equal(decision.ok, false);
    assert.equal(decision.reason, "SYMLINK_REFUSED");
  }
});

test("ignore policy evaluates lexical paths for non-existent targets under symlinked parents", (t) => {
  const rootDir = symlinkFixture(t);
  const decision = checkPath(path.join(rootDir, "evil", "would-be-new.txt"), {
    root: rootDir,
    allow: ["**"],
    symlinkPolicy: "ignore"
  });
  assert.equal(decision.ok, true);
  assert.equal(decision.reason, "ALLOW_MATCH");
  assert.equal(decision.relativePath, "evil/would-be-new.txt");
});
