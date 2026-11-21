# Public release verdict

**Verdict: publish the corrected source as a public portfolio project. Git history was scanned before publication; authenticated hosted behavior remains unverified. It is not cleared for an unrestricted real-user launch.** A portfolio release can honestly show backend engineering and known limitations; it does not require pretending the deployment has been penetration-tested.

The archive contains a real full-stack implementation: static browser UI plus PostgreSQL authorization and transaction logic. The substantive evidence is executable SQL tests, explicit grants/RLS, matching invariants and scoped RPCs. Describe it as a portfolio project with tested local authorization, not production-grade social safety or privacy compliance.

Remaining publication gates:

1. The nine available Git commits passed a Gitleaks history scan before publication. Separately inspect GitHub artifacts, logs, issues and asset provenance, which the scan does not cover.
2. Rotate any elevated credentials previously committed, even if removed from the current tree.
3. Verify ownership of copied code/art; choose and add a license if granting reuse rights. No license was selected on your behalf.
4. Configure private security reporting, choose accurate links and add clearly synthetic screenshots.
5. Run release validation from a clean checkout. Keep hosted verification limitations prominent.

## GitHub metadata

Description: **Interest-based friendship discovery with Supabase Auth, PostgreSQL RLS, transactional matching and adversarial authorization tests.**

Topics: `javascript`, `vite`, `supabase`, `postgresql`, `row-level-security`, `authentication`, `authorization`, `appsec`, `social-discovery`, `security-testing`, `portfolio-project`.

Suggested first release: `v0.2.0-portfolio-preview` after owner review. The package version remains unchanged because no release was published.

## Existing Git history checklist

The available nine-commit history was scanned before publication (see PUBLICATION.md). Use this checklist for future changes and surfaces outside Git history. Do not paste secrets into issues or chat.

```sh
git fetch --all --tags
git log --all --oneline
git ls-files
git log --all --name-only --pretty=format:
git log --all -G 'sb_secret_|service_role|BEGIN .*PRIVATE KEY|SUPABASE.*SECRET|DATABASE_URL' --oneline
# Install a current official Gitleaks release, then use its documented full-history scan:
gitleaks git . --redact
```

- [ ] Inspect all branches/tags and renamed/deleted `.env` files, database dumps, uploads, logs, screenshots, backups and generated bundles. A keyword search alone is not a complete secret scan.
- [ ] Check commit metadata for unintended personal information and credentials embedded in remotes/scripts.
- [ ] Scan Git LFS, release ZIPs, Actions logs/artifacts, issues and pull-request diffs separately; they may outlive source cleanup.
- [ ] Look for real emails, phone numbers, precise locations, report text, chat messages, private student data and elevated keys.
- [ ] Treat publishable keys as public identifiers, but inspect the project RLS behind them. Treat secret/service-role keys, DB passwords, OAuth client secrets and refresh tokens as secrets.
- [ ] Revoke/rotate leaks first. History rewriting alone does not invalidate a credential or remove forks/caches.
- [ ] If rewriting is needed, back up safely, coordinate collaborators and follow the hosting provider's sensitive-data removal procedure. Do not force-push casually.
- [ ] Enable GitHub secret scanning/push protection where available, Dependabot and private vulnerability reporting.
- [ ] Inspect the final staged diff and clean checkout; exclude `.env.local`, `node_modules`, `dist` and test credentials.
- [ ] Select repository visibility manually only after review. No visibility change was performed here.

## Host evidence

The existing project URL is `https://compa-unpatchabel.netlify.app`, identified in project history. A read-only check returned HTTP 401; authenticated app and deployment configuration were not inspected. The earlier archive review checked the different hostname `compa.netlify.app`, which returned unrelated Spanish/Mobirise content. That earlier check does not identify or assess the actual COMPA deployment. Netlify is the identified host; Pages remains an alternative. No explicit deployment or production database migration is performed by source publication, although a connected host may automatically rebuild when its tracked branch changes.
