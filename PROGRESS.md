# InfyExchange Build Progress

## Status
- **Current Stage:** Stage 5 — Building Prompt 3 (Listings: create/edit, browse, detail, report, my listings).
- **Done:**
  - Stage 1: Read `.agents/rules/infyexchange.md`, `docs/LAUNCH_TONIGHT.md`, `docs/DESIGN.md`, `docs/SPEC.md`, `supabase/schema.sql`, and `supabase/launch_tonight.sql`.
  - Stage 2: Ensured `.agents/`, `docs/`, and `supabase/` are in the project root.
  - Stage 3: Scaffolded Next.js 16.4.3, installed dependencies, initialized `shadcn/ui` with defaults and added required components, committed `scaffold`.
  - Stage 4: Wrote `src/types/database.ts` by hand from `supabase/schema.sql` and created git-ignored `.env.local`, committed `setup`.
  - Stage 5 (Prompt 1): Built auth, `src/proxy.ts`, `/login`, `/auth/callback`, `/onboarding`, `/suspended`, placeholder routes, and `src/lib/config.ts`, committed `prompt 1`.
  - Stage 5 (Prompt 2): Built "Palace lights" design system (`Bricolage_Grotesque` + `Geist`, day/night color tokens in `src/app/globals.css`, `ThemeProvider`, animated `ThemeToggle`), App shell (`TopBar`, `BottomNav`, `AppShell`), shared components (`PriceTag`, `KindBadge`, `EmptyState`, `ComingSoon`, `ConfirmDialog`, `ShimmerSkeleton`), landing page `/` with `HangingTagsHero`, and restyled `/login`, `/onboarding`, `/suspended`.
- **Next:**
  - Stage 5 (Prompt 3): Build `/listings/new` and `/listings/[id]/edit` with shared `ListingForm`, browser image compression (`browser-image-compression`), `/browse` with kind tabs, category chips, search, pagination, and borderless `ListingTile`, `/listings/[id]` with `Gallery`, `ContactCard`, `ReportDialog`, and `/my` with "My listings" actions + "Upcoming" `ComingSoon` cards. Run `npx tsc --noEmit` & `npm run lint`, update `PROGRESS.md`, and git commit.
  - Stage 5 (Prompt 4): Polish, motion, responsive audit, `/rules`, `/privacy`, metadata.
  - Stage 7: Run `npm run build` and output the final checklist.

## Reasonable Choices Made
- Used `useSyncExternalStore` in `ThemeToggle.tsx` to avoid React 19 `set-state-in-effect` lint warnings while keeping SSR hydration clean.
- Implemented notched tag shape via `clip-path` and punched hole in `PriceTag.tsx` with tabular numerals and `en-IN` INR currency formatting.
