# Compa live web foundation

This working copy turns the v8 browser demo into a hosted, multiuser web application. **Do not publish a campus QR code yet.** Accounts and chat need a real Supabase project, a reviewed migration, and a two-account authorization test before even an invited pilot. The v8 demo is separate and can still be opened directly from `index.html`.

## What is implemented

- Email/password accounts with email confirmation and password recovery through Supabase Auth; browser sessions survive reopening the page.
- A one-time profile setup for each authenticated user. Email and password do not appear in the public profile table. No photos are required.
- Discovery by primary interest, incoming likes with optional opener, outgoing pending likes that expire after 24 hours, and a mutual like creating a match.
- PostgreSQL functions and a partial unique index enforce one active match **per user per category**, even when browser clients race. Unaccepted mutual likes remain pending until an active connection ends.
- Messages persist in PostgreSQL. Realtime subscriptions deliver new messages while a chat is open, with a polling fallback. Database RLS restricts message history to match participants, and the send function rejects messages after a match ends.
- Blocking prevents future discovery and contact; a report form writes to a private reports table. Auth has provider-level limits; app functions limit hellos (20/hour) and messages (20/minute). These are pilot defaults, not DDoS guarantees.
- The original theme, pixel-art presets, and layout continue to work. Some demo embellishments (friendship titles and fictional activity meters) are not carried forward yet because they require real user signals.

## Run locally after creating a Supabase project

Install Node.js 22 or newer. From this folder:

```powershell
npm ci
Copy-Item .env.example .env.local
```

Edit `.env.local` with the project's **public** URL and **publishable** key. Never put a secret key or service-role key in `VITE_` variables, this repository, or a browser bundle. In a **new, empty** Supabase project, run `supabase/migrations/20260925000000_initial.sql` in the SQL editor once. Enable email confirmation and set Auth URL Configuration: local `http://127.0.0.1:5173` for development, with the exact production Pages address added to the allowed redirect URLs later. Then run:

```powershell
npm run dev
```

Open the URL Vite prints. To check a release build locally, run `npm run build` and `npm run preview`. A successful build without environment variables produces a **setup screen**, because Vite embeds public configuration at build time.

Run `npm test` to execute the migration in embedded PostgreSQL and check mutual matching, the category uniqueness rule, message isolation, direct-write denial, ending a chat, and blocking. This test is valuable but does not replace testing Supabase's hosted Auth, Realtime, email, and configuration.

## Test with two accounts before deploying

1. Use separate browsers or private windows and distinct verified emails to create two profiles. Select the same primary interest for a simple first test.
2. Send a hello from A to B. B should see the optional opener. B likes A: both receive a match and can exchange messages.
3. Close both browsers and reopen them. Each should return to their existing account; both should see the same match and stored messages. Test signing out and signing back in.
4. End the match. Try sending from a stale open browser tab: the server must reject it. Block the other account and try to search for it or send another hello: both must fail.
5. Using A's session in a network/API client, attempt to select messages from an unrelated match, insert directly into `messages`, change B's profile, or create an arbitrary match. All must fail. Repeat with an anonymous session.
6. Create two mutual likes for one category and verify that concurrent attempts cannot create two active matches for either person. Check expired likes cannot create a match.

These checks require a real hosted Supabase project. A build passing does **not** prove database authorization or email delivery.

## Deploy later, after verification

Cloudflare Pages can connect to the existing GitHub repository: framework **Vite**, build command `npm ci && npm run build`, output directory `dist`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as Pages build environment variables and redeploy. `public/_headers` adds response headers and a restrictive Content Security Policy to the Pages output. Set the final HTTPS URL in Supabase Auth allowed redirects. The QR code should point to that final website URL; users do not install software. Do not publish the code before you have run the two-account tests.

Supabase's default email service is for limited testing; configure a production email provider, verify the sender domain, tune Auth rate limits, and set spending alerts before putting a QR code on a noticeboard. **CAPTCHA is not integrated yet**: add a CAPTCHA widget and pass its token in the auth request before enabling CAPTCHA in Supabase. Cloudflare's website protection does not automatically cover the Supabase API called directly from the browser.

## Remaining campus-pilot gates

- Test SQL and RLS on a real Supabase project. This working copy was built and syntax-checked, but there are no project credentials here, so end-to-end auth, mail delivery, and RLS behavior are **unverified**.
- Establish an owner who can read and act on reports, a clear conduct policy, an account/data deletion process, message retention and backup policy, and an incident response contact. Currently reports are stored but there is no moderator dashboard or notification.
- Review location granularity, privacy notice and consent, age eligibility, and university permission before collecting student data or placing a QR code.
- Add phone verification when needed for abuse deterrence; a verified number does not prove one person has only one account.
- Replace the first 500-profile discovery query with pagination as the community grows. Review database and message usage under load.

No service-role or database password is included in the source. The public `VITE_` key is not a secret: enforce data permissions through database grants, RLS, and narrowly scoped functions.
