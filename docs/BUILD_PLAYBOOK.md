# InfyExchange – Build Playbook (for Antigravity, free tier)

Work top to bottom. Each phase = **one new Antigravity chat** + one git commit. Do not skip the "Done when" checks.

---

## 0. Decisions already made (so you don't re-think them)

| Topic | Decision |
|---|---|
| Stack | Next.js + TypeScript + Tailwind + shadcn/ui, Supabase (Postgres + Auth + Storage + Realtime), Vercel. Your original stack is kept. |
| Sign-in | **Google sign-in with personal Gmail + a campus access code.** No Infosys email needed. |
| Contact privacy | WhatsApp number is stored privately. It is revealed only after the owner **accepts** a request (enforced by the database, not the UI). |
| Chat | Not in v1. The accept → WhatsApp reveal flow replaces it. In-app chat is a v1.1 add-on. |
| ShareNet repo | Reference for ideas only. It is React + Express + MongoDB + Socket.IO, a different stack. **Do not build on it and do not keep it open in Antigravity.** |

Take from ShareNet (as ideas): rent/sell/give modes, wanted board, request → accept flow, notifications.
Skip for now: ML recommendations, trust scores, lost & found, agreements/disputes, instant-claim queues.

---

## 1. Antigravity token rules (read once, follow always)

Free quota is a **weekly** cap that meters the work the agent does, not the number of prompts. Big, vague prompts burn it fastest.

1. **Open a fresh empty project folder** (not the ShareNet folder). Every file in the workspace is potential context.
2. **One slice per chat.** Start a new chat for every phase below. Long chats re-send history.
3. **Use the lightest model** in the dropdown for routine work (Flash / Low / Medium tiers). Switch to a stronger model only for a stubborn bug. Heavy "thinking" models drain quota quickly.
4. **Fast mode by default.** Use Planning mode only for the first prompt of a big phase (3, 5, 8).
5. **Never say "build the app".** Paste one phase prompt below. The spec and rules files already hold the context.
6. **Tell it not to browse/test.** The rules file already does. You test manually (the "Done when" lists).
7. **Small edits = no agent.** Use inline Tab completion / the inline command (Ctrl+I) for tweaks like copy, colours, spacing.
8. **Commit after every phase** (`git add -A && git commit -m "phase N"`). If the agent breaks something, `git restore .` is free.
9. **If the agent fails the same thing twice, stop.** Bring the error message and the one file to Claude (this chat). Fixing there costs zero Antigravity quota.
10. **Quota resets weekly.** If you hit the cap mid-phase, do manual steps (Supabase, deploy, content, testing) until it resets.

Bug-report template (paste into any chat):
```
Bug: <what you did> → <what happened> (expected: <x>)
Error: <exact error text, max 15 lines>
File: <path>
Fix only this. Do not touch other files.
```

---

## 2. One-time setup (no agent needed)

### 2.1 Tools
In Git Bash: `node -v` (need 20 or newer) and `git --version`.

### 2.2 Create the project (outside Downloads)
```bash
mkdir -p /c/dev && cd /c/dev
npx create-next-app@latest infyexchange --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd infyexchange
npm i @supabase/supabase-js @supabase/ssr browser-image-compression zod date-fns
npx shadcn@latest init
npx shadcn@latest add button input textarea label select badge card dialog tabs sheet dropdown-menu skeleton avatar table sonner
```
(Accept shadcn defaults. If a component name has changed, the CLI will tell you.)

Copy the three starter files into this folder, keeping these paths:
```
infyexchange/
  supabase/schema.sql
  docs/SPEC.md
  docs/BUILD_PLAYBOOK.md
  .agents/rules/infyexchange.md
```
In Antigravity: **File → Open Folder → C:\dev\infyexchange**. Close the ShareNet folder.
Check that the rules are active: Customizations → Rules. If the file isn't listed, click **+ Workspace**, set it to **Always On**, and paste the contents of `.agents/rules/infyexchange.md`.

### 2.3 Supabase (free)
1. supabase.com → sign up → **New project**. Name `infyexchange`, region **South Asia (Mumbai)**, save the database password.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**. It should say success.
3. Run the two "AFTER RUNNING" statements at the bottom of the file when you get to them (code now; admin after your first login).
4. **Project Settings → API**: copy the Project URL and the anon/publishable key into `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```
Never use the `service_role` key in this project.

### 2.4 Google sign-in
1. console.cloud.google.com → create project → **APIs & Services → OAuth consent screen** → External. Fill app name + support email.
2. **Publish the app** (set status to "In production"). Otherwise only manually-listed test users can sign in. Basic sign-in scopes don't need Google verification.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
   - Authorized redirect URI: `https://YOUR-REF.supabase.co/auth/v1/callback`
   - Authorized JavaScript origins: `http://localhost:3000` (add your Vercel URL later)
4. Copy the Client ID + Secret → Supabase **Authentication → Providers → Google → enable → paste → save**.
5. Supabase **Authentication → URL Configuration**: Site URL `http://localhost:3000`; Redirect URLs add `http://localhost:3000/**` (add `https://YOUR-APP.vercel.app/**` after deploy).

### 2.5 Generate database types (once, re-run after any schema change)
```bash
npx supabase login
mkdir -p src/types
npx supabase gen types typescript --project-id YOUR-REF --schema public > src/types/database.ts
```

### 2.6 First commit
```bash
git add -A && git commit -m "setup: next + supabase schema + spec"
```
Create a **private** GitHub repo and push (needed for Vercel later).

---

## 3. Build phases (paste prompts exactly)

### Phase 1 – Foundation  (Fast mode)
```
Read docs/SPEC.md §2, §3 and §10 only. Task: foundation, nothing else.
1. src/lib/supabase/client.ts and server.ts, plus the session-refresh request interceptor, exactly per the official @supabase/ssr + Next.js guide for the installed versions.
2. Route protection: logged-out → /login; status 'pending' → /onboarding; 'suspended' → /suspended; /admin/* requires role 'admin' (otherwise → /browse).
3. App shell: top bar (text logo "InfyExchange", bell placeholder), mobile bottom tab bar (Browse, Post, My, Alerts, Profile), responsive container.
4. Placeholder pages (heading only) for every route in SPEC §10.
5. /login with a "Continue with Google" button using supabase.auth.signInWithOAuth, and the /auth/callback route.
No real feature pages yet.
```
**Done when:** `npm run dev` → localhost:3000 → Google sign-in works → you land on `/onboarding`. In Supabase → Table Editor → `profiles` shows your row as `pending`.
Commit: `git add -A && git commit -m "phase 1 foundation"`

### Phase 2 – Onboarding with access code  (Fast)
First, in Supabase SQL Editor, create a code (copy the example from the bottom of schema.sql and change the code).
```
Read docs/SPEC.md §3 and §13. Build /onboarding and /suspended.
Onboarding form: full name (prefilled from the profile), batch, WhatsApp (required, 10 digits starting 6-9), block/hostel (optional), campus access code (required). zod validation. Submit via supabase.rpc('redeem_access_code', {...}). Map errors using SPEC §13. On success go to /browse.
/suspended: message + sign-out button. Add a sign-out option in the profile menu.
```
**Done when:** wrong code → friendly error; right code → `/browse`; `profiles.status = active` and a `profile_contacts` row exists.
Now make yourself admin (SQL at the bottom of schema.sql). Commit `phase 2`.

### Phase 3 – Create & view listings  (Planning mode, first prompt only)
```
Read docs/SPEC.md §4 and §9. Build /listings/new, /listings/[id]/edit (shared ListingForm component) and /listings/[id] (read-only view).
- Kind selector (4 cards: For sale, Rent/Lend, Free, Wanted); visible fields change per the SPEC §4 table.
- Image picker (max 4; wanted max 1): compress in the browser with browser-image-compression, upload main + thumbnail to bucket 'listing-images' under {user_id}/{listing_id}/ per SPEC §9. Generate the listing id with crypto.randomUUID() before upload. Store main paths in image_paths. Show upload progress.
- Categories loaded from the categories table.
- Detail page: image gallery, kind badge, ₹ price, description, condition, pickup area, owner card (name, batch, member since), expiry date.
- Show the community-rules reminder (SPEC §12) near the submit button.
No interest/request button yet.
```
**Done when:** you can post one of each kind with photos; photos land in Storage → `listing-images/<your-uid>/<listing-id>/`; each photo is under ~150 KB.
Commit `phase 3`.

### Phase 4 – Browse & manage listings  (Fast)
```
Read docs/SPEC.md §4 and §11. Build /browse: kind tabs (All, Buy, Rent, Free, Wanted), category chips, title search (ilike), 20 per page with "Load more", and a ListingCard (thumbnail, title, price, kind badge, pickup area, time ago, Reserved badge). Select only the columns the card needs.
Build /my with a "My listings" tab: owner's listings with status, and actions: mark Done (closed), Reopen, Renew 30 days, Edit, Delete (also delete its files in Storage).
Add skeleton loaders and empty states.
```
**Done when:** feed filters work; a second Google account (after redeeming a code) sees the first account's listings; closed listings disappear from that account's feed.
Commit `phase 4`.

### Phase 5 – Interest requests + contact reveal  (Planning mode, first prompt only)
```
Read docs/SPEC.md §5 and §13.
On /listings/[id]:
- Non-owner on an active listing: button labelled per kind opens a dialog (optional message ≤300) → insert into interests. If the viewer already has a request, show its status instead, with a Withdraw button (rpc withdraw_interest).
- If accepted: show the owner's WhatsApp ("Chat on WhatsApp" wa.me link) and block, read from profile_contacts (the database decides what is visible). Add the safety note. Never query contacts before acceptance.
- Owner: a Requests panel (requester name, batch, message, time) with Accept / Decline via rpc respond_to_interest. After accepting, show that requester's contact and a "Mark done" button.
In /my add tabs "Inbox" (requests received, grouped by listing) and "Sent" (requests I made, with status).
```
**Done when (use two accounts):** B requests → A sees it → A accepts → both see each other's WhatsApp; before accepting, B sees none; listing shows Reserved.
Commit `phase 5`.

### Phase 6 – Notifications  (Fast)
First run in Supabase SQL Editor: `alter publication supabase_realtime add table notifications;`
```
Read docs/SPEC.md §6. Add a bell in the top bar with unread count (fetch once on mount + subscribe to Supabase Realtime for INSERTs on notifications where user_id = me; no polling). Build /notifications (newest first; tap = set read_at, then go to the listing or /my?tab=inbox; "Mark all read"). Empty state.
```
**Done when:** with two browsers, A's bell increments live when B sends a request; B's bell increments when A accepts.
Commit `phase 6`.

### Phase 7 – Profiles & settings  (Fast)
```
Read docs/SPEC.md §7. Build /u/[id] (avatar, name, batch, member since, their active listings; no contact details) and /settings (edit full name, batch, WhatsApp, block; role/status are not editable). Link owner names on listing pages and cards to /u/[id].
```
Commit `phase 7`.

### Phase 8 – Reports & admin  (do as three separate chats)
**8a – Reporting + admin overview/users** (Fast)
```
Read docs/SPEC.md §8. (1) Report dialog (reason + details) on listing pages and profiles → insert into reports. (2) /admin overview with cards from rpc('admin_stats'). (3) /admin/users: searchable table with Suspend / Reactivate via rpc('admin_set_user_status'). Guard /admin/* by role.
```
**8b – Listings + reports queues** (Fast)
```
Read docs/SPEC.md §8. Build /admin/listings (filter by status/kind; Remove → status 'removed', Restore → 'active') and /admin/reports (open queue; show reported listing/user; actions: Dismiss, Remove listing, Suspend user; set status, handled_by, handled_at).
```
**8c – Access codes** (Fast)
```
Read docs/SPEC.md §3 and §8. Build /admin/codes: table of access_codes (code, label, used/max, expires, active) with a Create dialog (label, max uses, expiry date, "Generate random code" button producing INFY-MYS-XXXXXXXX with 8 random A-Z0-9 characters) and a Deactivate toggle.
```
**Done when:** a non-admin visiting `/admin` is redirected; reports you create appear in the queue; suspending a test user hides their listings and sends them to `/suspended`.
Commit `phase 8`.

### Phase 9 – Polish, rules pages, deploy  (Fast)
```
Read docs/SPEC.md §11, §12 and §14. (1) Build /rules and /privacy as short plain-language pages (privacy: what we store: name, batch, WhatsApp, block, listings; who can see it; how to delete the account by contacting an admin). (2) Audit all pages at 360px width and fix layout issues only. (3) Make sure every list has a skeleton and empty state. (4) Add a footer link to /rules and /privacy. Don't change functionality.
```
Deploy (manual, ~15 min):
1. vercel.com → sign in with GitHub → **Add New Project** → import the repo.
2. Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) → Deploy.
3. Add `https://YOUR-APP.vercel.app/**` to Supabase **Redirect URLs** and the URL to Site URL; add the origin to the Google OAuth client's JavaScript origins.
4. Test sign-in on a real phone.
Commit `phase 9`.

---

## 4. Pilot launch checklist

- [ ] Create a code for ONE wing/batch with max uses ~100–150 and a 2–4 week expiry.
- [ ] **Seed the feed**: ask 10 friends to post 3 real items each before you announce. An empty marketplace dies on day one.
- [ ] Announce in that batch's WhatsApp group with the link + code (and a short "how it works" screenshot).
- [ ] Tell users: unofficial community app, no payments inside, meet in public campus areas.
- [ ] Check with your campus/programme admin that a trainee-run exchange is acceptable, and what items are off-limits.
- [ ] Watch **Supabase → Usage** weekly (database size, storage, egress) and Vercel usage.
- [ ] Have a ban process: report → admin reviews within 24h → suspend.
- [ ] After 2 weeks: collect feedback (Google Form), then decide v1.1.

## 5. Free-tier watchlist (confirm current numbers on each dashboard)

| Service | Watch for | Action |
|---|---|---|
| Supabase Free | Project pauses after ~1 week with no activity; ~500 MB database; ~1 GB file storage; limited monthly egress | Real usage keeps it awake. Photos are the first thing to run out, so keep compression on. |
| Vercel Hobby | Meant for personal, **non-commercial** use | A free, no-fee pilot is a reasonable fit. If you add fees/ads or the campus officially adopts it, move to a paid plan or another host. |
| Google OAuth | App must be in "In production" | Otherwise sign-ins fail for non-test users. |

When storage/egress nears the cap: upgrade Supabase (Pro) or move images to a zero-egress object store. Ask Claude for a migration plan then.

## 6. After v1 (in this order)
1. In-app chat per listing+requester (new `messages` table + Realtime). Ask Claude for the SQL.
2. Cron cleanup of expired listings' photos.
3. Giveaway claim queue (first-come list), ratings, PWA install, WhatsApp share button.
