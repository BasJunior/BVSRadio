# BVS Radio repository privacy — agent handover

_2026-11-04 (Europe/Berlin). Do not commit secrets or sensitive incident evidence here._

## Verified status at handover

- Repository: `BasJunior/BVSRadio`, branch `main`.
- Related active product repository: `BasJunior/bvsradio-saiba`.
- GitHub API metadata on 2026-11-04 identified **both repositories as PUBLIC**. The operator requested both be private and their history checked for credential exposure.
- Connected GitHub file-editing tools do not provide an operation to change repository visibility. **Conversion to PRIVATE has not been completed/verified by this agent.** The exact date on which either repository became public remains unknown.

## Next actions

1. Authorized repository owner/admin: visit **Settings → General → Danger Zone → Change repository visibility**, set **both** repos PRIVATE, and independently verify the result in GitHub settings/API. Record the actual timestamp and administrator below.
2. Audit **all refs and historic commits**, not only the working tree, for inadvertently committed secrets. Include CI logs/artifacts, PR diffs, and public forks/copies. Use approved secret-scanning tools and keep findings in a **private** security channel.
3. If any live secret is found, revoke/rotate it at the source and update all dependent deployments; do not treat privatizing or rewriting Git history as equivalent to revocation.
4. Check GitHub/Vercel deployment integrations and collaborator access following the visibility change. The BVS Radio public website and app need not be private when the source repo is private.

## Checks completed

- On 2026-11-04, the `main` branch tree contained **50 entries**; the only environment-named file found was `.env.example` (a template). Initial code search found configuration references but no confirmed leaked secret. These checks **are not a full historical credential audit**.
- Primary repository's separate `docs/security/README.md` contains the broader incident handover and scope.

## Resolution log

- Privacy change for this repository: **pending independent confirmation**.
- Privacy change for `bvsradio-saiba`: **pending independent confirmation**.
- Credential exposure status: **not established; full history review pending**.

Update this document only with verified outcomes and never include actual credential values.
