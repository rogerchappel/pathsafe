export type SymlinkPolicy = "follow" | "refuse" | "ignore";

export type PathsafeReasonCode =
  | "ROOT_CONTAINMENT_PASSED"
  | "OUTSIDE_ROOT"
  | "DENY_MATCH"
  | "ALLOW_MATCH"
  | "NO_ALLOW_MATCH"
  | "SYMLINK_REFUSED"
  | "INPUT_MISSING"
  | "ROOT_MISSING"
  | "CONFIG_ERROR";

export interface PathsafeRuleMatch {
  pattern: string;
  source: "allow" | "deny";
}

export interface PathsafeDecision {
  ok: boolean;
  input: string;
  root: string;
  absolutePath: string;
  realPath?: string;
  relativePath?: string;
  symlinkPolicy: SymlinkPolicy;
  reason: PathsafeReasonCode;
  message: string;
  matchedRule?: PathsafeRuleMatch;
  checks: Array<{
    code: PathsafeReasonCode;
    ok: boolean;
    message: string;
    pattern?: string;
  }>;
}

export interface PathsafeOptions {
  root: string;
  allow?: string[];
  deny?: string[];
  symlinkPolicy?: SymlinkPolicy;
  cwd?: string;
}

export interface PathsafeConfig {
  root?: string;
  allow?: string[];
  deny?: string[];
  symlinkPolicy?: SymlinkPolicy;
}

export interface BatchInput {
  path: string;
  root?: string;
  allow?: string[];
  deny?: string[];
  symlinkPolicy?: SymlinkPolicy;
}
