---
name: universal-execution
description: Universal execution workflow for completing non-trivial tasks across coding, research, documents, presentations, data, media, analysis, and other work.
license: MIT
---

# Universal Execution

Use this workflow for non-trivial or multi-step tasks.

## Core Workflow

```text
[Understand] → [Inspect] → [Define Success] → [Plan]
→ [Execute] → [Checkpoint] → [Validate] → [Complete]
```

with `FAIL → Fix → Validate` loop.

## 1. Understand

Determine:
- What the user wants.
- Why they want it.
- Required output.
- Constraints.
- Scope.
- Relevant context.

Do not solve a different problem from the one requested.

## 2. Inspect

Before changing anything, inspect the relevant existing state:
- files/repo structure,
- source/dependencies,
- docs/presentations,
- datasets/schemas,
- outputs,
- references/sources,
- configuration,
- constraints/prior decisions.

Do not assume current state.

## 3. Define Success

Convert request into observable success criteria:

```text
Requirement → Expected result → Verification method
```

For each important requirement, know how you will determine whether it passed.

## 4. Plan

For non-trivial work:
1. Break task into logical steps.
2. Identify dependencies.
3. Identify risks.
4. Determine validation points.
5. Choose smallest practical implementation.

Do not create a plan for its own sake; keep proportional.

## 5. Execute

Perform planned work:
- follow scope,
- preserve behavior where possible,
- minimal necessary changes,
- validate important assumptions,
- avoid speculative work.

If new evidence invalidates the plan, stop and update the plan.

## 6. Checkpoint

Before risky/state-changing work, establish a recoverable checkpoint when practical:
- Git commit/known-good revision,
- backup/copy,
- saved document version,
- exported artifact,
- dataset snapshot,
- configuration snapshot.

## 7. Validate During Execution

After meaningful milestones:
- inspect result,
- run relevant checks,
- compare requirements,
- detect regressions early.

Prefer direct evidence.

## 8. Recover From Failure

If execution causes regression:

```text
STOP
→ identify regression
→ determine recoverability
→ rollback to known-good checkpoint when appropriate
→ reassess
→ revised approach
```

Do not stack speculative fixes on unstable state.

## 9. Prepare for Completion

Before claiming:
- re-read original requirements,
- inspect actual final output,
- verify success criteria,
- check omissions/regressions,
- identify unverified areas.

If meaningful uncertainty remains, route through `universal-verification`.

## 10. Completion Handoff

Use:

```text
### Verification Report

- Changes: [Files / artifacts modified]
- Verification Performed: [Checks / tests / inspections performed]
- Result: [PASS / FAIL / PARTIAL / UNVERIFIED]
- Remaining Limitations: [Known constraints or unverified areas]
```

Do not claim checks not performed.

## 11. Escalation

Escalate instead of guessing when:
- required information is unavailable,
- requirements conflict,
- external access is blocked,
- repeated attempts are contradictory,
- the correct solution depends on an unresolved decision,
- continuing creates unacceptable risk.

Provide what was attempted, evidence, unresolved issues, and the decision/information required.
