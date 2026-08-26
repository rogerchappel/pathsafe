import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { canonicalizePath } from "../src/path-utils.js";

test("canonicalizePath resolves symlinked parents for non-existent targets", (t) => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "pathsafe-utils-"));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const real = path.join(base, "real");
  fs.mkdirSync(real, { recursive: true });
  fs.symlinkSync(real, path.join(base, "link"));

  assert.equal(canonicalizePath(path.join(base, "link", "new.txt")), path.join(real, "new.txt"));
  assert.equal(canonicalizePath(path.join(base, "link", "deep", "new.txt")), path.join(real, "deep", "new.txt"));
});

test("canonicalizePath returns the real path for existing targets", (t) => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "pathsafe-utils-"));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const file = path.join(base, "file.txt");
  fs.writeFileSync(file, "x");
  assert.equal(canonicalizePath(file), fs.realpathSync.native(file));
});

test("canonicalizePath rewrites a symlinked root prefix", (t) => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "pathsafe-utils-"));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const real = path.join(base, "real");
  fs.mkdirSync(real, { recursive: true });
  fs.symlinkSync(real, path.join(base, "root-link"));
  const created = path.join(base, "root-link", "made");
  fs.mkdirSync(created, { recursive: true });
  const file = path.join(created, "existing.txt");
  fs.writeFileSync(file, "x");

  assert.equal(canonicalizePath(file), fs.realpathSync.native(file));
  assert.equal(canonicalizePath(path.join(created, "brand-new.txt")), path.join(real, "made", "brand-new.txt"));
});

test("canonicalizePath keeps a lexical path when the deepest ancestor is the filesystem root", () => {
  const result = canonicalizePath(path.join(path.parse(process.cwd()).root, "definitely-not-present-oss-probe"));
  assert.equal(result, path.join(path.parse(process.cwd()).root, "definitely-not-present-oss-probe"));
});
