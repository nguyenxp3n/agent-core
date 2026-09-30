# Agent Core

Agent Core is a modular specification and operational framework for AI coding agents. It defines how agents should think, execute multi-step work, and verify outcomes with direct evidence before claiming a task is done.

Agent Core is available in two complementary formats:
1. **As an interactive Skill:** Directly usable by Claude Code, OpenAI Codex, Google Gemini, and Cursor.
2. **As an MCP Server Plugin:** Callable by Claude Desktop, Cursor, and ChatGPT via Model Context Protocol (MCP) and Custom GPT Actions.

## Quick install via terminal

Run the one-line installer for your operating system. The installer scans your system, detects active AI environments, and lets you choose where to install:

### Linux, macOS, and WSL

```bash
curl -fsSL https://raw.githubusercontent.com/nguyenxp3n/agent-core/refs/heads/main/install.sh | bash
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/nguyenxp3n/agent-core/refs/heads/main/install.ps1 | iex
```

### Interactive selection menu

When executed in your terminal, the installer detects which agents and apps are present on your machine:

```text
======================================================
          AGENT-CORE SKILL & PLUGIN INSTALLER         
======================================================
Scanning system for AI Agent & Client environments...

  [1] Claude Code              ~/.claude/skills/agent-core          [Detected]
  [2] OpenAI Codex             ~/.codex/skills/agent-core           [Detected]
  [3] Google Gemini / AGY      ~/.gemini/config/skills/agent-core   [Detected]
  [4] Cursor Rules             ~/.cursor/rules/agent-core          
  [5] Current Workspace        ./skills/agent-core                  [Detected]
  [6] Claude Desktop (MCP)     ~/.agent-core/mcp                    [Detected]
  [7] All detected environments
  [0] Exit

Choose target(s) [e.g. 1 or 1,2 or 7 for All, 0 to exit]:
```

Selection options:
* Single target: enter `1` to install to Claude Code only.
* Multiple targets: enter comma-separated numbers like `1, 2` to install to both Claude Code and Codex.
* Claude Desktop Plugin: enter `6` to configure the MCP server into your Claude Desktop configuration automatically.
* All detected: enter `7` to install across all detected environments at once.

---

## The problem it addresses

AI agents often report success because they ran a tool, modified a file, or generated plausible code. But running a command is not the same as verifying that the code compiles, the tests pass, or the requested behavior actually works.

Agent Core establishes explicit boundaries to prevent:
* Unverified completion claims ("done" without verification).
* Hallucinated tools, files, or test outputs.
* Unnecessary complexity and scope creep.
* Speculative fixes stacked on top of broken state.

## Repository structure

```text
agent-core/
├── README.md
├── install.sh
├── install.ps1
├── mcp/
│   ├── package.json
│   └── server.js
├── integrations/
│   └── chatgpt/
│       ├── openapi.yaml
│       └── instructions.md
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
| MCP Plugin Server | `mcp/server.js` | Zero-dependency MCP server providing callable tools |
| ChatGPT Integration | `integrations/chatgpt/` | OpenAPI 3.1.0 schema and Custom GPT instructions |
| Part 1: Principles | `skills/agent-core/references/principles.md` | Baseline behavioral discipline and cognitive rules |
| Part 2: Execution | `skills/agent-core/references/execution.md` | Eight-phase loop for non-trivial engineering tasks |
| Part 3: Verification | `skills/agent-core/references/verification.md` | Active bug hunting, evidence hierarchy, and final audit |

---

## MCP Server and Plugin Tools

When running as an MCP server, Agent Core exposes 5 callable tools to your AI assistant:

| Tool Name | Purpose |
|---|---|
| `get_principles` | Retrieve core cognitive principles (thinking, simplicity, surgical changes, zero fabrication). |
| `create_execution_plan` | Generate an eight-phase execution checklist for a specific goal and constraints. |
| `create_checkpoint` | Create a safety recovery point (git stash/commit) prior to risky code modifications. |
| `run_audit` | Generate an active defect-hunting checklist to uncover regressions and edge-case errors. |
| `verify_outcome` | Evaluate completion claims against execution evidence, classifying into PASS, FAIL, PARTIAL, or UNVERIFIED. |

### Connecting to Claude Desktop manually

If you prefer configuring Claude Desktop manually rather than using the installer, add the following entry to your `claude_desktop_config.json`:

* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "agent-core": {
      "command": "node",
      "args": ["<path-to-repo>/mcp/server.js"]
    }
  }
}
```

### Connecting to ChatGPT

You can use Agent Core with ChatGPT in two ways:

1. **Custom GPT:** Create a Custom GPT on ChatGPT using the pre-configured prompt in [integrations/chatgpt/instructions.md](integrations/chatgpt/instructions.md).
2. **Custom Actions:** Import [integrations/chatgpt/openapi.yaml](integrations/chatgpt/openapi.yaml) into the GPT Builder Actions tab to allow ChatGPT to call Agent Core API endpoints.

---

## One framework, three integrated parts

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

Key practices:
* **Pre-flight inspection:** Review dependencies, file layouts, and configuration before editing.
* **Checkpoints:** Create recoverable points (commits, stashes, or file backups) before risky or destructive operations.
* **Continuous validation:** Test milestones as they are completed rather than deferring all validation to the end.
* **Failure recovery:** When a change causes a regression, stop immediately and roll back to the last known-good checkpoint before attempting a revised solution.

### Part 3: Universal Verification (`references/verification.md`)

An active audit cycle to prove results before declaring completion:

```text
Requirements -> Inspect Actual Result -> Find Issues -> Fix -> Verify -> Re-audit -> Report
```

Key practices:
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

## License

MIT
