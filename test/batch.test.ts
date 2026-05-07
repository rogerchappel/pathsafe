import assert from "node:assert/strict";
import { Readable } from "node:stream";
import path from "node:path";
import test from "node:test";
import { checkBatch } from "../src/index.js";

const root = path.resolve("test/fixtures/root");

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
