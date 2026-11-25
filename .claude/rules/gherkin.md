---
paths:
  - "integration/**/*.feature"
---

# Gherkin conventions (UI and API)

- Language: English. Indent 4 spaces (prettier-plugin-gherkin formats on save via hook).
- Header:
  - UI: `Feature: <Business capability>` + user story (`As a ... / I want ... / So that ...`).
  - API: `@<domain-tag>` above `Feature: <METHOD> /<route>` + short story.
- Tags on **every scenario**: Jira key `@SOLO-1234` (one per line, as in existing files), plus `@positive` / `@negative` for UI. `@ignore` = skipped everywhere. `@smoke` for critical path.
- `Background:` only for steps shared by **all** scenarios of the file (e.g. `Given I am an authenticated user`, loading checklist data).
- One behaviour per scenario. Scenario title states the expected behaviour, not the steps ("Delete link is not visible to users without MANAGE_ADMIN_GROUPS").
- Given = state/mocks, When = user/request action, Then = observable outcome. Don't put assertions in Given/When.
- Use `Scenario Outline` + `Examples:` for the same flow with different data (validation rules, statuses, locales). Align table columns.
- Write steps in business language at the UI level ("I click the "Confirm" button"), not technical ("I click [data-automation=confirmCreate]").
- Values asserted in the feature (texts, messages, codes) must match source (i18n / class-validator / controller), not guesses.
- Reuse existing step wording **exactly** (whitespace and quotes matter). If a step doesn't exist, prefer a generic parameterized version over a scenario-specific one.
- Avoid duplicate scenarios asserting the same acceptance criterion through an identical flow.
- Add separate scenarios only when they cover distinct behavior, permissions, boundaries, or failure modes.
- Use Scenario Outline only when the same execution flow and assertions apply to multiple data sets.
- Prefer separate scenarios when setup, actions, or expected behavior differ significantly.
- Before introducing a new step, search existing step definitions for equivalent behavior, not only exact text.
- Reuse or extend existing generic steps where appropriate.