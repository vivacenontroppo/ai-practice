---
name: testing
description: Add or improve tests for TypeScript and Node.js code with a focus on real behavior, small scopes, and clear verification.
---

# Testing

Use this skill when introducing new functionality, changing existing behavior, or preventing regressions.

## Workflow
1. Define the expected behavior clearly before writing code.
2. Add a focused test for the scenario first when possible.
3. Keep tests isolated, readable, and specific to one behavior.
4. Prefer real inputs and minimal mocking.
5. Verify the test result and only then consider the change complete.

## Practical guidance
- Favor simple assertions over overly broad setups.
- Name tests around the behavior they prove.
- If the project does not yet have a test framework, start with a small dedicated script and add a repeatable command later.
- For this repo, keep tests close to the feature or module they cover.

## Validation checklist
- The test expresses the intended behavior clearly.
- The test fails before the fix when applicable.
- The implementation change is minimal and directly related to the test.
