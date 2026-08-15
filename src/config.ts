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
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid config ${configPath}: invalid JSON (${detail})`);
  }

  const invalid = (detail: string): never => {
    throw new Error(`Invalid config ${configPath}: ${detail}`);
  };
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    invalid("expected a JSON object.");
  }

  const config = parsed as Record<string, unknown>;
  if (config.root !== undefined && typeof config.root !== "string") invalid("root must be a string.");
  for (const key of ["allow", "deny"] as const) {
    const value = config[key];
    if (value !== undefined && !Array.isArray(value)) invalid(`${key} must be an array of strings.`);
    if (Array.isArray(value) && value.some((item) => typeof item !== "string")) invalid(`${key} must contain only strings.`);
  }
  try {
    assertSymlinkPolicy(config.symlinkPolicy, "symlinkPolicy");
  } catch {
    invalid("symlinkPolicy must be follow, refuse, or ignore.");
  }
  return config as PathsafeConfig;
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
