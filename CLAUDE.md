# CLAUDE.md — Onboarding admin portal (выдержка для AQA)

Обезличенная выдержка из проектного `CLAUDE.md`: оставлены разделы, на которые ссылаются агенты, skills и рулы в `.claude/`. Хосты, имя организации и секреты заменены на плейсхолдеры.

## Структура репозитория

| Папка | Что внутри |
| --- | --- |
| `client/` | Angular-приложение. Шаблоны с `data-automation` (`client/src/app/**/*.html`), HTTP-сервисы (`client/src/app/services/**`), тексты (`client/src/l10n/en-us.<ORG>.json`), `error.interceptor.ts` (401 → SSO, 403 → страница Forbidden) |
| `api/` | BFF: контроллеры и сервисы, ходит в downstream-сервисы |
| `dto/` | Общие DTO и class-validator (источник текстов ошибок 422) |
| `integration/` | Автотесты: `cypress/` (UI, Cucumber) и `api/` (cucumber-js) |
| `manifests/` | Terraform стенда ветки |
| `buildspec.yml` | Пайплайн CodeBuild (в этом репо: `ci/buildspec.yml`) |

Соответствие путей в этом репо: `integration/cypress/e2e/features/*.feature` → `tests/features/`, `integration/cypress/e2e/common/**` → `tests/page_objects/`, `integration/cypress/support/step_definitions/**` → `tests/step_definitions/`, `integration/cypress/fixtures/**` → `tests/fixtures/`.

## Команды (из `integration/`)

Бинарники вызываются через `node node_modules/...`, не через `npx`.

| Задача | Команда |
| --- | --- |
| Все UI-тесты (как в CI) | `npm run cy:tests` |
| Один спек UI | `node node_modules/cypress/bin/cypress run --spec cypress/e2e/features/<name>.feature` |
| Интерактивно (Network, Command Log) | `node node_modules/cypress/bin/cypress open` |
| API-тесты | `node node_modules/@cucumber/cucumber/bin/cucumber.js` |
| Проверка шагов API без запуска | `node node_modules/@cucumber/cucumber/bin/cucumber.js --dry-run` |
| Lint изменённых файлов | `node node_modules/eslint/bin/eslint.js <files>` |

Переменные: `INTEGRATION_ENDPOINT` (стенд ветки, `terraform output remote_url`), `MOCK_KEY` (подпись моков, `terraform output mock_key`). Значения не коммитятся.

## Конвенции тестов

- UI-тесты **полностью замоканы**: любой запрос без `cy.intercept` уходит на реальный бэкенд стенда и получает 401/403, после чего `error.interceptor.ts` уводит страницу (SSO или Forbidden).
- Подробно: `.claude/rules/cypress-ui.md`, `api-tests.md`, `gherkin.md`, `code-review.md`, `ci-pipeline.md`, `communication.md`.
- Каждый сценарий: тег `@SOLO-xxxx`, для UI ещё `@positive`/`@negative`.

## Работа с ИИ

- Агенты в `.claude/agents/` только читают (кроме `test-failure-analyst`, который ещё запускает тесты); правки в код вносит инженер.
- Любое изменение, сделанное с помощью ИИ, идёт через PR с пометкой `AI-assisted`, прямых коммитов в `dev`/`main` нет.
- В общие документы не попадают хосты, секреты, данные пользователей и клиентов.
