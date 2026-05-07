const SPECIAL = /[.+^${}()|[\]\\]/g;

function escapeRegex(value: string): string {
  return value.replace(SPECIAL, "\\$&");
}

export function globToRegExp(pattern: string): RegExp {
  const normalized = pattern.replace(/\\/g, "/").replace(/^\.\//, "");
  let out = "^";
  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    const next = normalized[i + 1];
    if (char === "*" && next === "*") {
      const after = normalized[i + 2];
      if (after === "/") {
        out += "(?:.*\/)?";
        i += 2;
      } else {
        out += ".*";
        i += 1;
      }
    } else if (char === "*") {
      out += "[^/]*";
    } else if (char === "?") {
      out += "[^/]";
    } else {
      out += escapeRegex(char ?? "");
    }
  }
  out += "$";
  return new RegExp(out);
}

export function matchesGlob(relativePath: string, pattern: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\.\//, "");
  const target = normalized === "." ? "" : normalized;
  return globToRegExp(pattern).test(target);
}

export function firstGlobMatch(relativePath: string, patterns: string[] = []): string | undefined {
  return patterns.find((pattern) => matchesGlob(relativePath, pattern));
}
