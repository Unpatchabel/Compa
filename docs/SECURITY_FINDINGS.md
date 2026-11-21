# Security findings

Scope: every source file in the supplied ZIP, all four migrations in the corrected tree, local dependency/build/SQL/DOM validation. The initial archive contained no `.git` history. Before publication, the connected public repository was cloned and its nine-commit history scanned (see PUBLICATION.md). Supabase credentials and dashboard access remain unavailable. Priorities below are engineering severity assessments, not externally assigned CVSS scores.

## Remediated and retained controls

| Finding | Priority | Evidence and resolution | Verification |
| --- | --- | --- | --- |
| Mutable profile timestamps and ownership columns | Medium | Original table-wide INSERT/UPDATE grants allowed owners to alter `created_at`, gaming newest-first discovery. Ownership RLS already protected other rows. Replaced with specific column grants; ID permitted only on insertion. | Embedded PostgreSQL rejects timestamp/ID updates and cross-owner mutations. |
| Malformed JSON answers | Medium | Original check allowed `[1,2,3]`, nested objects and blank strings. Added element-type and 1–80-character checks; raised total byte cap to accommodate Unicode. | Malformed/oversized shapes rejected; legacy upgrade/remediation tested. |
| Blocked chat history remained readable | Medium, policy tightening | Original RLS allowed participants to read all historical messages after block, despite blocking future contact. New policy hides history in both directions. This cannot retract copies already delivered. | Both users denied history reads in embedded SQL. |
| Concurrent reports could exceed quota | Medium | Original count/insert lacked serialization. Added reporter advisory lock and quota index. | Sequential five/day tested locally; simultaneous HTTP test authored, not executed. |
| Academic queued acceptance lacked current programme check | Medium | Original acceptance trusted earlier likes after profile changes. Both users must now still declare the category. This is self-declared, not identity verification. | Migration executed; valid academic and invalid sender scenarios tested. |
| Null/malformed RPC arguments | Low | Explicit category/target null checks added; database constraints remain final guards. | Invalid category, self-like, short report and oversized opener/message tests. |
| Missing account deletion path | Medium, privacy capability gap | Added self-only Auth deletion RPC and typed frontend confirmation. Existing FKs remove related app rows. Deleting shared matches also deletes shared messages. | Self-only signature and anonymous denial; deleted owner/remaining users/cascades tested in synthetic Auth schema. Hosted Auth/storage integration unverified. |
| Missing pre-match safety UI | Medium | Previously only a matched user could reach block/report controls. Added safety options on discovery cards. | Simulated DOM verifies safety UI without end-match action. |
| Residual sign-out UI and stale chat | Low | Clears hero/avatar/count/draft, resets onboarding sign-out control, closes subscriptions on dialog close and stale connection refresh. | Simulated DOM verifies sign-out clearing; real Realtime disconnection needs staging check. |
| Missing linked profile outside latest 500 | Low | Fetches profiles involved in matches/hellos separately, still through RLS. | Code inspection/build; large dataset staging test pending. |
| Elevated Vite key footgun | High if misconfigured, preventive | Runtime rejection alone would still bundle a leaked key. Added build-time rejection of secret/service-role credentials plus paired configuration validation. | Negative build tests recorded in VALIDATION.md. No elevated key was found in the input source. |
| Vulnerable locked dependencies | High, tooling scope | Initial audit flagged Vite and source-map-js. Updated lock to patched Vite 6.4.6 and source-map-js 1.2.4. | Final npm audit recorded separately; advisory lookup is point-in-time. |
| External font requests / incomplete release configuration | Low | Removed Google Fonts request; retained themes with system fonts. Added HSTS, Netlify build configuration, CI, documented Pages alternative. | Source/build header checks. CDN enforcement unverified. |
| Tests skipped final original migration | Medium, assurance gap | Existing suite applied only first two migrations. Tests now enumerate every migration and exercise an upgrade with legacy data. | Fresh schema plus upgrade tests pass in embedded PostgreSQL. |
| Documentation overstated signup and deployment | Medium, credibility | Email/password signup was absent; host references conflicted. README now describes actual Google signup, existing-account password login and uncertain live host. | Source review and read-only hostname inspection. |

## Existing backend protections retained

All nine application tables have RLS enabled. Clients have no direct writes to matching, messages or safety tables; profile ownership is checked on the server. Matching uses transaction locks and a unique active category index. RPCs use pinned search paths, explicit role grants and self/participant checks. No policies were removed to make tests pass. `hello_events` remains unreadable/unwritable to clients and withdrawing a like does not reset its quota.

Private data boundaries: Auth email/password data is not in profile discovery. Profiles are intentionally discoverable to signed-in, nonblocked users. Likes are visible only to their endpoints; matches to participants; reports to the reporter, not the subject; message history to unblocked participants. Public profile discovery is not a private directory.

## Residual risks and production gates

| Risk | Practical implication / required action |
| --- | --- |
| Hosted environment untested | Run disposable local HTTP tests and independent staging Auth/REST/Realtime tests. Inspect grants, function owners, publication and RLS in the actual project. |
| Concurrency only designed, not executed in multiple sessions here | PGlite serializes a single embedded connection; it cannot establish hosted race safety. Execute `test:integration` on disposable local Supabase, then load-test category lock contention and concurrent block/send/end. |
| Discovery scraping | Every authenticated nonblocked account may enumerate discoverable profiles. A 500-row UI cap is not a database anti-scraping boundary. Add controlled discovery RPCs, account controls and infrastructure limits if required. |
| No moderation operations | Reports are stored without a moderator dashboard, alerts, appeal workflow or response guarantee. Assign an operator and monitored channel before inviting users. |
| Account farming / anonymous Auth | Disable Supabase anonymous sign-ins, configure OAuth/email verification, rate limits and spending alerts. CAPTCHA is not integrated; enabling it without client token support can break auth. Per-account limits are not a bot/DDoS defense. |
| Retention and evidence | Expired likes are logically filtered, not globally purged. Hello-event cleanup runs for active senders only. Messages/reports persist until account deletion or operator action. Decide and implement scheduled retention before launch. Deletion erases associated reports and blocks, enabling re-registration abuse unless an appropriate policy is designed. |
| Deletion and token lifetime | Removing Auth user/app rows does not instantly invalidate issued JWTs. FK checks prevent recreating a profile for the deleted UUID. Verify provider sessions, backups and any future Storage objects; disclose actual retention. |
| Security headers | `_headers` is a proposed CDN policy, not a live header measurement of this release. Wildcard Supabase origins permit all projects; tighten to the actual project. Inline styles remain permitted for dynamic art/themes. |
| Browser session storage | Persisted sessions are accessible to code on the origin. Text rendering and CSP help; they do not make browser compromise harmless. Never use the app on an untrusted shared browser. |
| Accessibility and layout | Source contains responsive/reduced-motion/focus support and simulated UI passes. Screen reader, keyboard, contrast and real viewport reviews remain unverified. Browser harness could not launch in this environment. |
| Global category locks | Simple correctness model serializes all users in a category; may limit throughput. Unique hash collisions can add contention. No performance or availability claim is made. |
| Original monolithic frontend | Most flows remain in `app.js` to avoid an unnecessary rewrite. Modularization and wider UI regression coverage remain useful follow-up work. |
| Licensing/history | No license or third-party asset provenance was supplied. The available Git history passed Gitleaks before publication; this does not establish asset ownership or scan external artifacts. |

## Reference basis

The implementation follows the primary provider guidance on [Supabase function privileges and search paths](https://supabase.com/docs/guides/database/functions), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Netlify custom headers](https://docs.netlify.com/manage/routing/headers/) and [file build configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/). These references explain platform behavior; they do not certify this application.

## RPC inventory

All application `SECURITY DEFINER` RPCs use empty search paths, qualified table references and explicit authenticated-only execution. Function owner bypass of RLS is intentional, so each function's internal guard is the actual write authorization boundary.

| Function | Authorization / integrity boundary |
| --- | --- |
| `is_blocked` | Only returns block state for the signed-in viewer supplied as first argument; cannot query arbitrary other pairs |
| `send_hello` | Signed-in profile, non-self target, bounded/valid category/opener, eligible target or reciprocal, both current academic affiliations when applicable, no blocks, quota; serialized sender/category writes |
| `accept_mutual` | Two unexpired reciprocal likes, current academic eligibility when applicable, no blocks/occupied active slots; category lock |
| `withdraw_hello` | Deletes only caller's outgoing like; no rate-counter reset |
| `pass_profile` | Caller-owned non-self pass, valid FK target, bounded row count; caller lock |
| `end_match` | Caller must participate in active match; category lock, members deactivated |
| `send_message` | Valid bounded body, caller's active membership and non-ended match, no blocks, quota; sender/category locks |
| `block_user` | Signed-in, non-self valid target; fixed category lock order, deletes pair's likes and ends all pair's active matches |
| `report_user` | Signed-in non-self target, bounded reason, serialized caller/day quota; reports remain reporter-private |
| `delete_my_account` | No target parameter; deletes only `auth.uid()` account with category serialization and existing cascades |
| `valid_profile_answers` | Pure immutable invoker helper; no data access or elevated execution; authenticated execution for constraint evaluation |
