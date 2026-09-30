---
name: universal-verification
description: Universal verification and final audit workflow for detecting defects, omissions, regressions, and unsupported completion claims across any type of work.
license: MIT
---

# Universal Verification

Use when:
- task is ready for completion,
- user requests audit/review/QA/validation,
- user asks to find remaining errors,
- completion must be demonstrated with evidence.

Core principle:

> **Evidence before claims.**

## Verification Loop

```text
REQUIREMENTS → INSPECT ACTUAL RESULT → FIND ISSUES
→ FIX → VERIFY → RE-AUDIT → REPORT
```

## 1. Re-read Requirements

Compare actual result against the original request, not only latest changes.

Check:
- outputs,
- functional requirements,
- constraints,
- scope,
- quality expectations,
- format,
- edge cases.

## 2. Inspect Actual Result

Verify the artifact itself, not just the process.

Examples:

```text
Code         → build / tests / runtime / diff
Data         → query / schema / reconciliation / calculations
Document     → actual content / structure / formatting
Presentation → rendered slides / content / layout
Video        → rendered output / timing / audio / visual
Research     → sources / claims / cross-check
Configuration→ actual config / runtime behavior
```

## 3. Evidence Strength

### Strong
- direct execution result,
- test/build output,
- actual rendered/exported artifact,
- diff/version comparison,
- external source-of-truth confirmation.

### Medium
- static analysis,
- lint/schema validation,
- preview inspection,
- cross-check against requirements.

### Weak
- reasoning from text/code alone,
- "looks correct",
- agent's own assertion,
- previous unverified assumptions.

Weak evidence must not be presented as proof when stronger verification is reasonably available.

## 4. Active Error Search

Do not merely confirm the expected result exists.

Actively search for:
- missing requirements,
- incorrect values,
- broken behavior,
- regressions,
- inconsistencies,
- formatting/layout problems,
- unintended changes,
- unsupported claims,
- edge-case failures,
- stale/conflicting information.

Ask:

> **What could still be wrong?**

Do not stop at the first successful check.

## 5. Requirement Status

```text
PASS       = verified and satisfied
FAIL       = verified and not satisfied
PARTIAL    = partially satisfied
UNVERIFIED = insufficient evidence
```

Do not turn `UNVERIFIED` into `PASS` by reasoning.

## 6. Fix and Re-verify

When an issue is found:

```text
FIND → FIX → VERIFY
```

After a meaningful fix:
- verify the original issue is resolved,
- check for regression,
- confirm important requirements remain satisfied.

Do not declare completion immediately after a fix.

## 7. Rollback on Regression

```text
STOP
→ identify regression
→ rollback to last known-good checkpoint when practical
→ reassess diagnosis
→ revised fix
→ verify again
```

Do not stack speculative fixes on unstable state.

## 8. Circuit Breaker

For the same unresolved issue:
- prefer no more than 3 corrective cycles;
- if unresolved, STOP and ESCALATE;
- report evidence, attempted fixes, current state, and unresolved cause;
- reset the cycle count only when new evidence materially changes the diagnosis.

Do not continue speculative fixes merely to reach a complete status.

## 9. Re-audit After Meaningful Fixes

If a fix changes a significant part of the output, repeat the relevant audit.

Do not assume prior passing checks still apply to the modified final state.

## 10. Completion Gate

Completion requires:

```text
Requirements checked
+
Actual result inspected
+
Relevant evidence collected
+
Known issues addressed
+
Remaining limitations disclosed
```

Only then report completion.

Never claim "100% verified" unless evidence genuinely supports it.

## 11. Final Verification Report

```text
### Verification Report

- Requirements: [PASS / FAIL / PARTIAL / UNVERIFIED]
- Issues Found: [Summary]
- Fixes Applied: [Summary]
- Verification Performed: [Evidence / tests / inspections]
- Final Result: [PASS / FAIL / PARTIAL / UNVERIFIED]
- Remaining Limitations: [Known limitations]
```

Do not omit known limitations merely to appear complete.

## 12. Audit Behavior

When the user explicitly requests final audit, e.g.:

> "Audit kiểm duyệt đảm bảo chất lượng lần cuối — hãy tìm lỗi ngay."

interpret it as **active defect search**, not mere confirmation.

Use:

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
