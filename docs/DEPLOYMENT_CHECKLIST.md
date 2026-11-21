# Deployment verification checklist

Do not confuse public source publication with accepting real users. This release changes files only.

## Before configuring a host

- [ ] Verify control of the intended hostname and Git repository. Use `compa-unpatchabel.netlify.app`, which returned HTTP 401 during publication; `compa.netlify.app` is a different hostname.
- [ ] Verify the existing Netlify project and build hook for `compa-unpatchabel.netlify.app`; use Cloudflare Pages only if deliberately migrating.
- [ ] Complete Git-history/ownership checks in RELEASE.md.
- [ ] Provision a disposable Supabase environment; back up any existing project before upgrade.
- [ ] Compare migration history and apply all missing migrations in order; never reset a live project.
- [ ] Inspect/remediate legacy answers; validate `profile_answer_strings`.
- [ ] Confirm all nine tables have RLS and expected grants. Verify every definer owner is trusted, search path is empty and PUBLIC/anon execution is revoked.
- [ ] Disable anonymous Auth sign-ins. Configure Google OAuth credentials/provider callback and intended password recovery behavior. Verify email confirmation, SMTP and Auth rate limits as applicable.

## Build and CDN

- [ ] Use Node 22.22.2+ or supported Node 24.15+; `npm ci`, all local tests, build, check and audit pass.
- [ ] Supply both public Vite values at build time, never a privileged credential. Build must be connected rather than setup-only for launch.
- [ ] Netlify uses `netlify.toml`; Pages uses `npm ci && npm run build` and `dist`.
- [ ] Confirm `dist/_headers` is deployed. Check root HTML and asset responses using `curl -I`; verify CSP, nosniff, frame denial, permissions, HSTS and referrer policy.
- [ ] Narrow CSP HTTPS/WSS to the actual project origins. Update for custom Supabase domains; do not add broad script exceptions to hide errors.
- [ ] Check browser CSP violations, MIME types, console and failed network requests. Verify OAuth navigation works with form/script restrictions.
- [ ] Add exact HTTPS app callback to Supabase Site URL/redirect settings and exact local development URLs separately. Avoid wildcard production redirects.
- [ ] Understand that a frontend host cannot protect direct Supabase API traffic through its own rate limits or CSP.

## Disposable local / staging functional verification

- [ ] Execute `npm run test:integration` against localhost with explicit disposable marker and local-only test keys; confirm cleanup.
- [ ] Use separate browser sessions with three synthetic accounts. Exercise signup, recovery, sign-out, cross-account switch, expired tokens, refresh and reopen persistence.
- [ ] Test onboarding, edit validation, empty/error/loading states, both discovery modes and linked users outside latest 500.
- [ ] Test mutual/queued matches, expired likes, simultaneous reciprocal/duplicate hellos and one-active-slot invariant.
- [ ] Test unauthorized reads/writes using real JWTs/PostgREST; do not treat hidden UI as authorization.
- [ ] Test send/history/Realtime isolation, pagination, polling gaps, blocked stale tabs, ended chat and concurrent block/send/end requests.
- [ ] Confirm hello/message/report quotas under concurrent independent connections, not only one client loop.
- [ ] Verify self-deletion in real Auth and cascading app rows. Verify other accounts survive, shared conversations disappear as disclosed, refresh sessions cannot restore app rows and backups follow policy.
- [ ] Check mobile widths, keyboard focus, screen reader labels/log announcements, contrast and reduced motion in a real browser.

## Real-user launch gates

- [ ] Assign a moderator and monitored private reporting/contact route; test that a report results in human action.
- [ ] Publish actual conduct/privacy/eligibility rules; do not claim verified age or university membership.
- [ ] Decide legal retention and moderation-evidence requirements, including account deletion behavior. Establish backup restoration and scheduled purge procedures.
- [ ] Integrate CAPTCHA/account abuse controls if needed before enabling corresponding Auth enforcement.
- [ ] Configure logs, uptime/abuse monitoring, quotas, spending alerts and incident key-rotation process.
- [ ] Review account farming, re-registration after blocking/deletion, authenticated scraping and global category-lock load.
- [ ] Record environment, commit SHA, migration versions, test commands, results, reviewer and date. Do not mark this checklist complete based solely on this ZIP.
