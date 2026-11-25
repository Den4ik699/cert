---
paths:
  - "docs/**/*review*.md"
  - "tests/**"
---

# Code review conventions for automated tests

## Criteria come from the project
Review against `.claude/rules/cypress-ui.md`, `api-tests.md`, `gherkin.md`, not generic best practices.

## Categories
1. Locator stability: real `data-automation` values, no index/text/class locators when an attribute exists.
2. Duplication: grep existing steps before calling a step a duplicate; ambiguous step patterns break every feature.
3. Isolation: no dependence on state left by other tests or on execution order; fixtures cloned, not mutated.
4. Naming and Page Object structure: getters only in POs, no assertions or intercepts there.
5. Waits: no hard waits; after a network alias assert UI state before interacting.
6. Expected values from source (messages, i18n), tags (`@<TICKET>`, `@positive`/`@negative`).

## Severity
- **Critical**: hides failures, breaks isolation, violates a hard rule, or fails lint.
- **Stylistic**: naming, formatting, minor duplication.
Do not flood the author with minor comments; quality over quantity.

## Comment format
What is wrong, why it matters, concrete fix (code if short). Polite, specific, ready for the PR.

## Verify before publishing
- Every comment matches this project's conventions.
- Suggested code compiles and passes lint.
- Say what was not run (e.g. Cypress).
- A "brittle" locator may be conscious tech debt: ask before calling it critical.

## AI-assisted changes
Go through a pull request, not a direct commit to the main branch. Label the PR/commit AI-assisted so the reviewer can calibrate attention. The engineer owns the final decision.
