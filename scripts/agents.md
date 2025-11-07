# Bash Script Agent & Style Guide

> Applies to all `scripts/*.sh` (and nested) shell scripts. Technology-neutral core guidance is in the root `agents.md`; this file narrows to Bash authoring and agent conduct for shell automation.

---
## 1. Engagement Scope
Agents may create or modify Bash scripts only when a ticket explicitly covers scripting (e.g. new helper script, enhancing tooling automation). Non-scripting tasks should not trigger incidental shell rewrites unless required for the feature.

## 2. Core Principles (Shell Specific)
1. Fail deliberately: no implicit `set -e`; use structured error handling.
2. Deterministic & portable: prefer POSIX-compatible constructs unless Bash-specific features materially reduce complexity.
3. Minimal surface change: do not refactor unrelated functions.
4. Explicit style compliance: update non‑compliant legacy lines you touch.
5. Rationale comments for unavoidable deviations: `# agent: rationale <brief>`.

## 3. Mandatory Header & Safety Setup
Order at top of every script (after any copyright header if present):
```bash
#!/usr/bin/env bash
# vim: set syntax=bash tabstop=2 softtabstop=2 shiftwidth=2 expandtab smarttab :
set -uo pipefail;
```
Prohibited: `set -e`, `set -euo pipefail`.

## 4. Variable Declaration & Naming
| Type | Form | Example |
|------|------|---------|
| Script-local | lowercase with `declare` | `declare project_root` |
| Function-local | `local` + lowercase | `local tmp_dir` |
| Environment sourced / external contract | UPPERCASE | `AWS_REGION`, `PROJECT` |
| All references | braced | `${project_root}`, `${AWS_REGION}` |

Use `declare -r` for constants; prefer `declare -a` / `-A` for arrays/maps.

## 5. Quoting & Substitution
- Single quote literal strings: `'Building image'`.
- Double quote when interpolating: `"${project_root}/dist"`.
- Wrap entire paths including variables: `"${dir}/file"` (never split quotes around `/`).
- Always quote parameter expansions to prevent globbing / word splitting.
- Use `$(command)` not backticks.

## 6. Statement & Function Style
- Terminate simple commands with `;` where syntactically valid (especially before `then`, after function bodies when inline in lists).
- Function definition: `function my_task() { ... };` trailing semicolon closes for stylistic consistency.
- Prefer guard clauses over nested conditionals.

## 7. Error Handling Pattern
Provide a reusable helper:
```bash
function error_and_die() {
  echo -e "${1}" >&2;
  exit 1;
};
```
Usage patterns:
```bash
some_command || error_and_die "Failed to run some_command";
```
Or explicit block:
```bash
if some_command; then
  do_follow_up;
else
  error_and_die "some_command failed";
fi;
```
Simple do-or-die pipeline:
```bash
build_binary && publish_artifact || error_and_die "Publish failed";
```

## 8. Heredocs & Multi-line Output
- Prefer heredoc (`cat <<EOF ... EOF`) for structured long output (templates, help text).
- Do NOT embed ANSI escape sequences inside heredocs; emit colour outside or via `echo -e`.
- For multi-line messages with colour/newlines: single `echo -e` or `printf` with literal newlines.

## 9. Logging & Output Discipline
- `echo` / `echo -e` for human-readable info.
- `printf` for formatted tables / alignment.
- Send errors to stderr (`>&2`).
- Avoid noisy debug output unless guarded: `[[ -n "${DEBUG:-}" ]] && echo "debug: ..." >&2;`.

## 10. Functions & Scope
- One logical purpose per function; name verbs (`build_image`, `ensure_dependencies`).
- Use `local` for all internal temporaries.
- Return status via exit codes; return data via stdout (captured with `$(...)`).

## 11. Arrays & Maps (Associative)
```bash
declare -a files=("a" "b");
declare -A images=([api]="1.0.0" [web]="2.0.0");
for f in "${files[@]}"; do echo "${f}"; done;
```
Always quote expansions: `"${files[@]}"`.

## 12. Linting & Tooling
Primary linter: ShellCheck (invoked via `scripts/shellscript-linter.sh`).
Optional additional static checks (future): `bashate`, secret scanning (`gitleaks`).
Agents should run (or simulate) ShellCheck and fix new warnings they introduce.

## 13. Common Anti-Patterns (Reject / Refactor)
| Anti-Pattern | Replacement |
|--------------|-------------|
| Unquoted `$var` | `${var}` (double quoted) |
| Backticks ``cmd`` | `$(cmd)` |
| `set -e` | explicit `|| error_and_die` |
| Mixed tabs/spaces | 2 spaces only |
| Splitting quoted path: `"${dir}"/file` | `"${dir}/file"` |
| Silent failures (`|| true`) | handle explicitly or justify with rationale comment |

## 14. Pre-Submission Checklist
Copy this list into PR description if substantial script work occurred.

### Structure & Setup
- [ ] Shebang `#!/usr/bin/env bash` on first line
- [ ] Vim modeline present on second line
- [ ] `set -uo pipefail;` early (no `set -e`)
- [ ] 2-space indentation, no tabs

### Variables & Naming
- [ ] All script-level vars use `declare`
- [ ] Environment vars UPPERCASE
- [ ] Locals inside functions use `local`
- [ ] All expansions braced & quoted

### Quoting & Substitution
- [ ] Single quotes for literals
- [ ] Double quotes only for interpolation
- [ ] Full path strings quoted as one unit
- [ ] Command substitution uses `$(...)`

### Error Handling
- [ ] Has `error_and_die` helper (or central sourced equivalent)
- [ ] No stray `set -e`
- [ ] Critical commands guarded (`|| error_and_die`)

### Output
- [ ] Multi-line output via heredoc or single echo/printf
- [ ] Errors to stderr

### Lint & Style
- [ ] ShellCheck run (no new warnings)
- [ ] Trailing semicolons where stylistically specified
- [ ] Modeline present at EOF if file truncated/rewritten

### Documentation
- [ ] Script purpose comment at top
- [ ] Complex logic commented

**Process:** Read line by line and ensure strict compliance before handover.

## 15. Automation Hooks (Future Enhancements)
- Pre-commit hook to enforce header & `set -uo pipefail`.
- CI step to run ShellCheck across `scripts/**/*.sh`.
- Optional formatting check (e.g. shfmt with 2-space config) – if adopted, add note here.

## 16. Changelog (Bash Guide)
- 2025-11-07: Initial creation from Copilot instruction conversion.

