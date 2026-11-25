# Code review: SOLO-4018 — Contact task (UI-тесты)

## Объект ревью

| Путь в проекте | Путь в этом репо |
| --- | --- |
| `integration/cypress/e2e/features/createContact.feature` | `tests/features/createContact.feature` |
| `integration/cypress/support/step_definitions/createContact.ts` (новый) | `tests/step_definitions/createContact.ts` |
| `integration/cypress/e2e/common/components/taskView/contactTask.ts` (новый) | `tests/page_objects/contactTask.ts` |
| `integration/cypress/fixtures/site-contacts.json` (новый) | `tests/fixtures/site-contacts.json` |
| `integration/cypress/support/step_definitions/common/interactionSteps.ts` | не выгружен (общий файл шагов) |
| `client/src/app/components/utils/tasks/contact-task/contact-task.component.html` | не выгружен (клиентский код, использован только для сверки `data-automation`) |

**Критерии:** конвенции проекта из `CLAUDE.md` и `.claude/rules/` (`cypress-ui.md`, `gherkin.md`, `code-review.md`): переиспользование шагов, реальные `data-automation`, ожидаемые значения из исходников, отсутствие `cy.wait(ms)`, теги, Page Object, изоляция, узкие моки.

## Как проводилось (Research → Plan → Implement → Verify)

1. **Research:** список изменённых файлов, рулы проекта, соседние step-файлы (`taskDetails.ts`), шаблон компонента, `en-us.<ORG>.json`, `tasks.service.ts`, тикет SOLO-4018 в Jira.
2. **Plan:** категории из skill `aqa-pr-review`: стабильность локаторов, дубли шагов, изоляция и фикстуры, Page Object, ожидания и синхронизация, ожидаемые тексты, моки, теги.
3. **Implement:** первый проход сделал агент `test-reviewer` (только чтение), его вывод и разбор лежат в `docs/runs/test-reviewer-run.md`. Каждое замечание затем проверено вручную по коду, лишнее отброшено.
4. **Verify:** `eslint` без `--fix` на изменённых `.ts` в проекте: без ошибок. Исправления 1 и 3 проверены `tsc --noEmit` с типами Cypress 14.4 на исходной и исправленной версии: новых ошибок нет (подробности в разделе «Исправления»). Cypress после исправлений в этом репо не запускался.

**Итог:** блокеров нет. Существенные замечания 1 и 3 исправлены. Замечание 2 закрыто: сценарии удалены намеренно. Замечания 4 и 5 переданы автору PR с готовым кодом.

## Существенные замечания (critical)

| # | Файл | Замечание | Статус |
| --- | --- | --- | --- |
| 1 | `createContact.ts:105` | Сырой селектор `.find('[data-automation="contactPill"]')` в шаге. Селекторы должны быть в Page Object, а `ContactTask.pills` есть, но не используется | **Исправлено**: `ContactTask.pillsInRow()` |
| 2 | `createContact.feature` | Относительно прежней версии удалены сценарии «Horizontal scrolling behavior of the contact table» и «User without proper permissions cannot view Contacts Setup task», убрана колонка «Device info» | **Закрыто**: по SOLO-4018 вне объёма, удалены намеренно (подтверждено автором PR). Колонки «Device info» в клиенте нет |
| 3 | `createContact.feature`, «Contacts table is not shown… when loading contacts fails» | `not.exist` и «no task status should have been saved» проходят сразу после `cy.wait('@getSiteContacts')`, ещё до отрисовки: таблицы не было и до загрузки | **Исправлено**: сначала проверяется видимое состояние (открыта задача QAA Task 2, статус «To Do»), затем отсутствие таблицы и PUT. Автор PR согласен |
| 4 | `createContact.ts:171-176`, outline «Task status is saved exactly once…» | `.should()` повторяет проверку, пока длина не станет 1, и проходит на первом PUT. Дубль, пришедший позже, не ловится, хотя сценарий именно про «exactly once» | Передано автору (найдено агентом, подтверждено по коду) |
| 5 | `createContact.ts:46-50` | `**/links/user-admin` замокан только в сценариях с иконкой редактирования. Если компонент запрашивает ссылку при загрузке, остальные сценарии идут на реальный бэкенд → 401/403 → уход на SSO/Forbidden. Это тот же паттерн, что в красной сборке (`cert/ci-cd-analysis`: `/onboardings` без мока) | Передано автору. Повышено с «второго приоритета» после разбора CI |

## Исправления

**1. Селектор в Page Object** (`tests/page_objects/contactTask.ts`, `tests/step_definitions/createContact.ts`):

```ts
// contactTask.ts: неиспользуемый геттер pills заменён методом
pillsInRow(index: number) {
  return this.contactCells.eq(index).find('[data-automation="contactPill"]');
}

// createContact.ts
ContactTask.contactCells.eq(rowIndex(row)).should('be.visible');

ContactTask.pillsInRow(rowIndex(row)).should($pills => {
  const actualPills = $pills.toArray().map(pill => normalize(pill.textContent ?? ''));

  expect(actualPills).to.deep.equal(expectedPills);
});
```

Для строки без пилюль (`none`) `.find()` вернёт пустой набор, callback в `.should()` получит пустой массив, и сравнение с `[]` пройдёт. Неявная проверка существования при цепочке с `.should()` не добавляется.

**3. Порядок проверок в негативном сценарии** (`tests/features/createContact.feature`):

```gherkin
Then the contacts request should have failed with status 500
And I should see the following information for the task:
    | Field      | Value      |
    | Task Title | QAA Task 2 |
And The task status should be "To Do"
And I should not see the contacts table
And no task status should have been saved
```

Используется существующий шаг `I should see the following information for the task:`, он уже есть в этом же feature, новых шагов нет.

**Предложено автору (4):** перед проверкой количества дождаться итогового статуса в UI:

```gherkin
Then I should see the contacts table
And The task status should be "<status>"
And the task status should have been saved once as "<saved status>"

Examples:
    | count | status      | saved status |
    | 1     | In Progress | IN_PROGRESS  |
    | 2     | In Progress | IN_PROGRESS  |
    | 3     | Done        | COMPLETED    |
    | 4     | Done        | COMPLETED    |
```

**Предложено автору (5):** мок по умолчанию в `mockContactChecklist()`. Шаг `the User Admin link is {string}` регистрируется позже и поэтому имеет приоритет (в Cypress последний зарегистрированный `intercept` срабатывает первым):

```ts
cy.intercept('GET', '**/links/user-admin', { code: 200, data: '<INTERNAL_URL>', message: 'OK' }).as('getUserAdminLink');
```

**Проверка типов.** Временная копия структуры `integration/cypress` с заглушками `BasePage`/`TaskDetails`, `cypress@14.4.0`, `@badeball/cypress-cucumber-preprocessor`, `tsc --noEmit`:

| Версия | Ошибки |
| --- | --- |
| До исправлений | `Buffer` в `.d.ts` плагина (нет `@types/node` во временной копии); `createContact.ts:174,180` — `Property 'request' does not exist on type 'HTMLElement'` |
| После | те же две ошибки (строки сместились на 170, 176), новых нет |

Ошибка про `.request` существовала до правки, см. второй приоритет.

## Замечания второго приоритета (stylistic)

- **Типизация алиасов.** `cy.get('@updateContactTask.all')` типизирован как `JQuery<HTMLElement>`, поэтому `calls[0].request` не проходит `tsc` (найдено при проверке типов). В рантайме работает. Исправление: `cy.get<Interception[]>('@updateContactTask.all')` с `import type { Interception } from 'cypress/types/net-stubbing'` (проверено `tsc`: обе ошибки уходят).
- **Мок PUT.** `PUT **/tasks/*` совпадает с реальным запросом клиента (`api/v1/tasks/${taskId}`, `client/src/app/services/tasks.service.ts:76`). Но обработчик записывает `req.body.status` в контактную задачу для любого PUT. Сузить до `**/tasks/${contactTask.id}`.
- **Дубли шагов.** Два почти одинаковых шага клика по иконке редактирования (`...{int}` и `...{int} times`) с одним и тем же `cy.stub(win, 'open')`. Такой же stub есть в `taskDetails.ts:63-66`. Вынести `stubWindowOpen()` или реализовать одиночный клик как `times = 1`.
- **Одиночный клик.** `a new tab should open…` не проверяет количество вызовов: добавить `should('have.been.calledOnce')`.
- **Повтор смысла.** `The task status should be {string}` повторяет `I should see the status dropdown with {string} selected` (`taskDetails.ts:84`). Переиспользовать существующий шаг или перенести этот в `common/assertionSteps.ts`.
- **Стиль шагов.** Регистр первой буквы неединообразен (`The task status…` / `the contact in row…`).
- **Широкий URL.** `**/sites/*/contacts` можно строить из `site_id`: клиент вызывает `api/v1/sites/${siteId}/contacts`.
- **Пересекающиеся сценарии.** «Нет контактов» и «not saved when no contacts» имеют одинаковую подготовку; два outline'а перебирают одни и те же значения 1–4. Объединить проверки.
- **`@ignore` без ключа бага.** Комментарии к двум сценариям описывают дефекты, но без Jira-ключа. Завести баги и добавить ключи.
- **Конец файла.** В `createContact.feature` нет перевода строки в конце: прогнать через prettier.
- **Локаль.** Имена и инициалы зависят от cookie `locale` (`getName`/`getInitials`). Не подтверждено, что в сессии по умолчанию стоит `en_US`; при необходимости добавить `My user locale is set to "en_US"` в Background.

## Подтверждено как корректное

- `data-automation` в `contact-task.component.html` совпадают с геттерами Page Object; `refreshButton` переиспользован из `TaskDetails`.
- Тексты («No contacts added.», сообщение про 3 контакта, «To Do», «In Progress», «Done») совпадают с `client/src/l10n/en-us.<ORG>.json`. Логика статусов (`COMPLETED` при ≥3, `NOT_STARTED` при 0) совпадает с компонентом.
- Фикстуры клонируются через `structuredClone`, интерсепты имеют алиасы и живут в рамках сценария, `cy.wait(<ms>)` нет.
- У всех сценариев теги `@SOLO-4018` и `@positive`/`@negative`; известные дефекты приложения помечены `@ignore` с комментарием.
- Page Object наследует `BasePage`, экспортируется как singleton и содержит только локаторы.

## Отброшено при проверке (не публикуется)

- «Ambiguous step `The task status should be`» (агент, major): текст отличается от существующего шага, ambiguous нет.
- Поиск колонок по индексу, `any`, захардкоженный конверт ответа, `When` для смены мока (агент, minor): так же сделано в соседних файлах. Без отдельного решения команды это шум.

## Комментарии для PR

> **Критично (1).** В `createContact.ts:105` селектор `contactPill` задан прямо в шаге. Давайте вынесем его в Page Object (`ContactTask.pillsInRow(row)`): селектор будет в одном месте, и шаг не сломается при смене разметки. Сейчас в Page Object есть неиспользуемый геттер `pills`. *Исправлено в коммите ревью.*
>
> **Надёжность (3).** В негативном сценарии загрузки контактов `not.exist` проходит мгновенно: таблицы не было и до загрузки. Предлагаю сначала проверить, что задача открыта и статус «To Do», а уже потом отсутствие таблицы и PUT. *Исправлено.*
>
> **Надёжность (4).** «Saved exactly once» сейчас проходит на первом PUT: `.should()` перестаёт ждать, как только длина стала 1. Если UI пошлёт второй PUT чуть позже, тест его не увидит. Предлагаю сначала дождаться итогового статуса в UI (колонка `status` в Examples), затем проверить количество. Код — в описании ревью.
>
> **Изоляция (5).** `links/user-admin` замокан только в сценариях с иконкой. Если компонент запрашивает ссылку при загрузке, остальные сценарии ходят на реальный бэкенд и получат 401/403. Недавно ровно так (только с `/onboardings`) покраснел `erpTaskApprove`. Предлагаю мок по умолчанию в `mockContactChecklist()`, а шаг с конкретной ссылкой его переопределит.
>
> **Вопрос (2) — закрыт.** Сценарии про горизонтальный скролл и пользователя без прав удалены намеренно, они вне объёма SOLO-4018. Спасибо за подтверждение.

*AI-assisted: первый проход выполнен агентом `test-reviewer` в Claude Code. Все замечания проверены вручную по коду, исправления 1 и 3 проверены `tsc`. Изменения вносятся через PR, не прямым коммитом.*

## Промпты

1. **Первый проход (агент `test-reviewer`):** текст промпта и полный вывод — в `docs/runs/test-reviewer-run.md`.
2. **Комплексное ревью (skill `aqa-pr-review`):** «Вот изменённые файлы SOLO-4018 [список] и наши конвенции (`.claude/rules/cypress-ui.md`, `gherkin.md`). Проведи ревью по категориям: стабильность локаторов, дублирование, изоляция, именование, Page Object, ожидания. Раздели на критичные и стилистические. Для каждого: что, почему, конкретное исправление.»
3. **Дублирование:** «Сравни новые шаги `createContact.ts` с `taskDetails.ts` и `common/*`. Есть ли шаги с тем же смыслом или текстом, которые стоит переиспользовать?»
4. **Изоляция:** «Проанализируй `createContact.ts` на зависимость от состояния других сценариев и на запросы без мока. UI-тесты у нас полностью замоканы, незамоканный запрос уходит на реальный бэкенд.»
5. **Формулировка:** «Сформулируй вежливый комментарий к PR про проблему [описание]: почему это проблема и конкретное решение с кодом.»
