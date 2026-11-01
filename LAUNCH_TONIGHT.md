# Launch tonight – click-by-click

Ignore `BUILD_PLAYBOOK.md` tonight. It is the longer roadmap for later. This file is everything you need to go live.

## Scope

**Built tonight**
- Google sign-in, then a campus access code (no company email)
- Post a listing: For sale, Rent or lend, Free, Wanted (with up to 4 photos)
- Browse with filters and search; listing detail page
- Owner's WhatsApp number and block shown to signed-in campus members (so people can contact offline)
- My listings: edit, mark as done, reopen, renew, delete
- Report a listing
- Day and night mode; phone, tablet and laptop layouts

**Shown as "Coming soon" placeholders** (no backend): Send a request (accept/decline), Notifications, Chat, Save for later, Ratings, Admin dashboard.

**Admin tonight:** you use the Supabase dashboard (Table Editor) to delete listings, read reports and suspend users. See section 8.

---

## 1. Create the project (about 10 minutes)
1. In Antigravity: **File → Close Folder**. Then **Terminal → New Terminal**.
2. Paste these lines one block at a time (press Enter; if a question appears, press Enter for the default):
```bash
mkdir -p /c/dev
cd /c/dev
npx create-next-app@latest infyexchange --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd infyexchange
npm i @supabase/supabase-js @supabase/ssr browser-image-compression zod date-fns motion next-themes
npx shadcn@latest init
npx shadcn@latest add button input textarea label select badge dialog tabs sheet dropdown-menu skeleton avatar sonner popover
```
This makes the folder `C:\dev\infyexchange`.

## 2. Put the starter files in (2 minutes)
1. Unzip `infyexchange-starter.zip` (right-click → Extract All).
2. Open the extracted folder until you can see three folders: `.agents`, `docs`, `supabase`.
3. Select those three folders and **drag them into `C:\dev\infyexchange`** (next to `package.json` and `src`). If Windows asks to merge or replace, say yes.
4. In Antigravity: **File → Open Folder → C:\dev\infyexchange**. The left panel should show `.agents`, `docs`, `src`, `supabase` and `package.json`.
5. Open **Customizations → Rules**. If `infyexchange` isn't listed, click **+ Workspace**, set **Always On**, and paste the contents of `.agents/rules/infyexchange.md`.

## 3. Supabase (15 minutes)
1. supabase.com → sign up → **New project**. Name `infyexchange`, region **South Asia (Mumbai)**. Save the database password.
2. **SQL Editor → New query**. Paste all of `supabase/schema.sql` → **Run**.
3. New query again. Paste all of `supabase/launch_tonight.sql` → **Run**.
4. New query again. Create your first access code. Change the code to your own long random text:
```sql
insert into access_codes (code, label, max_uses, expires_at)
values ('INFY-MYS-K7Q2X9PD', 'First 100 friends', 100, now() + interval '30 days');
```
5. **Project Settings → API**: copy the Project URL and the anon (publishable) key.
6. In Antigravity create a file called `.env.local` in the project root (same level as `package.json`):
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_KEY
```
Never use the `service_role` key.

## 4. Google sign-in (10 minutes)
1. console.cloud.google.com → create a project → **APIs & Services → OAuth consent screen** → External → add app name and your email.
2. Click **Publish app** (status "In production"). Otherwise only test users can sign in.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
   - Authorized redirect URI: `https://YOUR-REF.supabase.co/auth/v1/callback`
   - Authorized JavaScript origins: `http://localhost:3000`
4. Copy the Client ID and Secret. In Supabase: **Authentication → Providers → Google → enable → paste → Save**.
5. Supabase **Authentication → URL Configuration**: Site URL `http://localhost:3000`, and add Redirect URL `http://localhost:3000/**`.

## 5. Database types and first commit
```bash
npx supabase login
mkdir -p src/types
npx supabase gen types typescript --project-id YOUR-REF --schema public > src/types/database.ts
git add -A && git commit -m "setup"
```
(`YOUR-REF` is the part before `.supabase.co` in your Project URL.)

---

## 6. The four prompts
Open a **new chat for each prompt**. Use the lighter model. After each one, do its "Done when" test, then run `git add -A && git commit -m "prompt N"`.
If the agent gets stuck twice, stop and bring the error and file name to Claude.

### Prompt 1 – Sign-in and onboarding (Fast mode)
```
Read docs/SPEC.md §2, §3 and §13 only. Tonight's scope is in docs/LAUNCH_TONIGHT.md. Task: working sign-in and onboarding with tidy default shadcn UI (styling comes in prompt 2).
1. src/lib/supabase/client.ts, server.ts and the session-refresh request interceptor, exactly per the official @supabase/ssr + Next.js guide for the installed versions.
2. /login (Continue with Google via signInWithOAuth), /auth/callback, and a sign-out action.
3. Route guards: logged-out users go to /login (public routes: /, /login, /auth/callback, /rules, /privacy); status 'pending' goes to /onboarding; 'suspended' goes to /suspended; active users who open /login or /onboarding go to /browse.
4. /onboarding (full name, batch, WhatsApp, block, access code; rpc redeem_access_code) and /suspended, per SPEC §3 and §13.
5. Placeholder pages (heading only) for /browse, /listings/new, /listings/[id], /listings/[id]/edit, /my, /rules, /privacy.
6. src/lib/config.ts exporting ADMIN_WHATSAPP = "" and FEEDBACK_URL = "" as constants.
```
**Done when:** run `npm run dev`, open localhost:3000, sign in with Google, you reach `/onboarding`; a wrong code shows a friendly error; the right code takes you to `/browse`.

### Prompt 2 – Design system, app shell, landing page (Fast mode; attach 2–3 screenshots of apps you like)
```
Read docs/DESIGN.md fully and follow it exactly. Do not change auth or data logic. Task: design system, app shell and landing page.
1. Fonts via next/font/google (Bricolage Grotesque for headings, Geist for body). Colour tokens for light and dark as in DESIGN.md, mapped to the shadcn CSS variables in globals.css. Dark mode with next-themes (default: system) and an animated ThemeToggle.
2. App shell for signed-in pages: TopBar (mobile and desktop variants, avatar menu with Sign out), BottomNav with sliding active pill and a raised gold Post button (mobile), centred max-width container. Add the ComingSoon placeholder for Alerts/Notifications in the nav.
3. Shared components: PriceTag, KindBadge, EmptyState, ComingSoon, ConfirmDialog, skeleton with shimmer.
4. The landing page at "/" with the hanging price-tag hero and the copy from DESIGN.md. Signed-in visitors already redirect to /browse.
5. Restyle /login, /onboarding and /suspended to match.
Use the `motion` package. Respect prefers-reduced-motion. Check light and dark.
```
**Done when:** `/` looks like a designed page in both light and dark; the tags drop in and sway; the theme toggle animates; the logged-in shell shows a top bar on laptop width and a bottom nav on phone width.
(Open DevTools with F12 and click the phone icon to preview the phone layout.)

### Prompt 3 – Listings (Planning mode for this one)
```
Read docs/SPEC.md §4, §9 and §12, and docs/DESIGN.md. Tonight's scope is in docs/LAUNCH_TONIGHT.md: ignore requests, notifications, chat and admin pages. Build:
1. /listings/new and /listings/[id]/edit using one shared ListingForm. Kind selector (For sale, Rent or lend, Free, Wanted) changes the visible fields per the SPEC §4 table. Categories come from the categories table. Photos: up to 4 (wanted: 1), compress in the browser and upload main + thumbnail to bucket 'listing-images' under {user_id}/{listing_id}/ per SPEC §9; generate the listing id with crypto.randomUUID() first; store main paths in image_paths; show progress. Show the community-rules reminder (SPEC §12) near the Post button. On success show the "Posted" stamp, then go to the listing.
2. /browse: kind tabs (All, For sale, Rent or lend, Free, Wanted), category chips, title search (ilike), 20 per page with "Load more", ListingTile for each result using thumbnails and PriceTag. Select only the columns the tile needs.
3. /listings/[id]: Gallery, KindBadge, PriceTag, description, condition, pickup area, expiry date, owner info (name, batch, member since). ContactCard: "Contact owner" button that reveals "Chat on WhatsApp" (https://wa.me/91<number>) and the block, read from profile_contacts (the database decides visibility; if no row is returned show "The owner hasn't shared a number"). Add the safety note "Meet in public campus areas. No payments happen in this app." Add a ComingSoon "Send a request" button next to it, and a ComingSoon "Save for later".
4. A Report dialog on /listings/[id] (reason + optional details; insert into reports). After sending, show "Thanks, we'll review it".
5. /my: tabs "My listings" (real) and "Upcoming" (ComingSoon cards for Requests, Chat, Ratings). My listings shows status and actions: Mark as done (closed), Reopen, Renew 30 days, Edit, Delete (with ConfirmDialog; also delete the files from Storage).
Map errors per SPEC §13. Skeletons and empty states everywhere.
```
**Done when (use two Google accounts, the second one after redeeming a code):**
account 1 posts one of each kind with photos; account 2 sees them on `/browse`, opens one and can tap through to WhatsApp; account 1 deletes a listing and it disappears for account 2.

### Prompt 4 – Polish (Fast mode)
```
Read docs/DESIGN.md sections "Motion", "Quality floor" and "Copy rules". Polish only, no new features.
1. Apply the motion spec: feed first-load stagger (once), press and hover feedback, kind-selector transitions, gallery swipe, contact card reveal, delete collapse, post-success stamp.
2. Responsive audit at 360, 768, 1280 and 1536px widths: fix overflow, spacing and tap targets (at least 44px).
3. Make every loading, empty and error state use the skeleton / EmptyState components and the copy rules.
4. Write /rules and /privacy as short plain-language pages. Rules: SPEC §12. Privacy: we store name, batch, WhatsApp, block, listings and photos; signed-in campus members can see the WhatsApp number and block of people who have a live listing; to delete your data, message the admin on ADMIN_WHATSAPP.
5. Metadata: title, description, tag-icon favicon on gold, theme-color for both themes.
```
**Done when:** it feels smooth on your phone and your laptop, in both themes.

---

## 7. Deploy (about 15 minutes)
1. Create a **private** GitHub repo and push: `git remote add origin <your repo url>` then `git push -u origin main` (GitHub shows the exact commands after you create the repo).
2. vercel.com → sign in with GitHub → **Add New → Project** → import the repo → add the two env vars from `.env.local` → **Deploy**.
3. Copy your live URL (for example `https://infyexchange.vercel.app`). Then:
   - Supabase → **Authentication → URL Configuration**: set Site URL to the live URL and add `https://YOUR-URL/**` to Redirect URLs.
   - Google Cloud → your OAuth client → add the live URL to **Authorized JavaScript origins**.
4. Open the live URL on your phone, sign in, post an item.
5. Fill in `ADMIN_WHATSAPP` and `FEEDBACK_URL` in `src/lib/config.ts` (a Google Form link for "what should we build next?"), commit, push. Vercel redeploys by itself.

## 8. Running the site tonight (no admin pages yet)
Make yourself admin (after your first login) and handle problems from **Supabase → SQL Editor**:
```sql
-- make yourself admin
update profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_GMAIL@gmail.com');

-- remove a bad listing (use the id from Table Editor → listings)
update listings set status = 'removed' where id = 'LISTING-ID';

-- suspend a user and remove all their listings
update profiles set status = 'suspended' where id = 'USER-ID';
update listings set status = 'removed' where owner_id = 'USER-ID';

-- new code for the next batch
insert into access_codes (code, label, max_uses, expires_at)
values ('INFY-MYS-NEWRANDOM1', 'Batch 2', 150, now() + interval '30 days');

-- switch off a leaked code
update access_codes set is_active = false where code = 'INFY-MYS-K7Q2X9PD';
```
Reports arrive in **Table Editor → reports**. Check it a couple of times a day.

## 9. Before you share the link
- [ ] You can sign in, post, view and delete on your phone, on the live URL.
- [ ] 10 friends have signed up with your code and posted 2–3 real items each (an empty marketplace dies on day one).
- [ ] The access code has a use limit and an expiry date.
- [ ] Your message says: unofficial community app, no payments in the app, meet in public campus areas.
- [ ] Ask your campus/programme admin whether a trainee-run exchange is fine, and which items are off-limits.

## 10. Tomorrow and beyond
Use the **Feedback** form responses to decide. The usual next order: Send a request (accept/decline, replace the contact rule with the commented block at the bottom of `launch_tonight.sql`), Notifications, an admin dashboard, Chat.
