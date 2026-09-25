# Compa (working name) — interactive prototype

A browser-only concept for finding **platonic friends around shared interests**. Version 8 fixes dark-theme button text, simplifies the step labels, adds selectable pixel-art decorations, and removes the decorative glyph beside the dashboard heading.

**Name note:** Compa is a working label, not a cleared brand. An established compensation software company already uses the same name at compa.ai. Research brand and trademark availability before a public launch.

## Open it

Double-click `index.html` in a browser. No install or server is required. You can also run `python3 -m http.server 8000` in this folder and open `http://localhost:8000`. **The signup screen opens on every visit for prototype testing.** Complete it to start a clean demo, or choose **Continue previous demo** to preserve existing browser data.

## Explore the demo

- Onboarding hides the dashboard until all five steps are complete: a username, made-up demo password, general area, theme, and pixel-art preset; primary and secondary interests; three one-at-a-time personality questions with a custom-answer option.
- The four code-native pixel-art presets (talk bubbles, little universe, together, and mixtape) appear as decorations around the dashboard and sections. Change them later in profile settings. The artwork is drawn as inline SVG rectangles and carries no external image dependency.
- The profile uses your initial, with no required photo. There are eight color choices, including two neon and two black-based themes.
- The dashboard links your initial to interests and the names of matched friends. Click a name to go straight into its chat.
- Discover displays one person at a time whose **primary interest** is the selected category. Their secondary interest appears as a conversation cue. Like with an optional written opener, or pass. No photo or appearance-based matching.
- Likes stay pending for up to **24 hours**. Pending requests do not stop browsing. This demo uses fictional profiles: some already like you and match instantly; a few simulated people respond after 18 seconds; unanswered requests expire using the local device clock. The current browser is the only participant.
- Pending requests can remain after a match, but only one active chat is allowed per category. If another request gets a mutual yes, it waits as an offer until you keep your existing friend or end that connection and accept the new one.
- A short hopeful line appears when an unanswered request expires and changes on future openings. Another bank of 35 original short lines rotates in the dashboard. These are original product copy, not scraped quotes.
- Clicking a friend's **dashboard name** progresses Close friend at 3 visits, Favorite friend at 7, Best friend at 12 only if the demo friend's seeded count is comparably high. A real product needs server events from both accounts to calculate this honestly.
- Blocks hide a person from discovery in this browser. Section fades follow scroll in both directions and turn off when reduced motion is enabled.

All profile, chat, and request data is in browser `localStorage` under `compa-prototype-v4` to preserve previous prototype data. The demo password is discarded and is neither stored nor transmitted. This is **not a real login, live chat, real-time presence indicator, or live matchmaking service**. The optional opener appears as an outgoing first message after mutual acceptance. A real pre-match text exchange needs a server, recipient notifications, consent boundaries, and abuse controls.

## Before a university launch

Implement secure accounts and authentication, a server-side database, timestamps and scheduled request expiry, mutual likes and consent, private real-time messaging, reliable event delivery, abuse prevention, blocking and reporting across devices, moderation, rate limits, age rules, and general-location privacy. Make queued mutual matches a clear choice for both people. Browser time and simulated reciprocity are insufficient for a real launch. Do not deploy the static demo as a student matching service or collect real passwords through it.

The friendship titles reward opening a chat, which can be gamed and could encourage compulsive checking. Test whether meaningful **mutual conversation** is a better signal before retaining that mechanic.

## Private GitHub repository

Run in PowerShell from the `compa` folder:

```powershell
git init
git branch -M main
git add .
git commit -m "Build Compa friendship prototype"
```

Create an empty **private** repository on GitHub, then use the URL GitHub gives you:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

No API secrets are in this prototype. There is no software license in this repo; a code license does not reserve the underlying product idea.
