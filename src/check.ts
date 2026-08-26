import { assertSymlinkPolicy } from "./config.js";
import { firstGlobMatch } from "./glob.js";
import { canonicalizePath, isWithinRoot, relativePath, resolveInput, resolveRoot } from "./path-utils.js";
import { findSymlinkInPath } from "./symlink.js";
import type { PathsafeDecision, PathsafeOptions, PathsafeReasonCode, SymlinkPolicy } from "./types.js";

function fail(base: Omit<PathsafeDecision, "ok" | "checks"> & { checks?: PathsafeDecision["checks"] }): PathsafeDecision {
  return { ...base, ok: false, checks: base.checks ?? [] };
}

function pass(base: Omit<PathsafeDecision, "ok" | "checks"> & { checks?: PathsafeDecision["checks"] }): PathsafeDecision {
  return { ...base, ok: true, checks: base.checks ?? [] };
}

export function checkPath(input: string, options: PathsafeOptions): PathsafeDecision {
  const cwd = options.cwd ?? process.cwd();
  const configuredPolicy: unknown = options.symlinkPolicy;
  let symlinkPolicy: SymlinkPolicy = "follow";
  let policyError: string | undefined;
  try {
    assertSymlinkPolicy(configuredPolicy);
    symlinkPolicy = configuredPolicy ?? "follow";
  } catch (error) {
    policyError = error instanceof Error ? error.message : String(error);
  }
  const allow = options.allow?.length ? options.allow : ["**"];
  const deny = options.deny ?? [];
  const checks: PathsafeDecision["checks"] = [];

  if (!input) {
    const resolvedRoot = options.root ? resolveRoot(options.root, cwd) : "";
    return fail({ input, root: resolvedRoot, absolutePath: resolveInput(input, resolvedRoot, cwd), symlinkPolicy, reason: "INPUT_MISSING", message: "No input path was provided.", checks });
  }
  if (!options.root) {
    return fail({ input, root: "", absolutePath: resolveInput(input, "", cwd), symlinkPolicy, reason: "ROOT_MISSING", message: "A root directory is required.", checks });
  }

  const configuredRoot = resolveRoot(options.root, cwd);
  const root = symlinkPolicy === "follow" ? canonicalizePath(configuredRoot) : configuredRoot;
  const absolutePath = resolveInput(input, configuredRoot, cwd);

  if (policyError) {
    checks.push({ code: "CONFIG_ERROR", ok: false, message: policyError });
    return fail({ input, root, absolutePath, symlinkPolicy, reason: "CONFIG_ERROR", message: policyError, checks });
  }

  if (symlinkPolicy === "refuse") {
    const symlink = findSymlinkInPath(absolutePath);
    if (symlink.found) {
      checks.push({ code: "SYMLINK_REFUSED", ok: false, message: `Path crosses symlink: ${symlink.path}` });
      return fail({ input, root, absolutePath, symlinkPolicy, reason: "SYMLINK_REFUSED", message: `Path crosses symlink: ${symlink.path}` , checks });
    }
  }

  const realPath = symlinkPolicy === "follow" ? canonicalizePath(absolutePath) : undefined;
  const containmentTarget = realPath ?? absolutePath;
  const inside = isWithinRoot(root, containmentTarget);
  checks.push({ code: inside ? "ROOT_CONTAINMENT_PASSED" : "OUTSIDE_ROOT", ok: inside, message: inside ? "Path is inside the configured root." : "Path resolves outside the configured root." });
  if (!inside) {
    return fail({ input, root, absolutePath, realPath, symlinkPolicy, reason: "OUTSIDE_ROOT", message: "Path is outside the configured root.", checks });
  }

  const rel = relativePath(root, containmentTarget);
  const denyMatch = firstGlobMatch(rel, deny);
  if (denyMatch) {
    checks.push({ code: "DENY_MATCH", ok: false, message: `Denied by pattern ${denyMatch}.`, pattern: denyMatch });
    return fail({ input, root, absolutePath, realPath, relativePath: rel, symlinkPolicy, reason: "DENY_MATCH", message: `Denied by pattern ${denyMatch}.`, matchedRule: { pattern: denyMatch, source: "deny" }, checks });
  }

  const allowMatch = firstGlobMatch(rel, allow);
  if (!allowMatch) {
    checks.push({ code: "NO_ALLOW_MATCH", ok: false, message: "No allow pattern matched." });
    return fail({ input, root, absolutePath, realPath, relativePath: rel, symlinkPolicy, reason: "NO_ALLOW_MATCH", message: "No allow pattern matched.", checks });
  }

  checks.push({ code: "ALLOW_MATCH", ok: true, message: `Allowed by pattern ${allowMatch}.`, pattern: allowMatch });
  return pass({ input, root, absolutePath, realPath, relativePath: rel, symlinkPolicy, reason: "ALLOW_MATCH" as PathsafeReasonCode, message: `Allowed by pattern ${allowMatch}.`, matchedRule: { pattern: allowMatch, source: "allow" }, checks });
}
