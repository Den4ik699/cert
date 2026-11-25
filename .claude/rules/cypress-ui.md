---
paths:
  - "integration/cypress/**/*.ts"
  - "integration/cypress/fixtures/**"
---

# Cypress UI test conventions

## Page Objects (`integration/cypress/e2e/common/`)

- Every PO `extends BasePage` and is exported as a **singleton**: `export default new SubHeader();`.
- Elements are **getters** returning a chainable, built with `this.getElementByTag('<data-automation value>')`. Fall back to `getElementByClass` / `getElementById` / `getElementByText` only when no `data-automation` exists (mention it in your summary).
- Reuse `BasePage` helpers: `listbox`, `enabledOption`, `selectedOption`, `selectFirstEnabledOption()`, `clickOutsideFields()`, `emptyContainer`, `spinner`.
- Put a getter in the PO that owns that part of the screen (`modals.ts`, `subHeader.ts`, `taskView/*`, `sitesView/*`). Create a new component file only for a new screen area.
- POs hold locators and reusable UI actions (e.g. `fillTaskModalFields`). **No business assertions and no `cy.intercept` in POs.**

```ts
import { BasePage } from '../basePage';

class ContactsPanel extends BasePage {
  get addContactButton() {
    return this.getElementByTag('addContactButton');
  }
}

export default new ContactsPanel();
```

## Step definitions (`integration/cypress/support/step_definitions/`)

- Import from `@badeball/cypress-cucumber-preprocessor`: `Given, When, Then, DataTable, Before`. Import POs via relative paths (`../../e2e/common/...`).
- All step files are global. **Grep for the step text before adding one** and reuse `common/*`:
  - `I am on the Onboarding Portal page`, `I have loaded checklist data for site with id {string}`, `I navigate to the checklist details page using loaded site data`, `My user locale is set to {string}`
  - `I click the {string} button` (map `BUTTON_ACTIONS`), `I should see a {string} button` (map `BUTTON_TYPES`), `I should see the modal with title {string}`, `I should see the notification with message {string}`, `I select date {string} in the calendar`
  - Permissions: `I am logged in as a user without the {string} permission`, `I am logged in as a user without {string} permission on {string} role` (`editCustomTask.ts`), `I am logged in as a user with the {string} permission` (`erpTaskApprove.ts`).
  - To support a new button/modal/dropdown in a shared step, **extend its map / switch** instead of writing a near-duplicate step.
- File naming: `<featureName>.ts` next to `<featureName>.feature` (camelCase). Reusable steps go to `common/`.
- Prefer Cucumber expressions (`{string}`, `{int}`, `{word}`); use regex only for alternations, e.g. `/^the "(Save|Submit)" button is (enabled|disabled)$/`.
- Switch-based steps end with `default: throw new Error(\`Unsupported <thing>: ${value}\`)`.
- Keep steps thin: PO locator + action/assertion. Share data between steps via aliases (`cy.wrap(x).as('currentChecklist')` / `cy.get('@currentChecklist')`), never module-level mutable variables.

## Mocking (UI tests are fully mocked)

- Global mocks are registered by `cy.mock()` (`support/commands.ts`) before every test; add there **only** if every page needs it.
- Scenario-specific mocks live in `Given` steps: `cy.intercept(method, url, { fixture } | { statusCode, body } | req => ...).as('alias')`. Alias every mock you wait on or assert.
- Success envelope: `{ code, message, data }` (see `fixtures/checklists.json`). Error mock pattern used in the repo:
  `cy.intercept('PUT', '**/tasks/**', { statusCode: 500, body: { error: 'Internal Server Error', message: '...' } })`.
- Derive variants from existing fixtures: `cy.fixture('checklists.json').then(json => { const c = structuredClone(...); ... cy.intercept(...) })`. Add a new fixture file only for large static payloads; name it after the endpoint (`POST-task.json`, `types-site.json`).
- Assert outgoing payloads through the alias: `cy.wait('@createTask').its('request.body').should('deep.include', {...})`.

## Design-system (`@dsy/<ORG>`) / Angular Material quirks

- DS buttons are web components: `PO.button.shadow().find('button').click()`; state via `.shadow().find('button').should('be.disabled')` or `aria-disabled`.
- Material dropdowns render in an overlay: click trigger → `this.listbox.contains(text).click()` → `clickOutsideFields()` for multi-selects.
- Hover: `cy.realHover()` (cypress-real-events). New tab: stub `window.open` (see `taskDetails.ts`).

## Anti-patterns (reject in review)

- `cy.wait(<number>)`; `{ force: true }` without a comment explaining why.
- Conditional testing (`if ($body.find(...).length)`) for deterministic UI.
- Asserting CSS classes/colors when `data-automation` or text assertions are possible.
- Copy-pasted intercept blocks — extract a local helper function in the step file.
- Hard-coded IDs/texts in steps that aren't in the `.feature` or fixtures.
- Match intercept URLs and HTTP methods as narrowly as practical, based on actual requests in client/src/app/services/.
- Avoid broad wildcard routes when multiple endpoints could match the same pattern.
- After waiting for a network alias, assert the expected UI state before interacting with dependent elements.
- Do not assume network completion means Angular rendering has finished.
- Never mutate shared fixture objects in place.
- Clone fixture data before modifying scenario-specific values.
- Keep overrides local to the scenario to avoid test coupling.