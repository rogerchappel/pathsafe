import fs from "node:fs";
import readline from "node:readline";
import { checkPath } from "./check.js";
import { assertSymlinkPolicy } from "./config.js";
import type { BatchInput, PathsafeDecision, PathsafeOptions } from "./types.js";

export async function* readJsonLines(input: NodeJS.ReadableStream): AsyncGenerator<BatchInput> {
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    yield JSON.parse(trimmed) as BatchInput;
  }
}

export async function checkBatch(input: NodeJS.ReadableStream, defaults: PathsafeOptions): Promise<PathsafeDecision[]> {
  const decisions: PathsafeDecision[] = [];
  for await (const item of readJsonLines(input)) {
    assertSymlinkPolicy(item.symlinkPolicy, "Batch symlinkPolicy");
    decisions.push(checkPath(item.path, {
      ...defaults,
      root: item.root ?? defaults.root,
      allow: item.allow ?? defaults.allow,
      deny: item.deny ?? defaults.deny,
      symlinkPolicy: item.symlinkPolicy ?? defaults.symlinkPolicy
    }));
  }
  return decisions;
}

export function inputStream(file?: string): NodeJS.ReadableStream {
  return file ? fs.createReadStream(file, "utf8") : process.stdin;
}
