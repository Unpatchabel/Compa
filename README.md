# COMPA

**Find one friend per interest.** COMPA is a friendship discovery application for people who would rather start with a shared interest than a follower count. Personal interests and opt-in academic programme/year groups lead to mutual hellos and private conversations.

This is a portfolio project with executable database authorization tests. It is **not a verified production service**. The Git history was scanned before publication, but authenticated hosted Supabase and production behavior remain untested. See [validation results](docs/VALIDATION.md) and [release verdict](docs/RELEASE.md).

## Implemented experience

- Google OAuth signup/sign-in; email/password sign-in for existing accounts; password recovery. **Email/password signup is not implemented.** Google must be enabled in Supabase.
- Five-step profile onboarding with general area, two interests, three answers, themes and pixel-art presets; profile editing.
- Personal and academic discovery; passes; expiring hellos with optional openers; queued mutual hellos.
- Mutual matching with one active friend per user/category, enforced by a PostgreSQL partial unique index.
- Persisted messages with membership checks, Realtime subscription and 30-second polling fallback; history pagination.
- End connection, block, report, and self-service account deletion. Safety options are available before matching.
- Responsive layouts, reduced motion support, keyboard focus styles, named dialogs and text-only rendering of user content.

There is no moderator dashboard, automated report alert, CAPTCHA integration, email signup, profile photo upload, unblock interface, or back navigation through onboarding steps. Reports being stored does not mean anyone has reviewed them.

## Stack and architecture

JavaScript ES modules, Vite, HTML/CSS, Supabase JS, Supabase Auth, PostgreSQL, PostgREST and Realtime. PGlite provides disposable embedded PostgreSQL tests; jsdom provides simulated UI tests; Playwright provides a browser test harness.

The static frontend calls Supabase using a **public publishable key** (or legacy anon JWT). Supabase verifies the user's token. RLS filters reads; column grants protect profile ownership and timestamps. Matching, messages and safety writes use narrow `SECURITY DEFINER` RPCs with explicit authorization and pinned empty search paths. No custom application server or privileged browser key is required.

| Data | Read rule | Write rule |
| --- | --- | --- |
| Profiles | Authenticated discovery, excluding either-direction blocks; own row always visible | Own insert/update, permitted columns only |
| Likes | Sender or recipient | Matching RPCs only |
| Matches | Participant | Matching/end/block RPCs only |
| Membership | Own membership | Matching/end/block RPCs only |
| Messages | Participant, no either-direction block; ended unblocked history remains readable | Active member via rate-limited RPC |
| Blocks / passes | Blocker / viewer | Self-only RPCs |
| Reports | Reporter only | Rate-limited report RPC; operator needs privileged access for moderation |
| Hello events | No client reads | Internal append-only quota accounting |

Hellos are limited to 20/hour, messages to 20/minute and reports to 5/day per account. Category advisory locks serialize matching, blocking and connection termination; the unique index is the final active-slot guard. Passes are capped at 5,000/account. These controls do not prevent account farming, authenticated scraping or volumetric abuse. Profile fields and academic affiliation are self-declared, not verified.

## Local setup

Use Node.js **22.22.2+ or Node.js 24.15+** (22 LTS recommended).

```sh
npm ci
cp .env.example .env.local
# Windows PowerShell: Copy-Item .env.example .env.local
```

Set these public build-time values:

| Variable | Meaning |
| --- | --- |
| `VITE_SUPABASE_URL` | Project HTTPS API URL; localhost allowed for disposable local stacks |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public `sb_publishable_…` key or legacy anon JWT |

`VITE_` values are bundled into downloadable JavaScript. Never put `sb_secret_…`, a service-role JWT, database password or SMTP credential there. Build configuration rejects elevated Supabase keys. Keep `.env.local` untracked.

Run all migrations below, then configure Google OAuth in Supabase and allow exact app callback URLs. For local development use `http://127.0.0.1:5173/`; preview uses port 4173. The client uses PKCE, so OAuth/recovery links must complete in the browser holding the verifier.

```sh
npm run dev
npm run build
npm run preview
```

A build with both public variables absent shows a setup screen. A successful setup-screen build is not a connected application test. A build with only one variable fails.

## Database initialization and upgrades

Use a **new disposable Supabase project or local Supabase stack first**. Supabase must supply `auth.users`, `auth.uid()`, the `anon`/`authenticated` roles and `supabase_realtime` publication. This schema is not intended for bare PostgreSQL without those objects.

Apply every file in `supabase/migrations` in timestamp order:

1. `20260925000000_initial.sql`
2. `20260928000000_academic.sql`
3. `20260928010000_remove_relationship_status.sql`
4. `20261121000000_hardening.sql`

With an installed Supabase CLI, initialize the local stack with `supabase init`, `supabase start`, then `supabase db reset`. The CLI creates its local config; inspect it before use. Alternatively execute each SQL file once, in order, in a disposable Supabase SQL editor. Never rerun old table-creation migrations against an existing database. Existing deployments should back up, compare migration history and apply only unapplied migrations after staging validation.

The new answer-type constraint is `NOT VALID` to preserve legacy rows while enforcing future writes. Check and repair malformed legacy answers, then run:

```sql
select id from public.profiles where not public.valid_profile_answers(answers);
-- After repairing each row with the owner's intended answers:
alter table public.profiles validate constraint profile_answer_strings;
```

Do not silently replace users' answers. The hardening migration raises the JSON byte cap for Unicode answers and keeps each answer bounded to 80 characters. Historical migrations remain unchanged. The status-removal migration intentionally drops old relationship-status data; back it up securely if operationally required.

## Tests

```sh
npm test                 # Real SQL/RLS in embedded PostgreSQL, synthetic Auth schema
npm run test:dom         # Real frontend code with simulated Supabase and DOM
npm run build
npm run check            # Targeted secrets/rendering/header/build checks
npm audit --audit-level=moderate
```

Optional browser test:

```sh
npx playwright install chromium
npm run test:browser
# Or COMPA_CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

The browser harness mocks Supabase HTTP. It does not prove backend authorization. It could not execute in the review environment because Chromium socket creation was prohibited.

For real HTTP/Auth/RLS/concurrency tests, start a **disposable local Supabase** with all migrations and set `COMPA_DISPOSABLE_DB=YES`, `COMPA_TEST_URL=http://127.0.0.1:54321`, `COMPA_TEST_ANON_KEY` and `COMPA_TEST_SERVICE_KEY` in your shell. Then run `npm run test:integration`. This server-side test creates random `example.invalid` users and removes those users in `finally`; it refuses hosted URLs. Never copy the test service key into Vite configuration. Tests are not a substitute for checking email delivery, OAuth redirects and Realtime on staging.

See [authorization matrix](docs/AUTHORIZATION_MATRIX.md) for coverage and its limits.

## Deployment

Both **Netlify** and **Cloudflare Pages** can host the generated static `dist` directory. The repository contains an explicit Netlify build configuration; `public/_headers` is copied by Vite and supported by both hosts. This is supported configuration, not proof of the current live deployment.

The existing project URL is **https://compa-unpatchabel.netlify.app**. A read-only check during publication returned HTTP 401, so the app and its authenticated behavior could not be inspected. An earlier archive review checked `compa.netlify.app`, a different hostname serving unrelated content; it is not the project URL. Netlify is the project's identified hosting setup; no dashboard/build-hook inspection was available. Cloudflare Pages is documented only as an alternative.

- Netlify: use `netlify.toml` (`npm ci && npm run build`, publish `dist`, Node 22).
- Cloudflare Pages alternative: select Vite, use the same command/output and Node version.
- Set both public Vite variables in build settings, rebuild, configure exact HTTPS Auth redirects, and verify deployed headers and app behavior.
- For a custom Supabase domain, update CSP `connect-src` to its HTTPS/WSS origins. Prefer exact project origins instead of the shared `*.supabase.co` allowance before a public launch.

CSP restricts scripts to self, blocks frames/objects and allows inline styles required by the existing dynamic theme/art layout. External Google Fonts requests were removed; system fonts are used. No third-party analytics are included. The Vite preview/dev servers do not emulate production CDN headers. Supabase API authorization is independent of frontend CSP or hosting controls; Auth redirect allowlists are not an RLS boundary or general API CORS firewall.

## Privacy and operations

Public profile fields are visible to signed-in nonblocked users. Use a general area, never a home address. Account email is held in Auth, not discovery profiles. Local browser session persistence means a compromised browser or XSS could expose a session; use a trusted device and sign out on shared computers.

Deletion removes the Auth account and cascading app rows, including shared conversations, reports and blocks involving that account. It does not erase operator backups instantly, revoke already-issued JWTs instantly, or preserve moderation evidence. Decide retention and abuse-evidence requirements before launch. No Storage buckets are used; adding uploads requires new deletion/RLS rules.

Reports have no guaranteed human response. Before accepting real users, establish a moderator, private incident contact, conduct policy, privacy notice, eligibility rules, backup/retention policy and abuse controls. No privacy-compliance or production-safety certification is claimed.

## Screenshots

**Placeholder — discovery:** add a current desktop/mobile screenshot using synthetic profiles, without real student data.

**Placeholder — conversation:** add a current matched-chat screenshot using synthetic accounts. Label simulated fixtures clearly.

## Roadmap and limitations

Priorities: staging integration/concurrency verification; moderation workflow and notifications; CAPTCHA and account-farming controls; exact-origin CSP; cursor-based discovery pagination; audited retention jobs; browser accessibility and mobile review. Discovery currently considers the latest 500 profiles, with linked profiles fetched separately. Academic affiliation and age are not verified. Category-wide locking is simple but must be load-tested before scale. Some handlers remain in the original large `app.js`; modularization is a future maintenance task.

## License and contribution

No license was present in the supplied archive. **No open-source license is granted by this release preparation.** The owner may choose and add a license after checking ownership and third-party assets. A public repository alone does not grant reuse rights. `private: true` in `package.json` prevents accidental npm publishing; it does not stop public GitHub visibility.

Read [SECURITY.md](SECURITY.md), [changes](docs/CHANGES.md), [security findings](docs/SECURITY_FINDINGS.md), [deployment checklist](docs/DEPLOYMENT_CHECKLIST.md) and [Git history/publication checks](docs/RELEASE.md).

Publication verification is recorded in [PUBLICATION.md](docs/PUBLICATION.md).
