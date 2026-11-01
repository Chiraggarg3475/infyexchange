# InfyExchange – Product Spec (v1)

Source of truth for the coding agent. Pair with `supabase/schema.sql` (database + security).
InfyExchange is an **unofficial community platform** for Infosys Mysore trainees. Do not use Infosys logos or branding.

## 1. Product summary
A private, campus-only marketplace where trainees buy, sell, rent, lend, give away and request items.
Free to use. No payments inside the app (people settle in person). Mobile-first (most users are on phones).

## 2. Roles & account states
| State (profiles.status) | Meaning | Can do |
|---|---|---|
| `pending` | Signed in with Google but has not entered a campus access code | Only `/onboarding` |
| `active` | Verified campus member | Everything in this spec |
| `suspended` | Blocked by admin | Only `/suspended` (sees a message + sign out) |

Role (`profiles.role`): `user` or `admin`. Admins are set manually in SQL (see end of schema.sql).

## 3. Sign-in & campus verification (no company email)
1. "Continue with Google" (Supabase Auth, Google provider). Users use their personal Gmail.
2. First sign-in creates a profile with status `pending` (database trigger).
3. `/onboarding` form: full name (prefilled), batch (free text, e.g. "Nov 2026 – Wing A"), **WhatsApp number (required in UI, 10-digit Indian mobile starting 6-9)**, block/hostel (optional), **campus access code (required)**.
4. Submit calls `supabase.rpc('redeem_access_code', { p_code, p_full_name, p_batch, p_whatsapp, p_block })`.
5. On success the user becomes `active` and goes to `/browse`.
6. Admins create codes per batch/wing, with max uses and expiry, and can deactivate a leaked code (`/admin/codes`).
Codes must be long and random (e.g. `INFY-MYS-K7Q2X9PD`). Input is case-insensitive.

## 4. Listings
Four kinds (`listings.kind`). Field rules are enforced by a DB constraint; the form must match.

| Kind | UI label | Price field | Other fields |
|---|---|---|---|
| `sell` | For sale | Required, ₹ | condition |
| `rent` | Rent / Lend | Optional ₹ per `day`/`week`/`month` (empty or 0 = lend for free) | rent_period required, optional deposit ₹, condition |
| `giveaway` | Free | none | condition |
| `wanted` | Wanted | Optional max budget ₹ | description required; images optional (max 1) |

Common: title (3–80 chars), description (≤1000), category, pickup_area (≤60, e.g. "Block 5 food court" – never exact room numbers), up to 4 images.
Status: `active` → `reserved` (set automatically when an interest is accepted) → `closed` (done). Owner can reopen. Admin can set `removed`.
Expiry: 30 days by default (`expires_at`). Expired listings disappear from the feed; owner can "Renew 30 days".
Limit: 20 active/reserved listings per user (DB enforces; show the friendly error).
Categories come from the `categories` table (don't hardcode).
Search v1: `ilike '%q%'` on title only. Sort newest first. Page size 20 with "Load more".

## 5. Interest requests & contact privacy
> **Launch week note:** the request/accept flow below is NOT built yet (shown as "Coming soon"). Until it is, `supabase/launch_tonight.sql` lets signed-in campus members see the WhatsApp number and block of anyone who currently has a live listing. See `docs/LAUNCH_TONIGHT.md`.

- Any active member (not the owner) can send **one** request per `active` listing, with an optional message (≤300 chars).
- Button label by kind: sell → "I'm interested", rent → "Request to borrow", giveaway → "I'd like this", wanted → "I have this".
- States: `pending` → `accepted` | `rejected`; requester can `withdraw` (pending or accepted).
- Owner accepts/declines with `rpc('respond_to_interest', { p_interest_id, p_accept })`. Accepting reserves the listing.
- Requester withdraws with `rpc('withdraw_interest', { p_interest_id })`.
- **Contact privacy is enforced by the database.** WhatsApp number and block live in `profile_contacts` and are readable only by the owner themself or the other side of an ACCEPTED request. UI: after acceptance show "Chat on WhatsApp" (`https://wa.me/91<number>`) and the block, plus a safety note ("Meet in public campus areas"). Before acceptance, never show or fetch contact details.
- Owner can mark a reserved listing "Done" (closed) or "Reopen" (active).

## 6. Notifications
Created only by the database (triggers/RPCs): `interest_received`, `interest_accepted`, `interest_rejected`. Admin removals may add `listing_removed` later.
UI: bell with unread count in the top bar, `/notifications` list (newest first), tap = mark read + go to the listing (or `/my?tab=inbox`), "Mark all read". Update `read_at` only.
Live updates via Supabase Realtime on `notifications` filtered by `user_id` (no polling).

## 7. Profiles & settings
- `/u/[id]`: avatar, name, batch, "Member since", their active listings, "Report user" button. Never shows contact details.
- `/settings`: edit full name, batch, WhatsApp, block (updates `profiles` and `profile_contacts`; role/status are NOT editable).
- `/my` tabs: My listings, Inbox (requests received), Sent (requests I made).

## 8. Reports & admin
Report: from a listing page or profile, reason (`spam`, `prohibited_item`, `scam`, `harassment`, `other`) + optional details → insert into `reports`.
Admin area `/admin/*` (role `admin` only; also enforced by RLS):
- `/admin` overview: cards from `rpc('admin_stats')`.
- `/admin/users`: searchable list; suspend / reactivate via `rpc('admin_set_user_status')` (suspending removes their listings).
- `/admin/listings`: all listings, filter by status/kind; remove (`status='removed'`) or restore (`'active'`).
- `/admin/reports`: open queue; actions: dismiss, remove listing, suspend user; sets `status`, `handled_by`, `handled_at`.
- `/admin/codes`: list codes (used/max/expiry/active), create (with a random code generator), deactivate.

## 9. Images
- Compress in the browser BEFORE upload with `browser-image-compression`: main image max 1024px longest side, WebP, quality ~0.7 (target ≤150 KB); thumbnail 320px (~20 KB).
- Bucket `listing-images` (public, 500 KB cap, webp/jpeg/png). Path: `{user_id}/{listing_id}/{n}.webp` and `{n}_t.webp`. Store only the main paths in `image_paths`; derive the thumbnail path by naming convention.
- Feed cards use thumbnails; detail page uses main images. Use plain `<img loading="lazy">` (do not use Vercel image optimisation).
- Deleting a listing deletes its files via the Storage API.

## 10. Pages
`/` (landing / redirect), `/login`, `/auth/callback`, `/onboarding`, `/suspended`,
`/browse`, `/listings/new`, `/listings/[id]`, `/listings/[id]/edit`,
`/my`, `/notifications`, `/u/[id]`, `/settings`,
`/rules` (community rules, §12), `/privacy` (short plain-language notice),
`/admin`, `/admin/users`, `/admin/listings`, `/admin/reports`, `/admin/codes`.
Mobile nav: bottom tab bar → Browse, Post (+), My, Alerts, Profile.

## 11. UI principles
Clean, calm, trustworthy. Mobile-first at 360px. Large tap targets. Kind badges: Sell = blue, Rent/Lend = amber, Free = green, Wanted = violet. Show price prominently (₹, en-IN formatting). Every list has a skeleton loader and a friendly empty state with a call to action. Toasts for success/errors. Respect light/dark mode.

## 12. Community rules (show on `/rules` and when posting)
Not allowed: alcohol, tobacco/vapes, drugs, weapons, stolen goods, prescription medicines, adult content, live animals, anything banned by campus or company policy. No payments are processed here; meet in public campus areas; report suspicious behaviour.

## 13. Error messages (map RPC/DB errors to friendly text)
| Error text contains | Show |
|---|---|
| `invalid_code` | "That code isn't valid, has expired or is fully used. Ask your batch coordinator for a new one." |
| `already_active` | redirect to `/browse` |
| `suspended` | redirect to `/suspended` |
| `listing_limit_reached` | "You can have up to 20 active listings. Close one first." |
| `23505` / duplicate key on interests | "You've already sent a request for this item." |
| `listing_not_active` | "This item is no longer available." |
| `forbidden` / RLS violation | "You don't have permission to do that." |
| anything else | "Something went wrong. Please try again." |

## 14. Free-tier guardrails
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` only. The service-role key is never used in v1.
- Select only needed columns (no `select('*')` on feeds). Paginate. No polling.
- One Realtime channel per user (notifications only).
- Keep queries within RLS; no custom API routes except where a task explicitly asks.

## 15. Out of scope for v1 (do NOT build)
In-app chat, ratings/trust scores, lost & found, payments, recommendations, push notifications, email notifications, multi-campus support, transaction agreements/disputes, ML of any kind.
