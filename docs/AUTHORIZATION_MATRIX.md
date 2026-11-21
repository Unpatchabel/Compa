# Authorization test matrix

**Executed SQL** means real PostgreSQL SQL/RLS/RPC behavior in PGlite using synthetic `auth.users`, roles and JWT-subject setting. This is more than a JavaScript permission simulation, but it is not hosted Supabase/PostgREST/Auth. **Simulated UI** uses jsdom and a fake Supabase client. **Pending local HTTP** is authored in `tests/supabase-local.mjs`; it was not executed. No real personal information is used.

| Scenario | Expected result | Executed evidence / limitation |
| --- | --- | --- |
| Fresh initialization | All four migrations apply in order | Executed SQL |
| Upgrade with malformed existing answers | Row survives, invalid updates fail, explicit repair permits validation | Executed upgrade SQL |
| RLS enabled on all app tables | Nine tables protected | Executed catalog check |
| Definer search path | Every app definer pins empty search path | Executed catalog check |
| Anonymous table access | All app table reads denied | Executed SQL for all nine tables |
| Anonymous privileged RPCs | Hello/report/deletion/block helper denied | Executed SQL for representative RPCs; all grants inspected |
| Raw Auth user records | Client SELECT denied | Executed SQL on synthetic Auth schema |
| Authenticated profile discovery | Nonblocked public fields visible | Executed matching/profile queries; email remains in Auth schema |
| A updates B / inserts B profile | Zero updated rows / insert rejected | Executed SQL |
| A changes own ID/timestamp | Permission denied | Executed SQL |
| Invalid profile answers | Number/object/empty/wrong size/oversized answer rejected | Executed SQL; Unicode string accepted |
| Direct private writes | Arbitrary message insert rejected, direct DELETE on eight protected tables denied | Executed SQL; other write grants inspected |
| Unrelated conversation | No messages/matches; send/end RPC denied | Executed SQL; pending local HTTP |
| Unrelated likes / blocks / reports | Rows hidden | Executed SQL |
| Message without match | RPC requires active membership | Unrelated and ended matches tested; arbitrary UUID branch inspected |
| Mutual personal hellos | One active match with two members | Executed SQL; pending concurrent local HTTP |
| Second mutual pair in occupied category | Pending until original ends | Executed SQL |
| Queued acceptance | New connection after old one ends | Executed SQL |
| One active slot | Count remains one per user/category | Executed SQL behavioral assertion; unique index inspected |
| Academic match | Same programme/year allowed | Executed SQL |
| Wrong/stale academic sender or counterpart | Denied, including stale reciprocal likes | Executed SQL |
| Expired hello | Cannot be accepted | Executed SQL for expired own and reciprocal hellos |
| Self/null/invalid/oversized hello | Denied | Executed SQL |
| Duplicate sequential hello | Existing check prevents another pending hello | Sequential rejection executed SQL; pending concurrent local HTTP |
| Concurrent reciprocal/duplicate hellos | Exactly one active connection; duplicate rejected | Pending local HTTP; not proven by embedded tests |
| Invalid/oversized message | Denied | Executed SQL |
| Message quota | Rapid messages throttled | Executed SQL sequential requests |
| Hello quota after withdrawals | Still throttled | Executed SQL |
| Reports: reason and daily cap | Short reason denied; sixth report denied | Executed SQL |
| Concurrent report quota | Only five of eight succeed | Pending local HTTP |
| Blocked profile visibility | Hidden | Executed SQL |
| Blocked hello and message sends | Denied | Executed SQL; pending local HTTP |
| Blocked history | Hidden for both participants | Executed SQL |
| Simultaneous block/send/end | Ordering respects locks | Code inspected; multi-session test pending |
| Ended connection | No new messages; unblocked history retained | Send denial executed; history retention from policy inspection |
| Account deletion | Deletes self, cascades matches, preserves other accounts | Executed synthetic Auth SQL; pending local Auth HTTP |
| Auth sign-in/discovery/profile edit/sign-out | Expected UI and data clearing | Executed simulated DOM |
| User HTML in profile | Rendered as literal text, no HTML node | Executed simulated DOM |
| Pre-match safety | Block/report offered; no end-match action | Executed simulated DOM |
| OAuth/recovery/session persistence | Correct redirects, refresh and session behavior | Not executed with real Auth; staging required |
| Realtime | Only authorized deliveries; close unsubscribes | Not executed with Supabase Realtime |
| Mobile/browser accessibility | No overflow; keyboard/modal behavior | Playwright test authored but environment blocked Chromium startup; manual review pending |

No full production adversarial test or penetration-test claim follows from these results.
