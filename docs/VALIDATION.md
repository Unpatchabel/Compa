# Validation record

Date: 21 November 2026. Runtime: Node v24.22.3, Linux. Tested the supplied archive and corrected files locally. No live database credentials were provided. All test user data was synthetic.

| Check | Exact result | Meaning |
| --- | --- | --- |
| Initial dependency install | `npm ci` exit 0; 25 packages added | Original lock installed |
| Original authorization suite | Exit 0 | Existing tests passed, but skipped the status-removal migration |
| Initial `npm audit --json` | Exit 1; 2 high-severity affected packages: Vite and source-map-js | Tooling dependencies required updates |
| Final clean install | `npm ci` exit 0; 55 packages added | Corrected lock installs successfully |
| Expanded authorization | Exit 0; **77 assertions** | All migrations, real SQL/RLS/RPC execution in embedded PostgreSQL; synthetic Auth roles/schema |
| Upgrade test | Exit 0 | Existing malformed answer preserved; invalid update rejected; remediation/constraint validation succeeds |
| Build-config tests | Exit 0 | Elevated service JWT/secret, partial variables and insecure remote URL rejected; public/localhost/setup config accepted |
| DOM frontend tests | `npm run test:dom` exit 0 | Simulated Supabase sign-in, candidate text/XSS defense, pre-match safety, hello payload, profile update, sign-out clearing |
| Setup-only build | `npm run build` exit 0, Vite 6.4.6 | No credentials; application renders setup screen. Not an online app test |
| Configured build | Public synthetic `https://mock.supabase.co` / `sb_publishable_fixture`; exit 0 | Full SDK/application code builds without contacting a real project; JS 262.28 kB before final minor config-only edits |
| Release checks | `npm run check` exit 0 | JS syntax; targeted key/private-key/service-JWT patterns; environment-file exclusion; unsafe HTML sink check; headers copied into dist; Netlify output setting |
| Final dependency audit | `npm audit --json` exit 0; **0 vulnerabilities** | Registry advisories at review time; not a guarantee of no unknown vulnerabilities |
| Optional harness syntax | `node --check tests/supabase-local.mjs` and `tests/browser.mjs` exit 0 | Syntax only; not integration execution |
| Real browser test attempt | Exit 1 before any assertions | Chromium launch blocked: socket creation `Operation not permitted`; no real layout/accessibility/browser result is claimed |
| Local Supabase HTTP integration | **Not executed** | No disposable local stack/keys available; no PostgreSQL, Supabase CLI or Docker installed in the environment |
| Hosted Supabase Auth/REST/Realtime | **Not executed** | No credentials or configuration access; production RLS, email, OAuth and Realtime unverified |
| Existing Git history | **Not available** | ZIP has no `.git`; no historical secret/PII clearance |
| Deployed COMPA | **Not identified** | Prior Netlify hostname returned unrelated HTML; neither production source nor effective headers for this release established |

Final locked direct dependencies: `@supabase/supabase-js@2.117.2`, `@electric-sql/pglite@0.5.8`, `vite@6.4.6`, `jsdom@31.0.1`, `playwright@1.65.1`. Locked transitive `source-map-js@1.2.4`.

Installation emitted runtime-specific warnings about an injected `http-proxy` npm setting and esbuild install-script approval. Build completed successfully. These warnings were not treated as test failures.

## Evidence boundaries

PGlite is an embedded PostgreSQL engine; authorization tests execute database roles, RLS and PL/pgSQL. Its Auth schema/JWT subject and Realtime publication are synthetic. Tests run through one embedded connection, so no simultaneous-session or hosted API claim follows. The separate local-only integration harness uses Supabase Auth and concurrent HTTP calls, creates isolated users and cleans up only their accounts. It refuses hosted URLs and requires explicit disposable acknowledgment.

DOM tests execute the real app source with jsdom and an injected simulated client. They do not implement browser layout or prove Auth/Realtime/database behavior. The Playwright harness additionally mocks Supabase HTTP and remains unexecuted because the browser could not start.

The targeted source secret check found no matching elevated key, private key or service-role JWT in the inspected source. It is deliberately narrower than a dedicated scanner; it excludes `node_modules`, `dist` and `.git`. The source ZIP contained no actual `.env` file or Git history. A full-history scanner and artifact review remain publication gates.

SQL validation here means applying migrations and executing authorization/upgrade assertions in PostgreSQL, not a hosted Supabase Advisor run, production catalog inspection or independent penetration test. See AUTHORIZATION_MATRIX.md and DEPLOYMENT_CHECKLIST.md for remaining work.

## Publication follow-up

The initial archive-only evidence limits above describe that review stage. Before publishing the corrected source, the public repository was cloned: its `main` head matched the ZIP's source commit. Gitleaks v8.30.1 scanned all nine available commits (~227.66 KB) and reported no leaks. An additional targeted scan inspected 34 historical blobs without finding elevated Supabase keys, service-role JWTs, private keys or PostgreSQL credentials. External Actions artifacts, issues, hidden refs and backups were not scanned. The correct project URL is `https://compa-unpatchabel.netlify.app`; it returned HTTP 401. No authenticated deployment or live database test was performed. See PUBLICATION.md for the publication-stage record.
