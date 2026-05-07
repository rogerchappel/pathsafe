import assert from "node:assert/strict";
import test from "node:test";
import { matchesGlob } from "../src/index.js";

test("matches double-star globs across directories", () => {
  assert.equal(matchesGlob("src/deep/file.ts", "src/**"), true);
  assert.equal(matchesGlob("src/deep/file.ts", "test/**"), false);
});

test("matches file extension globs", () => {
  assert.equal(matchesGlob("notes.secret", "**/*.secret"), true);
  assert.equal(matchesGlob("deep/notes.secret", "**/*.secret"), true);
  assert.equal(matchesGlob("deep/notes.txt", "**/*.secret"), false);
});
