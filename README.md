# Agent Core

> A universal, evidence-driven framework for AI agents to execute work, verify results, and avoid unsupported completion claims.

**Agent Core** is a vendor-neutral foundation for AI agents working across coding, research, documents, presentations, data, media, analysis, and other multi-step tasks.

It separates **behavioral principles**, **execution workflow**, and **verification/audit** into reusable components that can be adapted to different AI systems and agent environments.

## Why Agent Core?

AI agents can perform requested actions while still producing incomplete, incorrect, or insufficiently verified results.

Agent Core addresses this with:

> **Do the work → inspect the actual result → actively search for problems → verify with evidence → only then report completion.**

## Architecture

```text
agent-core/
├── README.md
├── IMPLEMENTATION_PLAN.md
├── IMPLEMENTATION_PROMPT.md
│
└── skills/
    ├── principles/
    │   └── AGENTS.md
    ├── universal-execution/
    │   └── SKILL.md
    ├── universal-verification/
    │   └── SKILL.md
    └── universal-terminal/
        └── SKILL.md
```

| Component | Purpose |
|---|---|
| `README.md` | Project entry point and documentation |
| `IMPLEMENTATION_PLAN.md` | Technical implementation specification |
| `IMPLEMENTATION_PROMPT.md` | Prompt for an AI agent to implement the project |
| `skills/principles/` | Universal behavioral principles |
| `skills/universal-execution/` | Workflow for non-trivial work |
| `skills/universal-verification/` | Final verification and audit |
| `skills/universal-terminal/` | Controlled local terminal workflow |

## Three Layers

```text
PRINCIPLES
How should the agent behave?
        ↓
EXECUTION
How should the agent perform the work?
        ↓
VERIFICATION
How does the agent prove the result?
```

### Principles

Universal behavior: think before acting, simplicity, surgical changes, honesty, preserve user intent, verify before completion.

See [`skills/principles/AGENTS.md`](skills/principles/AGENTS.md).

### Universal Execution

```text
Understand → Inspect → Define Success → Plan
→ Execute → Checkpoint → Validate → Complete
```

See [`skills/universal-execution/SKILL.md`](skills/universal-execution/SKILL.md).

### Universal Verification

```text
Requirements → Inspect Actual Result → Find Issues
→ Fix → Verify → Re-audit → Report
```

See [`skills/universal-verification/SKILL.md`](skills/universal-verification/SKILL.md).

### Universal Terminal

Defines how an AI agent should request and interpret local terminal execution through a controlled runtime/MCP layer.

See [`skills/universal-terminal/SKILL.md`](skills/universal-terminal/SKILL.md).

## Read Order for AI Agents

```text
README.md
    ↓
skills/principles/AGENTS.md
    ↓
skills/universal-execution/SKILL.md
    ↓
skills/universal-verification/SKILL.md
    ↓
skills/universal-terminal/SKILL.md
```

For implementation work, additionally read:

```text
IMPLEMENTATION_PLAN.md
IMPLEMENTATION_PROMPT.md
```

## Completion Is Not the Same as Action

```text
Performed actions ≠ Verified outcome
```

Examples:

```text
"Code was changed"        ≠ "Application works"
"Tests were written"      ≠ "Tests pass"
"Slides were generated"   ≠ "Slides were visually verified"
"File was exported"       ≠ "Exported artifact is correct"
```

## Evidence Strength

**Strong**
- Direct execution results
- Build/test results
- Actual rendered/exported artifacts
- Diff/version comparison
- External source-of-truth confirmation

**Medium**
- Static analysis
- Lint/schema validation
- Preview inspection
- Requirement cross-checking

**Weak**
- Reasoning alone
- "Looks correct"
- Agent assertion
- Previous unverified assumptions

Weak evidence must not be presented as proof when stronger verification is reasonably available.

## Active Audit

When the user explicitly asks for a final audit, such as:

> **"Audit kiểm duyệt đảm bảo chất lượng lần cuối — hãy tìm lỗi ngay."**

the agent must actively search for defects rather than merely confirm success:

```text
ASSUME NOTHING
→ INSPECT
→ CHALLENGE
→ FIND
→ FIX
→ VERIFY
→ RE-AUDIT
→ REPORT
```

Look for missing requirements, incorrect values, broken behavior, regressions, inconsistencies, formatting/layout problems, unintended changes, unsupported claims, edge cases, and stale/conflicting information.

## Verification Status

| Status | Meaning |
|---|---|
| `PASS` | Verified and satisfied |
| `FAIL` | Verified and not satisfied |
| `PARTIAL` | Partially satisfied |
| `UNVERIFIED` | Insufficient evidence |

Do not convert `UNVERIFIED` into `PASS` by reasoning alone.

## Recovery

For risky state-changing work, establish a recoverable checkpoint when practical.

If a regression occurs:

```text
STOP
→ Identify regression
→ Rollback/recover when practical
→ Reassess
→ Fix
→ Verify
```

For the same unresolved issue, prefer no more than approximately three corrective cycles before escalation unless new evidence materially changes the diagnosis.

## Universal by Design

The framework is intentionally vendor-neutral and can be adapted to:

- Claude / Claude Code
- ChatGPT / Apps
- Gemini / Gemini CLI
- Codex
- Cursor
- Kiro
- OpenCode
- Other agent environments

The reusable core is the workflow and behavioral contract, not a vendor-specific API.

## Implementation

The repository is designed to evolve toward:

```text
AI Client
    ↓
MCP
    ↓
Local Agent
    ↓
Permission Layer
    ↓
Local Tools / Terminal
```

See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for the build plan and [`IMPLEMENTATION_PROMPT.md`](IMPLEMENTATION_PROMPT.md) for the agent implementation prompt.

## Future Structure

```text
agent-core/
├── README.md
├── IMPLEMENTATION_PLAN.md
├── IMPLEMENTATION_PROMPT.md
│
├── skills/
│   ├── principles/
│   ├── universal-execution/
│   ├── universal-verification/
│   ├── universal-terminal/
│   └── ...
│
├── runtime/
│   └── local-agent/
│
├── mcp/
│   └── server/
│
├── adapters/
│   ├── claude/
│   ├── gemini/
│   ├── codex/
│   └── chatgpt/
│
└── scripts/
    ├── install.sh
    └── install.ps1
```

## License

MIT
