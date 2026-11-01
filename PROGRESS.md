# InfyExchange Build Progress

## Status
- **Current Stage:** Stage 5 — Building Prompt 2 (Design system, app shell, landing page).
- **Done:**
  - Stage 1: Read `.agents/rules/infyexchange.md`, `docs/LAUNCH_TONIGHT.md`, `docs/DESIGN.md`, `docs/SPEC.md`, `supabase/schema.sql`, and `supabase/launch_tonight.sql`.
  - Stage 2: Ensured `.agents/`, `docs/`, and `supabase/` are in the project root.
  - Stage 3: Scaffolded Next.js 16.4.3, installed dependencies, initialized `shadcn/ui` with defaults and added required components, committed `scaffold`.
  - Stage 4: Wrote `src/types/database.ts` by hand from `supabase/schema.sql` and created git-ignored `.env.local`, committed `setup`.
  - Stage 5 (Prompt 1): Built `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/proxy.ts` (session refresh + route guards), `/login`, `/auth/callback`, `signOutAction`, `/onboarding` (`redeem_access_code` RPC + zod validation), `/suspended`, placeholder pages (`/browse`, `/listings/new`, `/listings/[id]`, `/listings/[id]/edit`, `/my`, `/rules`, `/privacy`), `src/lib/config.ts`, and `src/lib/errors.ts` (SPEC §13). Passed `npx tsc --noEmit` and `npm run lint`.
- **Next:**
  - Stage 5 (Prompt 2): Design system (`Bricolage_Grotesque` + `Geist`, "Palace lights" color tokens in `globals.css`, `next-themes` provider + animated `ThemeToggle`), App shell (`TopBar`, `BottomNav`, signed-in layout), shared components (`PriceTag`, `KindBadge`, `EmptyState`, `ComingSoon`, `ConfirmDialog`, `ShimmerSkeleton`), landing page `/` with hanging price-tag hero, restyle `/login`, `/onboarding`, `/suspended`. Run `npx tsc --noEmit` & `npm run lint`, update `PROGRESS.md`, and git commit.
  - Stage 5 (Prompt 3): Listings (create/edit, browse, detail, report, my listings).
  - Stage 5 (Prompt 4): Polish, motion, responsive audit, `/rules`, `/privacy`, metadata.
  - Stage 7: Run `npm run build` and output the final checklist.

## Reasonable Choices Made
- Implemented Next.js 16's `src/proxy.ts` convention (`export async function proxy(request: NextRequest)`) per `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`, including safe fallback when `.env.local` still has `PASTE_HERE` so `npm run build` and static checks succeed before credentials are pasted.
- Added `ShareNet-Web-main` and `infyexchange-starter` to `tsconfig.json` `exclude` and `eslint.config.mjs` `globalIgnores` so pre-existing folders in the directory don't interfere with typechecking and linting.
