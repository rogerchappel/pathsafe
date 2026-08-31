import fs from "node:fs";
import readline from "node:readline";
import { checkPath } from "./check.js";
import { assertSymlinkPolicy } from "./config.js";
import type { BatchInput, PathsafeDecision, PathsafeOptions } from "./types.js";

export async function* readJsonLines(input: NodeJS.ReadableStream): AsyncGenerator<BatchInput> {
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber += 1;
    const trimmed = line.trim();
    if (!trimmed) continue;
    let value: unknown;
    try {
      value = JSON.parse(trimmed);
    } catch {
      throw new Error(`Batch input line ${lineNumber}: invalid JSON.`);
    }
    yield validateBatchInput(value, lineNumber);
  }
}

function validateBatchInput(value: unknown, lineNumber: number): BatchInput {
  const source = `Batch input line ${lineNumber}`;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${source}: record must be a JSON object.`);
  }
  const record = value as Record<string, unknown>;
  if (typeof record.path !== "string") throw new Error(`${source}: path must be a string.`);
  if (record.root !== undefined && typeof record.root !== "string") throw new Error(`${source}: root must be a string.`);
  for (const key of ["allow", "deny"] as const) {
    const patterns = record[key];
    if (patterns !== undefined && (!Array.isArray(patterns) || patterns.some((pattern) => typeof pattern !== "string"))) {
      throw new Error(`${source}: ${key} must be an array of strings.`);
    }
  }
  assertSymlinkPolicy(record.symlinkPolicy, `${source}: symlinkPolicy`);
  return record as unknown as BatchInput;
}

export async function checkBatch(input: NodeJS.ReadableStream, defaults: PathsafeOptions): Promise<PathsafeDecision[]> {
  const decisions: PathsafeDecision[] = [];
  for await (const item of readJsonLines(input)) {
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
