#!/usr/bin/env node
import { checkBatch, checkPath, findConfig, inputStream, loadConfig, mergeOptions } from "./index.js";
import { assertSymlinkPolicy } from "./config.js";
import type { PathsafeOptions } from "./types.js";

interface ParsedArgs {
  command?: string | undefined;
  path?: string | undefined;
  root?: string | undefined;
  allow: string[];
  deny: string[];
  symlinkPolicy?: string | undefined;
  config?: string | undefined;
  input?: string | undefined;
  json: boolean;
  help: boolean;
}

function usage(): string {
  return `pathsafe - explainable local path boundary checks

Usage:
  pathsafe check [options] <path> [options]
  pathsafe batch --root <dir> [--input file.jsonl] [--json]

Options:
  --config <file>             Load .pathsafe.json-compatible config
  --allow <glob>              Allow glob, repeatable (default: **)
  --deny <glob>               Deny glob, repeatable and evaluated before allow
  --symlink-policy <policy>   follow (default), refuse, or ignore
  --json                      Print JSON decision(s)
  -h, --help                  Show help
`;
}

function parse(argv: string[]): ParsedArgs {
  const args: ParsedArgs = { allow: [], deny: [], json: false, help: false };
  args.command = argv.shift();

  const value = (option: string, next: string | undefined): string => {
    if (next === undefined || next.startsWith("-")) throw new Error(`${option} requires a value.`);
    return next;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    const next = argv[i + 1];
    switch (arg) {
      case "--root": args.root = value(arg, next); i += 1; break;
      case "--allow": args.allow.push(value(arg, next)); i += 1; break;
      case "--deny": args.deny.push(value(arg, next)); i += 1; break;
      case "--config": args.config = value(arg, next); i += 1; break;
      case "--input": args.input = value(arg, next); i += 1; break;
      case "--symlink-policy": args.symlinkPolicy = value(arg, next); i += 1; break;
      case "--json": args.json = true; break;
      case "-h":
      case "--help": args.help = true; break;
      default:
        if (args.command === "check" && args.path === undefined && !arg.startsWith("-")) args.path = arg;
        else throw new Error(args.command === "check" && !arg.startsWith("-") ? `check accepts exactly one path; unexpected path: ${arg}` : `Unknown argument: ${arg}`);
    }
  }

  if (args.command === "check" && args.input !== undefined) throw new Error("--input is only valid with batch.");
  return args;
}

function human(decision: { ok: boolean; input: string; reason: string; message: string; relativePath?: string | undefined }): string {
  const status = decision.ok ? "ALLOW" : "DENY";
  const rel = decision.relativePath ? ` (${decision.relativePath})` : "";
  return `${status} ${decision.input}${rel}: ${decision.reason} - ${decision.message}`;
}

function optionsFromArgs(args: ParsedArgs): PathsafeOptions {
  const configPath = args.config ?? findConfig();
  const config = configPath ? loadConfig(configPath) : {};
  const overrides: Partial<PathsafeOptions> = {};
  if (args.root !== undefined) overrides.root = args.root;
  if (args.allow.length) overrides.allow = args.allow;
  if (args.deny.length) overrides.deny = args.deny;
  assertSymlinkPolicy(args.symlinkPolicy, "--symlink-policy");
  if (args.symlinkPolicy !== undefined) overrides.symlinkPolicy = args.symlinkPolicy;
  return mergeOptions(config, overrides);
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  try {
    const args = parse(argv);
    if (args.help || !args.command) {
      console.log(usage());
      return 0;
    }

    const options = optionsFromArgs(args);
    if (args.command === "check") {
      if (!args.path) throw new Error("check requires a path.");
      const decision = checkPath(args.path, options);
      console.log(args.json ? JSON.stringify(decision) : human(decision));
      return decision.ok ? 0 : 1;
    }

    if (args.command === "batch") {
      const decisions = await checkBatch(inputStream(args.input), options);
      for (const decision of decisions) console.log(args.json ? JSON.stringify(decision) : human(decision));
      return decisions.every((decision) => decision.ok) ? 0 : 1;
    }

    throw new Error(`Unknown command: ${args.command}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 2;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
