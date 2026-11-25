---
paths:
  - "integration/api/**"
  - "integration/helpers/**"
---

# API (cucumber-js) test conventions

## How it works

- `CustomWorld` (`integration/api/step_definitions/world.ts`) is `this` in every step (**use `function () {}`, never arrow functions**).
  - `this.Biome.setData/getData` — scenario state (auth flag, request bodies, ids).
  - `this.addMock(SERVICE, METHOD, endpointWithQuery, code, body)` — mocks a **downstream** call the BFF makes. Services (keys in `api/src/configs/environment.config.ts`): `ATLAS`, `CONTACT`, `COUSIN`, `EMS`, `MARRIAGE`, `NAV`, `ONB`, `REF`, `USER_ADMIN`.
  - `this.sendGetTo/sendPostTo/sendPutTo/sendDeleteTo(url)` — calls the BFF (`/api/v1/...`); response → `this.lastResponse` (`statusCode`, `body`). Non-2xx does not throw.
  - Body for POST/PUT/DELETE via `this.setPost/setPut/setDelete`. ⚠ `sendPutTo` currently sends `this._post` — set both if you test PUT.
  - Mocks are signed into the `<SESSION_COOKIE>` JWT with `MOCK_KEY`. The API returns `x-mock-validations`; **any mock not called, or any downstream call without a mock, fails the scenario** (`missed` must be `[]`). So mock exactly the calls the endpoint makes — read the controller → service → external service chain first.
- `Before` hook (prezGivens.ts) sets `auth=true` and clears mocks. `I have an invalid token` / `I have an expired or invalid session` set `auth=false` (no `<SESSION_COOKIE>` header → 401).

## Where things go

- Features: `integration/api/features/<verb>-<resource>.feature` (kebab-case, e.g. `get-task-erps.feature`, `post-checklist.feature`). Feature title = `METHOD /route`.
- Steps: add to `prezGivens.ts` (setup + mocks), `prezWhens.ts` (requests), `prezThens.ts` (assertions). Only create a new step file for a clearly separate domain, named `prez<Domain>.ts`.
- Downstream mock payloads: `integration/api/support/mocks/<service-lowercase>/<name>.json`, imported with `import * as x from '../support/mocks/...json'`. Clone before mutating: `JSON.parse(JSON.stringify(x))`.
- Reuse `responses.ok/notFound/serverError/...` envelopes (defined in prezGivens/prezWhens) when mocking.

## Steps to reuse (grep before writing new ones)

- Given: `I am an authenticated user`, `I have an expired or invalid session`, `I have an invalid token`, `I have a full Task`, `I have a full Checklist`, `I have a {name} with the "{field}" field missing`, `I have a "{name}" with a {key} key, type body and value {value}`, `I have the following "{name}" data` (data table → `dataTableToObject`), `the site ID is {string}`, `the task ID is {string}`, `the registration ID is {string}`, service up/down/empty variants (`the contact service ...`, `the EMS service ...`, `Atlas ...`).
- When: `I "(PUT|POST|GET)" my "(Invalid|Valid)" "(.*)"`, `I make a GET request on {string} endpoint`, `I DELETE my {string} task with id {string}`, `I ping the server`, `I GET Checklists`, `I GET Contacts for site {string}`, `I GET the registration by id`, `I GET Registrations for site {string}`, `I GET the ERPs for the task`, `I POST|PUT erps for task {string}`. Naming style for new ones: `I <METHOD> <resource> ...`.
- Then: `I should receive a response with code "(.*)"`, `I should receive error code "(.*)"`, `I should see a non empty response`, `I should get a "<error>" error for "<key>" key`, `I should receive a warning about "<field>" field missing`, `I should receive a "(.*)" message|name`, `the response should contain an empty list`.

## Writing new steps

- Pattern for a new endpoint:
  1. `Given` stores ids/payload in Biome and calls `this.addMock(...)` for every downstream call (happy path, empty, 404/422, 500 variants as separate Givens or one parameterized Given).
  2. `When` sends the request with the stored data.
  3. `Then` asserts status + body shape/values with `expect` (Jest matchers: `toEqual`, `toHaveProperty`, `toBeInstanceOf`, `toContain`).
- Validation (422) messages must be copied from the class-validator decorators in `dto/` or `api/src/models` — never invent them. Keys in error responses are camelCase (`toCamelProperty('due_date')` → `dueDate`).
- Generate ids with `uuidv4()` or use fixed UUIDs in the feature; keep them consistent between Given mocks and When URL.
- Type step params (`function (siteId: string)`), avoid `any` for new code when the shape is known.
