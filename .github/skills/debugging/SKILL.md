---
name: debugging
description: Diagnose and fix issues in TypeScript and Node.js projects by reproducing the problem, isolating the root cause, and validating the fix.
---

# Debugging

Use this skill when behavior is wrong, a command fails, or an exception appears.

## Workflow
1. Reproduce the issue with the smallest possible input and capture the exact command, stack trace, and expected vs. actual behavior.
2. Read the error output carefully and identify the first failing boundary.
3. Trace the relevant data flow and check the most recent change that could have introduced the issue.
4. Make one focused fix at a time and verify it with the relevant command.
5. Prefer minimal root-cause fixes over speculative changes.

## Good habits
- Preserve existing behavior unless the task explicitly asks for a change.
- Keep changes small and easy to review.
- Inspect surrounding code before editing so the fix fits the local design.
- Re-run the relevant command after every change.

## Useful verification commands for this repo
- npm run build
- npm run info
- npx ts-node src/index.ts
