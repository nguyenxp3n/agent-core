# Agent Core

Agent Core is a modular specification and operational framework for AI coding agents. It defines how agents should think, execute multi-step work, and verify outcomes with direct evidence before claiming a task is done.

Instead of fragmenting rules across disconnected skills, Agent Core packages three foundational phases (Principles, Execution, and Verification) into a single cohesive skill named `agent-core`.

## Quick install via terminal

Run the one-line installer for your operating system. The installer automatically scans your system, detects installed AI agent environments, and lets you choose where to install:

### Linux, macOS, and WSL

```bash
curl -fsSL https://raw.githubusercontent.com/nguyenxp3n/agent-core/main/install.sh | bash
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/nguyenxp3n/agent-core/main/install.ps1 | iex
```

### Interactive selection

When executed in your terminal, the installer presents an interactive menu:

```text
======================================================
             AGENT-CORE SKILL INSTALLER               
======================================================
Scanning system for AI Agent environments...

  [1] Claude Code            ~/.claude/skills/agent-core          [Detected]
  [2] OpenAI Codex           ~/.codex/skills/agent-core           [Detected]
  [3] Google Gemini / AGY    ~/.gemini/config/skills/agent-core   [Detected]
  [4] Cursor Rules           ~/.cursor/rules/agent-core          
  [5] Current Workspace      ./skills/agent-core                  [Detected]
  [6] All detected environments
  [0] Exit

Choose target(s) [e.g. 1 or 1,2 or 6 for All, 0 to exit]:
```

Selection options:
* Single environment: enter `1` to install to Claude Code only.
* Multiple environments: enter comma-separated numbers like `1, 2` to install to both Claude and Codex.
* All detected: enter `6` to install across all detected environments at once.

---

## The problem it addresses

AI agents often report success because they ran a tool, modified a file, or generated plausible code. But running a command is not the same as verifying that the code compiles, the tests pass, or the requested behavior actually works.

Agent Core establishes explicit boundaries to prevent:
* Unverified completion claims ("done" without verification).
* Hallucinated tools, files, or test outputs.
* Unnecessary complexity and scope creep.
* Speculative fixes stacked on top of broken state.

## Repository structure

The repository contains one primary skill (`agent-core`) with a central orchestrator file and three reference guides:

```text
agent-core/
├── README.md
├── install.sh
├── install.ps1
└── skills/
    └── agent-core/
        ├── SKILL.md
        └── references/
            ├── principles.md
            ├── execution.md
            └── verification.md
```

| Component | Path | Focus |
|---|---|---|
| Master Skill | `skills/agent-core/SKILL.md` | Core orchestrator coordinating all three phases |
| Part 1: Principles | `skills/agent-core/references/principles.md` | Baseline behavioral discipline and cognitive rules |
| Part 2: Execution | `skills/agent-core/references/execution.md` | Eight-phase loop for non-trivial engineering tasks |
| Part 3: Verification | `skills/agent-core/references/verification.md` | Active bug hunting, evidence hierarchy, and final audit |

## One skill, three integrated parts

### Part 1: Principles (`references/principles.md`)

This part governs baseline cognitive discipline for every task:

* **Think before acting:** Inspect workspace files and context first. Clarify ambiguous constraints rather than guessing.
* **Simplicity first:** Pick the most direct solution that satisfies the goal. Avoid premature abstractions and unnecessary dependencies.
* **Surgical changes:** Touch only what is required. Preserve existing conventions, formatting, and surrounding code.
* **Goal-driven execution:** Define observable criteria for success before writing code.
* **Zero fabrication:** Never invent facts, tool runs, or test results. Distinguish between directly verified facts and inferences.
* **Preserve user intent:** Follow the user's constraints and explicit scope instead of replacing them with a personal preference.
* **Verify before completion:** A task is complete only when verified by tangible evidence.

### Part 2: Universal Execution (`references/execution.md`)

A structured workflow designed for complex or multi-step engineering tasks:

```text
Understand -> Inspect -> Define Success -> Plan -> Execute -> Checkpoint -> Validate -> Complete
```

Key practices defined in this phase:
* **Pre-flight inspection:** Review dependencies, file layouts, and configuration before editing.
* **Checkpoints:** Create recoverable points (commits, stashes, or file backups) before risky or destructive operations.
* **Continuous validation:** Test milestones as they are completed rather than deferring all validation to the end.
* **Failure recovery:** When a change causes a regression, stop immediately and roll back to the last known-good checkpoint before attempting a revised solution.

### Part 3: Universal Verification (`references/verification.md`)

An active audit cycle to prove results before declaring completion:

```text
Requirements -> Inspect Actual Result -> Find Issues -> Fix -> Verify -> Re-audit -> Report
```

Key practices defined in this phase:
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

## Manual adoption

If you prefer manual setup rather than the one-line installer:

### Claude Code

Copy the skill to your project or global Claude skills folder:

```bash
cp -r skills/agent-core ~/.claude/skills/
```

Or reference it directly from your `CLAUDE.md`:

```markdown
# Agent Guidelines
Follow the agent-core skill workflow defined in skills/agent-core/SKILL.md.
```

### Antigravity and Gemini CLI

Install the skill into your Gemini skills configuration:

```powershell
Copy-Item -Recurse skills/agent-core ~/.gemini/config/skills/
```

### Cursor

Add Agent Core to your `.cursorrules` or `.cursor/rules/agent-core.mdc`:

```markdown
Apply the agent-core framework from skills/agent-core/SKILL.md for all tasks:
1. Follow Part 1 (Principles) for code modifications.
2. Follow Part 2 (Execution) for multi-step planning.
3. Follow Part 3 (Verification) before declaring completion.
```

### ChatGPT and custom agent pipelines

Include `skills/agent-core/SKILL.md` as the core operational prompt in your system instructions or agent runtime context.

## License

MIT
