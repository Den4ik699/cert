---
paths:
  - "buildspec.yml"
  - ".github/workflows/**"
  - "ci/**"
  - "docs/**/*ci*.md"
---

# CI/CD analysis conventions

## Evidence
- A diagnosis needs the pipeline config AND the full log of the failed run (stage start included). Say explicitly which parts of the log are missing and draw no conclusions about them.
- Prefer a green run of the same pipeline for comparison. Quote error text from the log, never from memory.
- Stack-trace line numbers may refer to another build of the file: check against the source before using them.

## Classification
Every cause is one of: `test` / `environment` / `pipeline config`. Always list more than one hypothesis with evidence for, evidence against and a check. Mark refuted ones. If the cause is not proven, write "not established".

## Flaky
Decide from retry history only. A test that passed on a retry is a flaky candidate even when the build is green. One failed run is not enough.

## Fixes (do not mask the problem)
- Do not raise timeouts, add retries or disable a step as the first answer; say what that would hide.
- Test config changes in a separate branch and re-run the pipeline; never apply them blindly.
- Check proposals against runner limits, permissions and security policy.

## Pipeline design
- Do not run everything on every trigger: curate by business value and coverage.
- Prefer API checks over browser UI automation (faster, more stable, cheaper).
- Keep reports per build id so runs can be compared; never delete the old report before the new one is uploaded.

## Secrets and data
Never print secret values. Mask hosts, buckets, ARNs and secret names in shared documents (`<APP_HOST>`, `<BUCKET>`, `<ROLE_ARN>`, `<SECRET_NAME>`).
