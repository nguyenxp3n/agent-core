# Agent Core

Agent Core is a modular specification and operational framework for AI coding agents. It defines how agents should think, execute multi-step work, and verify outcomes with direct evidence before claiming a task is done.

## The problem it addresses

AI agents often report success because they ran a tool, modified a file, or generated plausible code. But running a command is not the same as verifying that the code compiles, the tests pass, or the requested behavior actually works.

Agent Core establishes explicit boundaries to prevent:
* Unverified completion claims ("done" without verification).
* Hallucinated tools, files, or test outputs.
* Unnecessary complexity and scope creep.
* Speculative fixes stacked on top of broken state.

## Repository structure

The repository contains three foundational layers located in the `skills/` directory:

```text
agent-core/
├── README.md
└── skills/
    ├── principles/
    │   └── AGENTS.md
    ├── universal-execution/
    │   └── SKILL.md
    └── universal-verification/
        └── SKILL.md
```

| Component | Path | Focus |
|---|---|---|
| Principles | `skills/principles/AGENTS.md` | Core behavioral rules and thinking discipline |
| Universal Execution | `skills/universal-execution/SKILL.md` | Step-by-step loop for non-trivial tasks |
| Universal Verification | `skills/universal-verification/SKILL.md` | Evidence collection, active bug hunting, and final audit |

## The three layers

### 1. Principles (`skills/principles/AGENTS.md`)

This layer governs the agent's baseline mindset. It applies to every task regardless of domain.

* **Think before acting:** Inspect the actual workspace and existing code first. Clarify ambiguous constraints rather than inventing requirements.
* **Simplicity first:** Pick the most direct solution that satisfies the goal. Avoid premature abstractions and unnecessary dependencies.
* **Surgical changes:** Touch only what is required. Preserve existing conventions, formatting, and surrounding code.
* **Goal-driven execution:** Define observable criteria for success before writing code.
* **Honesty and transparency:** Never invent facts, tool runs, or test results. Distinguish between what was directly verified and what is merely inferred.
* **Preserve user intent:** Follow the user's constraints and explicit scope instead of replacing them with a personal preference.
* **Verify before completion:** A task is complete only when verified by evidence.

### 2. Universal Execution (`skills/universal-execution/SKILL.md`)

A structured workflow designed for complex or multi-step engineering tasks:

```text
Understand -> Inspect -> Define Success -> Plan -> Execute -> Checkpoint -> Validate -> Complete
```

Key practices defined in this layer:
* **Pre-flight inspection:** Review dependencies, file layouts, and configuration before editing.
* **Checkpoints:** Create recoverable points (commits, stashes, or file backups) before risky or destructive operations.
* **Continuous validation:** Test milestones as they are completed rather than deferring all validation to the end.
* **Failure recovery:** When a change causes a regression, stop immediately and roll back to the last known-good checkpoint before attempting a revised solution.

### 3. Universal Verification (`skills/universal-verification/SKILL.md`)

This layer defines how agents must prove their results through an active audit cycle:

```text
Requirements -> Inspect Actual Result -> Find Issues -> Fix -> Verify -> Re-audit -> Report
```

Key rules:
* **Active error search:** Instead of seeking confirmation bias, the agent actively looks for broken edge cases, missing requirements, regressions, and unintended file edits.
* **Fix and re-audit:** When a defect is resolved, the agent re-audits related components to ensure the fix did not introduce secondary regressions.
* **Circuit breaker:** If an issue remains unresolved after three corrective cycles, the agent stops and reports the blockers to the user instead of spinning indefinitely.

## Evidence hierarchy

Agent Core defines three levels of evidence. Higher levels take precedence:

* **Strong:** Direct command execution output, build logs, passing test suites, file diffs, and visual verification of rendered artifacts.
* **Medium:** Static analysis, lint checks, type checks, and schema validation.
* **Weak:** Plausibility, static reasoning alone, or assertions like "the logic looks sound."

Agents must not rely on weak evidence when strong evidence can be obtained through available tools.

## Verification status definitions

When reporting completion, outcomes must be classified into one of four states:

| Status | Definition |
|---|---|
| `PASS` | Requirement verified through direct evidence. |
| `FAIL` | Requirement tested and failed to satisfy criteria. |
| `PARTIAL` | Some criteria verified, but parts of the requirement remain incomplete. |
| `UNVERIFIED` | Tooling or context was insufficient to confirm the result. |

Uncertainty or lack of test tooling must be reported as `UNVERIFIED`, never promoted to `PASS`.

## How to adopt Agent Core

Agent Core is vendor-neutral and works with any modern AI coding assistant or autonomous agent framework.

### Claude Code

Point your project instructions to the skills directory in your `CLAUDE.md`:

```markdown
# Agent Guidelines
Before executing tasks, follow the principles and workflows defined in:
- skills/principles/AGENTS.md
- skills/universal-execution/SKILL.md
- skills/universal-verification/SKILL.md
```

### Cursor

Add Agent Core to your `.cursorrules` or `.cursor/rules/agent-core.mdc`:

```markdown
Read and apply the rules in skills/principles/AGENTS.md for all code modifications.
For multi-step refactoring, follow skills/universal-execution/SKILL.md.
Before reporting completion, run the verification workflow in skills/universal-verification/SKILL.md.
```

### Antigravity and Gemini CLI

Copy or link the skill folders directly into your active skills configuration:

```powershell
Copy-Item -Recurse skills/* ~/.gemini/config/skills/
```

### Custom agent runtimes

Include the markdown files as system context, or inject them as tool definitions in your agent's system prompt:
* Use `skills/principles/AGENTS.md` as the system prompt foundation.
* Attach `skills/universal-execution/SKILL.md` as the task planning guide.
* Trigger `skills/universal-verification/SKILL.md` during the evaluation and handoff step.

## License

MIT
