# Verification and second security review

Date: 2026-10-03. This records local source/fixture verification before PR publication; check the PR's live CI status separately. No merge or deployment occurred.

## Changes

Validates/caps restored conversation roles/content, caps input/context, prevents duplicate concurrent submissions, bounds request time and hides raw backend errors; adds static CSP/referrer policy.

## Validation

4 offline security tests pass; selected history/error regression tests fail against 8f060e2. Chromium smoke passes with synthetic API responses and no JavaScript/CSP error; model HTML is displayed as text.

No dependency upgrade required: no dependency manifest/runtime package graph in tracked source.

## CI activation pending repository authorization

The complete security workflow is prepared at [security-workflow.yml](security-workflow.yml), but is not active. GitHub rejected the local OAuth credential because it lacks the workflow scope; the connected GitHub app also cannot write the private repository. No account scope was broadened. A maintainer with workflow write permission can add the exact reviewed file as .github/workflows/security.yml on this PR branch, then run/check it before merging. The template has no deployment or production-secret step. Dependabot configuration is included; it becomes effective after a reviewed merge into the default branch. Local security tests/scans passed; no successful GitHub Actions run is claimed.

## Second review

Reviewed the final diff for secret additions, authentication/authorization, input handling, database/API boundaries, permissions, logging/error exposure, dependency changes, AI tool execution and regression coverage. The relevant threats and controls are in SECURITY.md and the pre-change assessment. Browser apps remain browser apps; no client check is represented as server authorization. Missing backend/cloud configuration was not assumed safe. Tests use synthetic data and no production credentials. CI permissions are read-only, action commits/scanner digest pinned, checkout credentials not persisted, no pull_request_target/production secrets/deployment step. Only exact, manually reviewed historical test-key fingerprints are exempted where present.

## Remaining risks

Backend source absent: auth, server quotas, CSRF policy, secrets and model billing cannot be attested. localStorage remains unencrypted; browser checks must not be treated as server security.

The assessment is not a penetration test of running services, a complete formal proof, or a production security certification. Git scans cover fetched reachable refs, not deleted/unavailable history. No live secret was confirmed; never interpret a clean scan as proof of absence.
