import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function resolveRoot(root: string, cwd = process.cwd()): string {
  return path.resolve(cwd, root);
}

export function resolveInput(input: string, root: string, cwd = process.cwd()): string {
  return path.isAbsolute(input) ? path.resolve(input) : path.resolve(cwd, input);
}

export function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

export function relativePath(root: string, target: string): string {
  const rel = path.relative(root, target);
  return rel === "" ? "." : toPosixPath(rel);
}

export function isWithinRoot(root: string, target: string): boolean {
  const rel = path.relative(root, target);
  return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}

export function safeRealpath(target: string): string | undefined {
  try {
    return fs.realpathSync.native(target);
  } catch {
    return undefined;
  }
}

export function pathFromMaybeFileUrl(value: string): string {
  if (value.startsWith("file://")) {
    return fileURLToPath(value);
  }
  return value;
}
