# BVSRadio Security

## Current hardening baseline

This repository contains defense-in-depth controls, but no document or scan should be interpreted as proof that a production deployment is vulnerability-free.

### Authentication and authorization

- Protected API routes require a signed JWT in `Authorization: Bearer <token>`.
- Tokens are restricted to HS256, must match the configured issuer/audience, and must contain an expiration and valid numeric subject.
- Production startup fails closed when `JWT_SECRET` is missing or too short.
- Administrative product mutations require the signed `admin` role.
- Playlist mutations enforce ownership at the SQL query level.
- Message mutations are scoped to the authenticated sender/recipient.
- The former `x-user-id` authentication bypass has been removed.

### Privacy and data access

- Public user profiles do not return email addresses.
- Public playlist endpoints return public playlists only.
- Public activity endpoints filter out non-public activities.
- Internal exception/database messages are logged server-side and replaced with generic client errors.

### Input and transport controls

- JSON/form bodies are capped at 100 KB.
- IDs, pagination, quantities, profile/message/product fields, URLs, and checkout fields are validated and bounded.
- CORS uses an explicit origin allowlist from `CORS_ORIGIN`.
- Helmet security headers are enabled and the Express fingerprint header is disabled.
- Next.js disables SVG image optimization explicitly and adds conservative browser security headers.
- Database TLS can be required with `DB_SSL=true`; query/statement timeouts are configured.

### Abuse and transactional controls

- API rate limiting is bounded in memory and returns standard limit/retry headers.
- Multi-instance production deployments must also use a shared edge/Redis/WAF limiter.
- Cart creation is serialized in PostgreSQL.
- Checkout locks inventory and creates order/items/stock changes/cart clearing in one transaction.
- Orders are created as `pending`; fulfillment must depend on a verified server-side payment-provider webhook, never a client success response.
- Database migration `002_security_integrity.sql` adds checks for negative prices/stock/totals, invalid quantities, self-messaging, and related integrity rules.

### Dependency posture

- Next.js is pinned to the patched `15.5.28` maintenance line because older releases including 14.x are affected by critical 2026 advisories.
- Dependabot is enabled for both backend and frontend npm dependencies.

## Production requirements

Before deployment:

1. Generate a unique high-entropy `JWT_SECRET` (minimum 32 characters) and keep it only in the deployment secret store.
2. Set exact production origins in `CORS_ORIGIN`.
3. Set `DB_SSL=true` for remote PostgreSQL connections using a certificate chain trusted by the runtime.
4. Configure a shared/edge rate limiter for horizontally scaled deployments and stricter limits on authentication, OTP, password reset, signup, upload, and payment endpoints.
5. Issue short-lived JWTs from the trusted authentication service. Account/session revocation should be enforced by that service or a server-side session/token-version mechanism.
6. Validate payment-provider webhook signatures before changing any order from `pending` to paid/fulfilled.
7. Keep uploads in private object storage by default; validate MIME type, extension, size, ownership and authorization, and scan untrusted uploads as appropriate.
8. Enable security logging/alerting for failed auth, authorization denials, rate-limit events, admin changes, payment events, and unusual data access.
9. Run the migration command and verify constraints against existing production data before validating legacy rows.
10. Rotate any credential that was ever committed to a public repository, even if it was later deleted.

## Repository exposure incident response

If this repository has been public, making it private stops new anonymous access but does not invalidate copies already made. Review the entire Git history and deployment logs for credentials. Rotate database passwords, JWT/session secrets, SMTP credentials, payment API keys, cloud/storage credentials, signing keys, webhook secrets and other long-lived tokens if there is any possibility they were exposed.

## Reporting

Report suspected vulnerabilities privately to the BVSRadio maintainers. Do not include credentials, personal data, access tokens, or production customer records in public GitHub issues.
