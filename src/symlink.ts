import fs from "node:fs";
import path from "node:path";

export interface SymlinkScanResult {
  found: boolean;
  path?: string;
}

export function findSymlinkInPath(target: string): SymlinkScanResult {
  const resolved = path.resolve(target);
  const root = path.parse(resolved).root;
  const parts = resolved.slice(root.length).split(path.sep).filter(Boolean);
  let current = root;

  for (const part of parts) {
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) {
        return { found: true, path: current };
      }
    } catch {
      return { found: false };
    }
  }

  return { found: false };
}
