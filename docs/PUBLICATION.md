# Publication verification

Date: 21 November 2026.

- Repository: https://github.com/Unpatchabel/Compa. It was already public when publication was requested.
- Default branch: `main`; original head: `0b77afb51686deeb939af3cb12d9b7f405b88a39`, matching the supplied archive. No intervening source changes needed reconciliation.
- Available history: nine commits; fetched branch: `main`. Local clone contains no tags.
- Official Gitleaks v8.30.1 binary downloaded and verified against its published SHA-256 checksum. `gitleaks git publish/Compa --redact` completed with exit 0: nine commits, ~227,660 bytes scanned, no leaks found.
- Additional targeted full-history blob check: 34 blobs; no matching elevated Supabase key, service-role JWT, private key or PostgreSQL connection password.
- Existing source files are retained; the corrected implementation adds the fourth migration, tests, CI, Netlify configuration and documentation. Earlier migrations are unchanged.
- Correct project hostname: `compa-unpatchabel.netlify.app`; read-only HTTPS probe returned HTTP 401. No authentication was attempted. The earlier `compa.netlify.app` probe concerned a different site.
- No live database mutation, explicit hosting deployment or Git history rewrite is part of publication. A connected host may automatically rebuild after the source update. Source publication does not apply Supabase SQL migrations.
- Historical author metadata and old prototype content remain in the existing Git history. A secret scan does not establish ownership of assets or absence of all personal information. Actions artifacts, logs, issues, private configuration and hidden refs remain outside this scan.
- No license was imposed. GitHub visibility does not itself grant an open-source license.

Local release evidence before publication: 77 SQL authorization assertions, upgrade/configuration and simulated DOM tests passed; build and release checks passed; dependency audit reported zero vulnerabilities. Real Auth/REST/Realtime, independent-session database concurrency and browser accessibility remain unverified in this environment.
