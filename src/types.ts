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
  realPath?: string | undefined;
  relativePath?: string | undefined;
  symlinkPolicy: SymlinkPolicy;
  reason: PathsafeReasonCode;
  message: string;
  matchedRule?: PathsafeRuleMatch | undefined;
  checks: Array<{
    code: PathsafeReasonCode;
    ok: boolean;
    message: string;
    pattern?: string | undefined;
  }>;
}

export interface PathsafeOptions {
  root: string;
  allow?: string[] | undefined;
  deny?: string[] | undefined;
  symlinkPolicy?: SymlinkPolicy | undefined;
  cwd?: string | undefined;
}

export interface PathsafeConfig {
  root?: string | undefined;
  allow?: string[] | undefined;
  deny?: string[] | undefined;
  symlinkPolicy?: SymlinkPolicy | undefined;
}

export interface BatchInput {
  path: string;
  root?: string | undefined;
  allow?: string[] | undefined;
  deny?: string[] | undefined;
  symlinkPolicy?: SymlinkPolicy | undefined;
}
