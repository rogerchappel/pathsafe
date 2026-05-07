#!/usr/bin/env node
import { checkBatch, checkPath, findConfig, inputStream, loadConfig, mergeOptions } from "./index.js";
import type { PathsafeOptions, SymlinkPolicy } from "./types.js";

interface ParsedArgs {
  command?: string;
  path?: string;
  root?: string;
  allow: string[];
  deny: string[];
  symlinkPolicy?: SymlinkPolicy;
  config?: string;
  input?: string;
  json: boolean;
  help: boolean;
}

function usage(): string {
  return `pathsafe - explainable local path boundary checks

Usage:
  pathsafe check <path> --root <dir> [--allow glob] [--deny glob] [--symlink-policy follow|refuse|ignore] [--json]
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
  if (args.command === "check") args.path = argv.shift();

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    switch (arg) {
      case "--root": args.root = next; i += 1; break;
      case "--allow": if (next) args.allow.push(next); i += 1; break;
      case "--deny": if (next) args.deny.push(next); i += 1; break;
      case "--config": args.config = next; i += 1; break;
      case "--input": args.input = next; i += 1; break;
      case "--symlink-policy": args.symlinkPolicy = next as SymlinkPolicy; i += 1; break;
      case "--json": args.json = true; break;
      case "-h":
      case "--help": args.help = true; break;
      default: throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function human(decision: { ok: boolean; input: string; reason: string; message: string; relativePath?: string }): string {
  const status = decision.ok ? "ALLOW" : "DENY";
  const rel = decision.relativePath ? ` (${decision.relativePath})` : "";
  return `${status} ${decision.input}${rel}: ${decision.reason} - ${decision.message}`;
}

function optionsFromArgs(args: ParsedArgs): PathsafeOptions {
  const configPath = args.config ?? findConfig();
  const config = configPath ? loadConfig(configPath) : {};
  return mergeOptions(config, {
    root: args.root,
    allow: args.allow.length ? args.allow : undefined,
    deny: args.deny.length ? args.deny : undefined,
    symlinkPolicy: args.symlinkPolicy
  });
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
