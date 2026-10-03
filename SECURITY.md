# Security

## Architecture and boundaries
This public repository contains browser UI only; /api/chat and /api/health server implementations are absent. No backend authentication, rate limits, key storage, model policy or billing safety has been verified here. Never put provider keys into these files. The browser is untrusted and its role/history/input limits are usability and resource controls, not server authorization.

Only bounded user/assistant history is restored; duplicate submissions are suppressed. Model content uses textContent and is never interpreted as HTML or a tool request. Errors shown to the user are fixed text. No model tools or sensitive autonomous actions exist in this UI. History persists unencrypted in localStorage on this origin/device until Clear is used. Use synthetic text on shared devices; do not enter personal/secret information in a public demo. The backend must independently validate roles, payload bytes, user authorization, origin/CSRF policy, per-user quotas and timeouts, and must not return raw provider failures.

Static CSP allows own scripts/connections, denies objects/base/form submissions and sends no referrer. Meta CSP cannot enforce frame-ancestors; hosting must set it, nosniff and HTTPS headers. Deployment/domain and backend settings are owner tasks. Verify with node --test tests/security.test.mjs and open index.html through a local server.

## Reporting and maintenance
Use GitHub private vulnerability reporting if enabled for this repository, or an already established private maintainer contact. If neither is available, open an issue asking for a private contact without publishing exploit details, customer data or credentials. Never paste a secret into an issue or pull request. Potential historical credentials must be treated as compromised, rotated by the owner and audited before any history rewrite; no rotation or rewrite is automatic.

See [pre-change assessment](docs/security/ASSESSMENT.md) and [verification/review](docs/security/VERIFICATION.md). Source review and offline tests are not production certification. The prepared security workflow (not yet active; see VERIFICATION.md) is read-only, pinned by commit, uses no production credentials and never deploys. Keep action pins and scanners current through reviewed maintenance PRs.
