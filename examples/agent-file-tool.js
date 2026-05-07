import { checkPath } from "pathsafe";

export function assertWritablePath(candidate, workspaceRoot) {
  const decision = checkPath(candidate, {
    root: workspaceRoot,
    allow: ["src/**", "docs/**", "README.md"],
    deny: ["**/.env", "**/secrets/**"],
    symlinkPolicy: "refuse"
  });

  if (!decision.ok) {
    const error = new Error(`Unsafe path: ${decision.reason}`);
    error.decision = decision;
    throw error;
  }

  return decision.absolutePath;
}
