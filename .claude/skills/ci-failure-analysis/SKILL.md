---
name: ci-failure-analysis
description: Diagnoses a failed CI run (CodeBuild / GitHub Actions) of the UI/API test suite from the pipeline config and the full run log. Use when the user pastes a CI log, asks why a build is red, or wants a pipeline review. Separates test / environment / pipeline-config causes and never states a root cause the log does not prove.
---

Follow Research → Plan → Implement → Verify.

## 1. Research
- Ask for what is missing: pipeline config (`buildspec.yml`, workflow files), the FULL log of the failed run (stage start included), the last green run of the same pipeline, Allure/JUnit report, screenshots.
- State up front what the log does NOT contain (earlier phases, other test suites, timings). Do not draw conclusions about those parts.
- Read the config before the log; map each log section to a phase/stage.

## 2. Plan
List hypotheses in the order they will be excluded, each with a category:
`test` (missing mock, brittle locator, shared state) / `environment` (stand, SSO, backend, runner resources) / `pipeline config` (order, cache, timeouts, secrets).
For each: evidence for, evidence against, how to check.

## 3. Implement
Produce, in this order:
1. Facts from the log (counts, failing specs, exact error text, retry behaviour, which phase failed and why).
2. Hypotheses table (above). Mark a hypothesis as refuted when the log contradicts it.
3. Stage explanation: what the failing phase does line by line and what happens when it fails.
4. 3–5 improvements, each with risk and expected effect.
5. Incident text for a ticket: cause (or "not established"), affected tests/stages, proposed fix, status.

## 4. Verify (mandatory)
- Quote error text from the log, not from memory. Line numbers in stack traces may belong to another build of the file: check against the source before relying on them.
- Classify "flaky" only from retry history. A test that passed on a retry is a flaky candidate even when the build is green.
- A fix must address the cause. Never propose raising timeouts or disabling a step as the first answer; say what it would hide.
- Config changes are tested in a separate branch by re-running the pipeline.
- Prefer API checks over UI automation and curate what runs on every trigger by business value.

## Output rules
- Mask hosts, bucket names, ARNs, secret names, user data (`<APP_HOST>`, `<BUCKET>` …) before writing anything to a shared document.
- If the root cause is unproven, write "not established" and list the checks that would prove it.
