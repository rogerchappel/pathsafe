# Security Policy

## Supported Versions

`pathsafe` is pre-1.0. Security fixes target the latest published minor version.

## Reporting a Vulnerability

Please report suspected vulnerabilities through GitHub Security Advisories or by opening a minimal private report with:

- affected version or commit
- operating system and filesystem notes
- reproduction steps
- expected and actual decision output

Please do not publish exploit details until there is a fix or documented mitigation.

## Security Model

`pathsafe` performs deterministic local path checks. It is intended to help callers avoid path traversal and unsafe workspace access mistakes.

It is **not**:

- a kernel sandbox
- a permissions or ACL system
- a race-free authorization layer
- a guarantee across all filesystems and mount configurations

For sensitive file writes:

1. Use an explicit absolute or trusted root.
2. Prefer `symlinkPolicy: "refuse"`.
3. Validate immediately before opening the file.
4. Avoid following attacker-controlled path segments.
5. Combine with OS-level permissions or sandboxing where appropriate.
