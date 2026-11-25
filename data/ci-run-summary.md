# Сводка реального CI-запуска (CodeBuild, ветка `dev`, 2026-10-28)

Источник: лог фазы тестов (`npm run cy:tests`) и `POST_BUILD`. Хосты, бакет и внутренний хост CI обезличены. Лог неполный: начала сборки (install/pre_build) в нём нет, истории других запусков нет.

Cypress 14.4.0, Electron 130 (headless), Node v22. 14 спеков.

| Спек | Время | Тестов | Прошло | Упало | Pending |
| --- | --- | --- | --- | --- | --- |
| addCustomTask | 01:02 | 14 | 14 | - | - |
| checklistFiltering | 00:29 | 10 | 10 | - | - |
| checklistOverview | 00:13 | 7 | 7 | - | - |
| createContact | 82 мс | 9 | - | - | 9 |
| createСhecklists | 00:22 | 9 | 9 | - | - |
| deleteTasks | 00:12 | 4 | 4 | - | - |
| editChecklists | 00:16 | 6 | 6 | - | - |
| editCustomTask | 00:43 | 13 | 13 | - | - |
| **erpTaskApprove** | **04:46** | **14** | **4** | **10** | - |
| erpTaskSaveAndSubmit | 03:31 | 35 | 35 | - | - |
| erpTaskSync | 00:44 | 7 | 7 | - | - |
| onboardingPortalMetrics | 00:06 | 3 | 3 | - | - |
| siteTasksOverview | 00:21 | 10 | 10 | - | - |
| taskDetails | 00:09 | 4 | 4 | - | - |
| **Итого** | **13:00** | **145** | **126** | **10** | **9** |

## Падение
`erpTaskApprove.feature`: 10 тестов, каждый упал в обеих попытках (20 скриншотов).
Ошибка: `CypressError: Timed out retrying after 10000ms: The command was expected to run against origin <APP_HOST> but the application is at origin <SSO_HOST>.`
Скриншот: страница с ошибкой 403 (наблюдение автора теста). Причина: запрос без мока уходит на реальный бэкенд.
Порядок в спеке: 1 ✓, 2–9 ✗, 10–12 ✓, 13–14 ✗.
Проходят: «Display approve actions and banner for onboarding manager» (1), «Managers can approve valid saved drafts without a separate submission» (10), «Edit approved ERP changes button to "Save and Approve" and allows saving» (11), «Approve actions and banner are hidden for users without MANAGE_ADMIN_GROUPS rights» (12).
Падают: 2–9 (от «Display Approve All dialog» до «Approve All banner button re-enables when a still-reviewable ERP fails to approve»), 13 («Cancel Approve All dialog…»), 14 («Sticky banner remains visible on page scroll»).

## Тест, прошедший только с ретраем
`erpTaskSaveAndSubmit.feature`: «Save with Apply to all copies text and sets every ERP status to Not submitted»: Attempt 1 failed (скриншот сохранён), Attempt 2 passed.

## Pending
`createContact.feature`: все 9 сценариев pending (в запущенной версии они помечены `@ignore`).

## Пост-стадия
`npm run test || TEST_FAILED=true` → Allure-отчёт сформирован (13.5 МиБ) и загружен в `<BUCKET>`, старый отчёт ветки удалён, `exit 1`, `POST_BUILD: FAILED`, `UPLOAD_ARTIFACTS: SUCCEEDED`.
