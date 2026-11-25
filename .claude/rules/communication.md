---
paths:
  - "docs/**/*comms*.md"
  - "docs/**/*digest*.md"
---

# Daily communication conventions (AQA)

## Facts first
- Every message rests on real data: test name, exact error text or stack trace, retry history, counts. No data, no message: ask for it.
- State a cause only if it matches the error text. Label guesses as guesses.
- "Flaky" vs "bug" is decided from retry history (5-10 runs), not from one run.

## Triage: where does it go
- Separate message to devs now: new failure with a clear repro or a regression.
- Daily digest: known flaky, non-blocking failures.
- Escalate to PM: a blocker that delays dates (blocked test count, duration, affected release).

## Audience
- Developer: technical, short; test, step, error, repro, evidence, "app bug or unstable test" with reasons.
- PM: plain language, no jargon; what is blocked, since when, impact on dates from real numbers.
- Team channel digest: stability, run time, top problematic tests, trend vs previous period.

## Glossary (use consistently)
- flaky: passes and fails on the same code and data.
- blocker: automation cannot proceed or a release is blocked.
- known issue: failure already tracked in a ticket (give the key).

## Safety
- Never put hosts, secrets, user or customer data in a message.
- When working on several client projects, never carry details of one into a message about another.
- Re-read the draft against the logs before sending; the sender is responsible for the text.
