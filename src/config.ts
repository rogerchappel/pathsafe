import fs from "node:fs";
import path from "node:path";
import type { PathsafeConfig, PathsafeOptions, SymlinkPolicy } from "./types.js";

const VALID_SYMLINK_POLICIES = new Set<SymlinkPolicy>(["follow", "refuse", "ignore"]);

export function assertSymlinkPolicy(value: unknown, source = "symlinkPolicy"): asserts value is SymlinkPolicy {
  if (value !== undefined && !VALID_SYMLINK_POLICIES.has(value as SymlinkPolicy)) {
    throw new Error(`${source} must be follow, refuse, or ignore.`);
  }
}

export function findConfig(start = process.cwd(), filename = ".pathsafe.json"): string | undefined {
  let current = path.resolve(start);
  while (true) {
    const candidate = path.join(current, filename);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

export function loadConfig(configPath: string): PathsafeConfig {
  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw) as PathsafeConfig;
  if (parsed.allow && !Array.isArray(parsed.allow)) throw new Error("Config allow must be an array.");
  if (parsed.deny && !Array.isArray(parsed.deny)) throw new Error("Config deny must be an array.");
  assertSymlinkPolicy(parsed.symlinkPolicy, "Config symlinkPolicy");
  return parsed;
}

export function mergeOptions(config: PathsafeConfig, overrides: Partial<PathsafeOptions>): PathsafeOptions {
  const root = overrides.root ?? config.root;
  if (!root) throw new Error("Missing required root option.");
  return {
    root,
    allow: overrides.allow ?? config.allow,
    deny: overrides.deny ?? config.deny,
    symlinkPolicy: overrides.symlinkPolicy ?? config.symlinkPolicy,
    cwd: overrides.cwd
  };
}
