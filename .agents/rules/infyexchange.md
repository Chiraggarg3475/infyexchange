# InfyExchange – agent rules (always on)

Stack: Next.js (App Router) + TypeScript (strict) + Tailwind + shadcn/ui + Supabase (Postgres, Auth, Storage, Realtime). Hosted on Vercel. No other backend.
Source of truth: `docs/SPEC.md` (product), `docs/DESIGN.md` (all UI), `supabase/schema.sql` (database + security), `docs/LAUNCH_TONIGHT.md` (current scope). Read only the sections named in my prompt. Do not re-derive requirements.

## Scope
1. Do only the task in the prompt. No extra features, no unrelated refactors, no new packages unless I name them or ask first.
2. Never edit `supabase/schema.sql`. If a schema change is needed, write `supabase/migrations/NNN_short_name.sql`, stop, and tell me to run it.
3. Security lives in Postgres RLS. Never use a service-role key. Never put secrets in `NEXT_PUBLIC_*` except the Supabase URL and anon key. `.env.local` stays git-ignored.
4. Features marked "Coming soon" in `docs/LAUNCH_TONIGHT.md` are placeholders only: use the `ComingSoon` component and build no backend for them.

## Code
5. Check installed versions in `package.json` and follow the official docs for those versions (Next.js, `@supabase/ssr`, shadcn, motion). Do not guess APIs from memory.
6. Read and write data with the Supabase client under RLS (Server Components or client components). No custom API routes unless the prompt says so.
7. Use generated types from `src/types/database.ts`. Validate forms with zod.
8. Files under ~250 lines. One component per file in `src/components/<area>/`. Reuse shadcn components.
9. Money is whole INR rupees shown as ₹ with `en-IN` formatting. Show friendly errors using the mapping in SPEC §13. Never swallow errors silently.

## Design
10. All UI follows `docs/DESIGN.md` (tokens, fonts, layout, motion, copy rules). Mobile first (360px), then laptop. Do not fall back to generic defaults: no purple gradients, no fade-up on every section, no lift-on-hover on every card, no all-caps eyebrows.
11. Honour `prefers-reduced-motion`. Animate only `transform` and `opacity`.

## Token budget (important)
12. Do NOT open the browser, take screenshots, run the dev server, or run tests unless I ask. I will test manually.
13. Do not re-read or print large files. Edit with small targeted changes. Do not rewrite a file just to change a few lines.
14. Finish with at most 8 lines: files changed + exactly how I can test it. No long summaries.
