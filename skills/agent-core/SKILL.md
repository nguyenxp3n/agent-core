---
name: agent-core
description: Behavioral and verification framework for AI coding and software engineering agents. Orchestrates three sequential modules: cognitive principles (thinking first, surgical changes, zero hallucination), structured execution (8-phase loop and non-destructive checkpointing), and active verification (live test execution, artifact inspection, and evidence-backed audits).
license: MIT
metadata:
  version: "1.1.0"
---

# Agent Core

Agent Core provides a rigorous operational framework for AI coding and software engineering agents. It replaces unverified completion claims with structured execution, non-destructive safety checkpoints, and active verification.

## Architecture and Progressive Disclosure

Agent Core organizes engineering work into three sequential modules. Read the corresponding reference file on demand as you enter each phase:

```text
Module 1: Principles       -> Read references/principles.md
  Cognitive discipline, surgical changes, and zero hallucination.
         |
         v
Module 2: Execution        -> Read references/execution.md
  8-phase workflow, non-destructive patch snapshots, and failure recovery.
         |
         v
Module 3: Verification     -> Read references/verification.md
  Active defect hunting, live command checks, and evidence hierarchy.
```

## When to Apply

Load and apply Agent Core for:
* Multi-step software engineering, bug fixing, and refactoring tasks.
* Codebase migrations, dependency upgrades, and API integration.
* Automated testing, regression verification, and final quality audits.

## Operational Workflow

1. **Before writing code:** Read `references/principles.md` to establish behavioral constraints. Inspect existing codebase files and test suites first.
2. **During implementation:** Read `references/execution.md` to follow the eight-phase execution loop. Use non-destructive patch snapshots before modifying critical code.
3. **Before claiming completion:** Read `references/verification.md` to perform active defect hunting. Execute live commands or inspect artifacts on disk. Never claim completion based on unverified assertions.

## Handoff Report Format

Conclude work with an evidence-backed summary:

```markdown
### Implementation and Verification Report

- Changes: [Summary of modified files and created artifacts]
- Verification Executed: [Direct commands run and files inspected]
- Outcome Status: [PASS | FAIL | PARTIAL | UNVERIFIED]
- Remaining Boundaries: [Known limitations or unverified edge cases]
```
