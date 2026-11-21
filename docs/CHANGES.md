# Changes from supplied archive

Review date: 21 November 2026. Input archive comment: `0b77afb51686deeb939af3cb12d9b7f405b88a39`; Git history was not supplied.

## Database

Added an ordered, transactional hardening migration; retained all historical security policies and matching architecture. New answer element/type/length checks reject numbers, nested objects and blank strings. Raised the old 360-byte JSON limit to 2,048 bytes for valid Unicode answers. Legacy malformed rows require explicit remediation and constraint validation. Narrow profile column grants prevent timestamp and ownership changes. Revoked schema creation from browser roles.

Blocked message history is filtered by RLS in both directions. Message sends also check blocks explicitly. Report quota check/insertion is serialized per reporter. Pass writes gain a bounded per-account cap. Category RPCs reject null categories explicitly; queued academic acceptance rechecks the both users' current programmes. Added indexes for message/report quotas and reverse block lookups. Added an authenticated self-only account deletion RPC using established category lock order and existing cascading foreign keys.

## Frontend

Preserved COMPA's categories, artwork, theme choices, onboarding and matching model. Added pre-match safety actions and account deletion with typed confirmation. Async action buttons prevent duplicate clicks, catch exceptions and restore availability. Named icon-close controls and dialogs; chat log semantics; noscript text. Sign-out clears residual hero/avatar/count and onboarding draft data and resets the onboarding sign-out control. Closed chat subscriptions when the dialog closes and when refreshed membership no longer includes the chat. Loaded linked profile cards outside the 500-profile discovery window. Client-side report/name/area validation added; user content remains text-rendered.

PKCE enabled for OAuth/recovery. Runtime and build-time guards reject elevated Supabase credentials. A partial or invalid configuration fails the build. The no-config setup screen remains supported. Removed third-party font requests; strengthened header defaults; added long-text wrapping and small-screen action wrapping.

## Engineering and release

Updated vulnerable locked Vite and source-map-js versions. Added Node engine declaration, explicit Netlify configuration, validation CI, full migration enumeration in tests, expanded SQL authorization tests, simulated frontend tests, optional Playwright and local-only Supabase HTTP/concurrency tests. Replaced stale README claims with implemented behavior and evidence boundaries. Added security, release, history, deployment and coverage documentation.

No deployment, remote database change, Git push, visibility change or license selection was performed.
