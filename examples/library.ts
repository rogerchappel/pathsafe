import { checkPath } from "pathsafe";

const decision = checkPath("src/index.ts", {
  root: process.cwd(),
  allow: ["src/**"],
  deny: ["**/*.secret"],
  symlinkPolicy: "refuse"
});

if (!decision.ok) {
  throw new Error(decision.message);
}
