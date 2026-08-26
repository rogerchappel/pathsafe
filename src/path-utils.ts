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

export function canonicalizePath(target: string): string {
  // Canonicalize the deepest existing ancestor and re-append any missing tail
  // components, so containment can be evaluated on canonical paths even when
  // the final target does not exist yet (for example a pre-write check).
  const missing: string[] = [];
  let current = target;
  for (;;) {
    try {
      const real = fs.realpathSync.native(current);
      return missing.length === 0 ? real : path.join(real, ...missing.reverse());
    } catch {
      const parent = path.dirname(current);
      if (parent === current) {
        return path.join(current, ...missing.reverse());
      }
      missing.push(path.basename(current));
      current = parent;
    }
  }
}

export function pathFromMaybeFileUrl(value: string): string {
  if (value.startsWith("file://")) {
    return fileURLToPath(value);
  }
  return value;
}
