---
name: refactoring
description: Improve structure, readability, and maintainability of TypeScript code without changing behavior.
---

# Refactoring

Use this skill when code is correct but hard to read, extend, or reason about.

## Workflow
1. Understand the current behavior before changing structure.
2. Extract or rename pieces only when the intent becomes clearer.
3. Keep functions and classes focused on a single responsibility.
4. Preserve public behavior while improving organization.
5. Re-run the relevant build or execution command after the change.

## Refactoring principles
- Prefer small, reversible edits.
- Improve clarity before optimization.
- Keep naming aligned with the code’s purpose.
- Split large functions into smaller steps when it makes the flow easier to follow.
- Update callers consistently when interfaces or module boundaries change.

## Repository-specific guidance
- Keep TypeScript modules focused and easy to import.
- Favor explicit types and clear names over clever shortcuts.
- Re-check the build after structural changes.
