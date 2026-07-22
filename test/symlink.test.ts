import assert from "node:assert/strict";
import fs from "node:fs";
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
