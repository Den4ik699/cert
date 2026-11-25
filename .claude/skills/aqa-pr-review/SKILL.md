---
name: aqa-pr-review
description: Reviews changes to automated UI/API tests (Cypress + Cucumber) against the project conventions in .claude/rules and produces PR-ready comments split into critical and stylistic. Use when asked to review a PR/diff of test code or before declaring a test task done.
---

## Steps
1. Get the exact list of changed files (caller's list first; `git status`/`git diff` only if none). Review only files of this task.
2. Read the rules: `.claude/rules/cypress-ui.md`, `api-tests.md`, `gherkin.md`. Review against THESE conventions, not generic best practices.
3. Delegate the first pass to the read-only `test-reviewer` agent (no edits), then verify each finding against the real code yourself.
4. Group findings by category: locator stability (real `data-automation`), duplicate/ambiguous steps (grep before judging), test isolation and fixture cloning, naming and Page Object conventions, waits and synchronization (no hard waits, assert UI state after a network alias), expected texts from source, mocks narrow and aliased, tags.
5. Split: **critical** (breaks or hides failures, violates a hard rule) vs **stylistic**. Do not flood the author with minor comments.
6. For every comment: what, why it matters, a concrete fix. Polite, specific, ready to paste into the PR.

## Verify
- Re-read each comment against the project's conventions; drop generic ones.
- Check that suggested code compiles/passes lint (`eslint` on changed files).
- Mark what was NOT run (e.g. Cypress). Never claim runtime behaviour that was not executed.
- Known technical debt may be deliberate: ask before calling it critical.

## AI-assisted changes
Any change produced with AI goes through a pull request, not a direct commit to the main branch, and is labelled AI-assisted (label or note in the commit/PR text). The engineer owns the final decision.
