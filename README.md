# Agent Core

Agent Core is a behavioral and verification framework for AI coding and software engineering agents. It defines how agents think, execute multi-step modifications, and verify outcomes with direct execution evidence before claiming a task is complete.

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

AI coding agents often declare success because they ran a tool, edited a file, or generated plausible-looking syntax. Running a command is not the same as verifying that code compiles, unit tests pass, or requirements are met.

Agent Core establishes explicit behavioral gates to prevent:
* Unverified completion claims ("task finished" without execution proof).
* Hallucinated tools, file paths, or test outputs.
* Unnecessary complexity, scope creep, and speculative code changes.
* Broken state compounded by uncheckpointed iterations.

---

## Repository structure

```text
agent-core/
├── README.md
├── install.sh
├── install.ps1
├── mcp/
│   ├── package.json
│   ├── server.js
│   └── test.js
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
| Master Skill | `skills/agent-core/SKILL.md` | Lean router coordinating progressive disclosure |
| MCP Plugin Server | `mcp/server.js` | Zero-dependency Active Verification Engine |
| Integration Tests | `mcp/test.js` | End-to-end JSON-RPC suite validating protocol and verification gates |
| ChatGPT Integration | `integrations/chatgpt/` | OpenAPI 3.1.0 schema and Custom GPT instructions |
| Module 1: Principles | `skills/agent-core/references/principles.md` | Cognitive discipline, surgical edits, and zero fabrication |
| Module 2: Execution | `skills/agent-core/references/execution.md` | Eight-phase loop, non-destructive patch snapshots, and recovery |
| Module 3: Verification | `skills/agent-core/references/verification.md` | Active defect hunting, live command checks, and evidence hierarchy |

---

## MCP Server and Plugin Tools

When running as an MCP server, Agent Core exposes 5 callable tools to your AI assistant:

| Tool Name | Purpose |
|---|---|
| `get_principles` | Retrieve core cognitive principles (thinking first, simplicity, surgical changes, zero fabrication). |
| `create_execution_plan` | Generate an eight-phase execution checklist for a specific goal and constraints. |
| `create_checkpoint` | Create a non-destructive patch snapshot (`.agent-core/checkpoints/`) without modifying the working tree. |
| `run_audit` | Generate an active defect-hunting checklist to uncover regressions and edge-case errors. |
| `verify_outcome` | Active verification engine. Executes live shell commands or inspects artifacts on disk; rejects unverified text claims. |

### Connecting to Claude Desktop manually

Add the following entry to your `claude_desktop_config.json`:

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

## Automated Verification Suite

Agent Core includes an automated behavioral integration test suite (`mcp/test.js`) that validates protocol compliance, tool registration, live command execution, artifact inspection, and rejection of unverified verbal claims:

```bash
node mcp/test.js
```

The test suite runs with zero third-party dependencies directly on Node.js 18+ and is integrated into GitHub Actions CI (`.github/workflows/verify.yml`).

---

## Three Integrated Modules

### Module 1: Principles (`references/principles.md`)

Governs baseline engineering discipline:
* **Think before acting:** Inspect workspace files and context first. Clarify ambiguous constraints rather than guessing.
* **Simplicity first:** Pick the most direct solution that satisfies the goal. Avoid premature abstractions and unnecessary dependencies.
* **Surgical changes:** Touch only what is required. Preserve existing conventions, formatting, and surrounding code.
* **Goal-driven execution:** Define observable criteria for success before writing code.
* **Zero fabrication:** Never invent facts, tool runs, or test results. Distinguish between directly verified facts and inferences.
* **Preserve user intent:** Follow user constraints and explicit scope instead of substituting personal preference.
* **Verify before completion:** A task is complete only when confirmed by tangible evidence.

### Module 2: Execution (`references/execution.md`)

A structured workflow designed for multi-step software engineering tasks:

```text
Understand -> Inspect -> Define Success -> Plan -> Execute -> Checkpoint -> Validate -> Complete
```

Key practices:
* **Pre-flight inspection:** Review dependencies, file layouts, and configuration before editing.
* **Non-destructive checkpoints:** Create recoverable patch snapshots prior to risky or destructive operations.
* **Continuous validation:** Test milestones as they are completed rather than deferring all validation to the end.
* **Failure recovery:** When a change causes a regression, stop immediately and roll back to the last known-good checkpoint before attempting a revised solution.

### Module 3: Verification (`references/verification.md`)

An active audit cycle to prove results before declaring completion:

```text
Requirements -> Inspect Actual Result -> Find Issues -> Fix -> Verify -> Re-audit -> Report
```

Key practices:
* **Active error search:** Instead of seeking confirmation bias, the agent actively looks for broken edge cases, missing requirements, regressions, and unintended file edits.
* **Fix and re-audit:** When a defect is resolved, the agent re-audits related components to ensure the fix did not introduce secondary regressions.
* **Circuit breaker:** If an issue remains unresolved after three corrective cycles, the agent stops and reports the blockers to the user instead of spinning indefinitely.

---

## Evidence Hierarchy

Agent Core defines three levels of evidence. Higher levels take precedence:

* **Strong:** Direct command execution output, build logs, passing test suites, file diffs, and visual verification of rendered artifacts.
* **Medium:** Static analysis, lint checks, type checks, and schema validation.
* **Weak:** Plausibility, static reasoning alone, or assertions like "the logic looks sound."

Agents must not rely on weak evidence when strong evidence can be obtained through available tools.

---

## Verification Status Definitions

When reporting completion, outcomes must be classified into one of four states:

| Status | Definition |
|---|---|
| `PASS` | Requirement verified through direct execution or artifact evidence. |
| `FAIL` | Requirement tested and failed to satisfy criteria. |
| `PARTIAL` | Some criteria verified, but parts of the requirement remain incomplete or contain stubs. |
| `UNVERIFIED` | Tooling or context was insufficient to confirm the result. |

Uncertainty or lack of test tooling must be reported as `UNVERIFIED`, never promoted to `PASS`.

---

## License

MIT
