---
name: daily-comms
description: Drafts AQA daily communication from real CI data - a message to a developer about a failed test, a daily stand-up update, a plain-language blocker note for a PM, a CI health digest, and flaky-test classification. Use when the user asks for a status message, digest, or wants to report a failure to the team.
---

## Inputs (ask if missing)
Failed test names, exact error text / stack trace, retry history (last 5-10 runs), automation status list, open blockers, related ticket keys, earlier chat messages on the same problem. Without real data do not write the message: ask instead.

## Decide first
Per item choose: separate message to devs now / line in the daily digest / escalate to PM as a blocker. A known flaky or a non-blocking failure is not an incident.

## Message types
1. **To a developer**: test name, where it failed, exact error text, repro steps, evidence (log/screenshot), assumption "app bug or unstable test" with the evidence behind it.
2. **Daily update**: done / in progress / blockers, 3-6 lines.
3. **To a PM**: plain language, no jargon; what is blocked, how many tests/for how long, impact on dates. Impact estimates only from real numbers.
4. **CI digest**: stability, run time, top problematic tests, trend vs previous period.
5. **Flaky classification**: from the run history. Say "flaky candidate" and list the data still needed before fixing.

## Verify before sending
- The cause stated matches the error text in the log; mark guesses as guesses.
- "Flaky" is based on history, never on one run.
- Tone and detail match the reader (dev: technical; PM: impact).
- No hosts, secrets, personal data of users or customers in the text.

## Do not
Invent numbers, blame a team, or leave minor flakes unreported until they become systemic.
