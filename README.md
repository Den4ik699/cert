# cert — AQA-флоу на проекте Onboarding admin portal

Рабочие артефакты по трём ситуациям из практики AQA: красный CI, ежедневная коммуникация, ревью тестов. Внутренние хосты, имена секретов и название организации заменены на плейсхолдеры (`<APP_HOST>`, `<SSO_HOST>`, `<BUCKET>`, `<INTERNAL_HOST>`, `<ORG>`).

Каждая ситуация лежит в своей ветке:

| Ветка | Ситуация | Документ | Итог |
| --- | --- | --- | --- |
| `cert/ci-cd-analysis` | Красная сборка CodeBuild (UI-тесты) | `docs/01-ci-analysis.md`, `docs/runs/ci-log-analyst-run.md` | Причина найдена (запрос `/onboardings` без мока → 403), мок добавлен, спек зелёный |
| `cert/daily-comms` | Сообщения по результатам CI | `docs/02-comms.md`, `docs/runs/comms-fact-checker-run.md` | Сообщения dev/PM/дейли/дайджест/flaky + follow-up после фикса |
| `cert/code-review` | Ревью тестов по контактам (SOLO-4018) | `docs/03-code-review.md`, `docs/runs/test-reviewer-run.md` | Замечания critical/style; исправления 1 и 3 внесены в `tests/`, для 4 и 5 автору передан готовый код |

Общее для всех веток:
- `docs/00-setup.md` — как это устроено на проекте: Claude Code, Jira/Confluence, Playwright MCP, состав `.claude/`, выбор модели, память, безопасность;
- `CLAUDE.md` — выдержка из проектного `CLAUDE.md` (структура, команды, конвенции), на которую ссылаются агенты.

В каждом документе задания есть раздел «Промпты» с запросами, которые отправлялись в Claude.

## Флоу

```
Ситуация                 Skill                  Агент                                Рул                         Результат
красный CI           →   ci-failure-analysis →  ci-log-analyst (анализ по логу)      rules/ci-pipeline.md    →   факты, гипотезы, инцидент
                                                test-failure-analyst (перезапуск)
нужно сообщить       →   daily-comms         →  comms-fact-checker (сверка черновика) rules/communication.md →   сообщения dev/PM, дайджест, flaky
ревью тестов / PR    →   aqa-pr-review       →  test-reviewer (только чтение)         rules/code-review.md,   →   замечания critical/style
                                                                                      cypress-ui, gherkin, api-tests
```

Правило для всех трёх: вывод агента проверяется по исходному коду или логу, причина не называется, пока её не доказывает лог, а изменения от ИИ идут через PR с пометкой AI-assisted.

## Что использовалось на самом деле

- **CI (`cert/ci-cd-analysis`):** разбор написан по реальному логу CodeBuild, затем `ci-log-analyst` запущен на сводке этого лога (`docs/runs/ci-log-analyst-run.md`). Агент честно оставил причину «не установленной» и предложил проверки. Проверку выполнил я: локальный прогон `erpTaskApprove` и вкладка Network показали запрос `/onboardings` без мока (403). После добавления `cy.intercept` спек зелёный. Инцидент закрыт.
- **Коммуникация (`cert/daily-comms`):** сообщения написаны по реальному запуску. `comms-fact-checker` запускался дважды. Первый запуск нашёл 8 неточностей: 6 исправлено, остальное оставлено с пометкой. Второй запуск, после follow-up и правок, нашёл ещё 10: 9 исправлено (`docs/runs/comms-fact-checker-run.md`). Тренд за неделю: остальные сборки зелёные.
- **Ревью (`cert/code-review`):** первый проход сделал агент `test-reviewer` по рулам проекта (`docs/runs/test-reviewer-run.md`). Из 6 major приняты 4, 1 понижен, 1 отклонён после проверки по коду. Замечания 1 и 3 подтверждены с автором PR и исправлены отдельным AI-assisted коммитом, исправления проверены `tsc` с типами Cypress 14.4. Cypress после правки в этом репо не запускался.
- Агенты запускались как субагенты Claude Code с инструкциями из файлов агентов. Skills `ci-failure-analysis`, `daily-comms`, `aqa-pr-review` и рулы задают порядок работы и чек-листы.
