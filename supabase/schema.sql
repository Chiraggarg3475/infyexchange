-- =====================================================================
-- InfyExchange v1 schema  (Supabase / PostgreSQL)
-- Run ONCE: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- Safe to read top-to-bottom. All security lives here (RLS), not in app code.
-- =====================================================================

-- ---------- ENUMS ----------------------------------------------------
create type user_role       as enum ('user', 'admin');
create type user_status     as enum ('pending', 'active', 'suspended');
create type listing_kind    as enum ('sell', 'rent', 'giveaway', 'wanted');
create type listing_status  as enum ('active', 'reserved', 'closed', 'removed');
create type item_condition  as enum ('new', 'like_new', 'good', 'fair');
create type rent_period     as enum ('day', 'week', 'month');
create type interest_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type report_target   as enum ('listing', 'user');
create type report_status   as enum ('open', 'dismissed', 'actioned');

-- ---------- TABLES ---------------------------------------------------
create table categories (
  id         smallint generated always as identity primary key,
  slug       text unique not null,
  name       text not null,
  sort_order smallint not null default 0
);

create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  avatar_url text,
  batch      text check (char_length(batch) <= 40),
  role       user_role   not null default 'user',
  status     user_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- Private contact details. Only the owner, or someone with an ACCEPTED
-- interest request involving this user, can read a row (see policies).
create table profile_contacts (
  user_id  uuid primary key references profiles(id) on delete cascade,
  whatsapp text check (whatsapp is null or whatsapp ~ '^[6-9][0-9]{9}$'),
  block    text check (char_length(block) <= 60)
);

-- Campus access codes (replaces company-email verification).
create table access_codes (
  code       text primary key check (code = upper(code) and char_length(code) between 6 and 40),
  label      text not null,                       -- e.g. 'Batch Nov-2026 / Wing A'
  max_uses   integer not null default 500 check (max_uses > 0),
  used_count integer not null default 0,
  expires_at timestamptz,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table listings (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references profiles(id) on delete cascade,
  kind         listing_kind not null,
  title        text not null check (char_length(title) between 3 and 80),
  description  text not null default '' check (char_length(description) <= 1000),
  category_id  smallint references categories(id),
  price        integer check (price is null or price >= 0),  -- INR. sell price / rent per period / wanted budget
  rent_period  rent_period,
  deposit      integer check (deposit is null or deposit >= 0),
  condition    item_condition,
  pickup_area  text check (char_length(pickup_area) <= 60),
  image_paths  text[] not null default '{}' check (cardinality(image_paths) <= 4),
  status       listing_status not null default 'active',
  expires_at   timestamptz not null default (now() + interval '30 days'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint listing_kind_fields check (
       (kind = 'sell'     and price is not null and rent_period is null)
    or (kind = 'rent'     and rent_period is not null)          -- price null/0 = free lend
    or (kind = 'giveaway' and price is null and rent_period is null)
    or (kind = 'wanted'   and rent_period is null)
  )
);
create index listings_feed_idx  on listings (status, kind, created_at desc);
create index listings_cat_idx   on listings (category_id);
create index listings_owner_idx on listings (owner_id);

create table interests (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references listings(id) on delete cascade,
  requester_id uuid not null references profiles(id) on delete cascade,
  message      text not null default '' check (char_length(message) <= 300),
  status       interest_status not null default 'pending',
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  unique (listing_id, requester_id)
);
create index interests_requester_idx on interests (requester_id);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       text not null,   -- interest_received | interest_accepted | interest_rejected | listing_removed
  title      text not null,
  body       text,
  listing_id uuid references listings(id) on delete cascade,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on notifications (user_id, created_at desc);

create table reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references profiles(id) on delete cascade,
  target           report_target not null,
  listing_id       uuid references listings(id) on delete cascade,
  reported_user_id uuid references profiles(id) on delete cascade,
  reason           text not null check (reason in ('spam','prohibited_item','scam','harassment','other')),
  details          text check (char_length(details) <= 500),
  status           report_status not null default 'open',
  handled_by       uuid references profiles(id),
  handled_at       timestamptz,
  created_at       timestamptz not null default now(),
  check (   (target = 'listing' and listing_id is not null)
         or (target = 'user'    and reported_user_id is not null))
);

-- ---------- SEED DATA ------------------------------------------------
insert into categories (slug, name, sort_order) values
  ('books-study',    'Books & Study',          1),
  ('electronics',    'Electronics & Gadgets',  2),
  ('room-furniture', 'Room & Furniture',       3),
  ('kitchen',        'Kitchen & Appliances',   4),
  ('clothing',       'Clothing & Footwear',    5),
  ('formals',        'Formals & Accessories',  6),
  ('cycles-travel',  'Cycles & Travel',        7),
  ('sports-hobby',   'Sports & Hobbies',       8),
  ('other',          'Other',                 99);

-- ---------- HELPER FUNCTIONS ----------------------------------------
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles
                 where id = auth.uid() and role = 'admin' and status = 'active');
$$;

create or replace function is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles
                 where id = auth.uid() and status = 'active');
$$;

-- True if caller may read p_user's private contact details:
-- themselves, or the other side of an ACCEPTED interest request.
create or replace function can_see_contact(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_member() and (
    auth.uid() = p_user
    or exists (
      select 1
      from interests i join listings l on l.id = i.listing_id
      where i.status = 'accepted'
        and (   (l.owner_id = auth.uid() and i.requester_id = p_user)
             or (i.requester_id = auth.uid() and l.owner_id = p_user))
    )
  );
$$;

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger listings_updated_at before update on listings
  for each row execute function set_updated_at();

-- ---------- TRIGGERS -------------------------------------------------
-- Auto-create a profile (status 'pending') when someone signs in the first time.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Cap active listings per user (protects the free-tier storage budget).
create or replace function enforce_listing_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from listings
      where owner_id = new.owner_id and status in ('active', 'reserved')) >= 20 then
    raise exception 'listing_limit_reached';
  end if;
  return new;
end $$;

create trigger listings_limit before insert on listings
  for each row execute function enforce_listing_limit();

-- Notify the owner when someone sends an interest request.
create or replace function notify_new_interest() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_title text; v_name text;
begin
  select owner_id, title into v_owner, v_title from listings where id = new.listing_id;
  select full_name into v_name from profiles where id = new.requester_id;
  insert into notifications (user_id, type, title, body, listing_id)
  values (v_owner, 'interest_received',
          'New interest in "' || v_title || '"',
          coalesce(nullif(v_name, ''), 'Someone') || ' is interested.',
          new.listing_id);
  return new;
end $$;

create trigger interests_notify after insert on interests
  for each row execute function notify_new_interest();

-- ---------- RPCs (called from the app with supabase.rpc) --------------
-- Onboarding: redeem a campus access code and activate the account.
create or replace function redeem_access_code(
  p_code text, p_full_name text, p_batch text,
  p_whatsapp text default null, p_block text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_status user_status;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select status into v_status from profiles where id = v_uid;
  if v_status is null        then raise exception 'profile_missing'; end if;
  if v_status = 'suspended'  then raise exception 'suspended'; end if;
  if v_status = 'active'     then raise exception 'already_active'; end if;
  if char_length(trim(coalesce(p_full_name, ''))) < 2 then raise exception 'name_required'; end if;

  update access_codes set used_count = used_count + 1
   where code = upper(trim(p_code))
     and is_active
     and used_count < max_uses
     and (expires_at is null or expires_at > now());
  if not found then raise exception 'invalid_code'; end if;

  update profiles
     set status = 'active', full_name = trim(p_full_name), batch = nullif(trim(p_batch), '')
   where id = v_uid;

  insert into profile_contacts (user_id, whatsapp, block)
  values (v_uid, nullif(trim(p_whatsapp), ''), nullif(trim(p_block), ''))
  on conflict (user_id) do update
    set whatsapp = excluded.whatsapp, block = excluded.block;
end $$;

-- Owner accepts / rejects an interest request. Accepting reserves the listing
-- and (via can_see_contact) unlocks WhatsApp/block for both people.
create or replace function respond_to_interest(p_interest_id uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = public as $$
declare v_int interests; v_listing listings;
begin
  if not is_member() then raise exception 'forbidden'; end if;
  select * into v_int from interests where id = p_interest_id for update;
  if not found then raise exception 'not_found'; end if;
  select * into v_listing from listings where id = v_int.listing_id;
  if v_listing.owner_id <> auth.uid() then raise exception 'forbidden'; end if;
  if v_int.status <> 'pending' then raise exception 'already_responded'; end if;
  if p_accept and v_listing.status <> 'active' then raise exception 'listing_not_active'; end if;

  update interests
     set status = (case when p_accept then 'accepted' else 'rejected' end)::interest_status,
         responded_at = now()
   where id = p_interest_id;

  if p_accept then
    update listings set status = 'reserved' where id = v_listing.id;
  end if;

  insert into notifications (user_id, type, title, body, listing_id)
  values (v_int.requester_id,
          case when p_accept then 'interest_accepted' else 'interest_rejected' end,
          case when p_accept then 'Request accepted: "' || v_listing.title || '"'
                              else 'Request declined: "' || v_listing.title || '"' end,
          case when p_accept then 'You can now see their contact details on the listing.' else null end,
          v_listing.id);
end $$;

create or replace function withdraw_interest(p_interest_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update interests set status = 'withdrawn', responded_at = now()
   where id = p_interest_id and requester_id = auth.uid()
     and status in ('pending', 'accepted');
  if not found then raise exception 'not_found'; end if;
end $$;

-- ---- Admin RPCs
create or replace function admin_set_user_status(p_user uuid, p_status user_status) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_user = auth.uid() then raise exception 'cannot_change_self'; end if;
  update profiles set status = p_status where id = p_user;
  if p_status = 'suspended' then
    update listings set status = 'removed'
     where owner_id = p_user and status in ('active', 'reserved');
  end if;
end $$;

create or replace function admin_stats() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  return json_build_object(
    'users_total',     (select count(*) from profiles where status = 'active'),
    'users_pending',   (select count(*) from profiles where status = 'pending'),
    'users_suspended', (select count(*) from profiles where status = 'suspended'),
    'users_last_7d',   (select count(*) from profiles where status = 'active' and created_at > now() - interval '7 days'),
    'listings_active', (select count(*) from listings where status = 'active'),
    'listings_by_kind',(select coalesce(json_object_agg(kind, c), '{}'::json)
                          from (select kind, count(*) c from listings
                                 where status in ('active','reserved') group by kind) k),
    'interests_pending', (select count(*) from interests where status = 'pending'),
    'interests_accepted',(select count(*) from interests where status = 'accepted'),
    'reports_open',    (select count(*) from reports where status = 'open')
  );
end $$;

-- Lock RPC execution to signed-in users only.
revoke execute on function redeem_access_code(text, text, text, text, text) from public, anon;
revoke execute on function respond_to_interest(uuid, boolean)               from public, anon;
revoke execute on function withdraw_interest(uuid)                          from public, anon;
revoke execute on function admin_set_user_status(uuid, user_status)         from public, anon;
revoke execute on function admin_stats()                                    from public, anon;
grant  execute on function redeem_access_code(text, text, text, text, text) to authenticated;
grant  execute on function respond_to_interest(uuid, boolean)               to authenticated;
grant  execute on function withdraw_interest(uuid)                          to authenticated;
grant  execute on function admin_set_user_status(uuid, user_status)         to authenticated;
grant  execute on function admin_stats()                                    to authenticated;

-- ---------- ROW LEVEL SECURITY --------------------------------------
alter table categories        enable row level security;
alter table profiles          enable row level security;
alter table profile_contacts  enable row level security;
alter table access_codes      enable row level security;
alter table listings          enable row level security;
alter table interests         enable row level security;
alter table notifications     enable row level security;
alter table reports           enable row level security;

-- categories: any signed-in user can read
create policy categories_read on categories for select to authenticated using (true);

-- profiles
create policy profiles_read on profiles for select to authenticated
  using (id = auth.uid() or (is_member() and status = 'active') or is_admin());
create policy profiles_update_own on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- profile_contacts (private)
create policy contacts_read on profile_contacts for select to authenticated
  using (can_see_contact(user_id));
create policy contacts_insert_own on profile_contacts for insert to authenticated
  with check (user_id = auth.uid() and is_member());
create policy contacts_update_own on profile_contacts for update to authenticated
  using (user_id = auth.uid() and is_member()) with check (user_id = auth.uid());

-- access_codes: admin only
create policy codes_admin_all on access_codes for all to authenticated
  using (is_admin()) with check (is_admin());

-- listings
create policy listings_read on listings for select to authenticated
  using (
    is_member() and (
      owner_id = auth.uid()
      or is_admin()
      or (status in ('active', 'reserved') and expires_at > now())
    )
  );
create policy listings_insert on listings for insert to authenticated
  with check (owner_id = auth.uid() and is_member());
create policy listings_update on listings for update to authenticated
  using ((owner_id = auth.uid() and is_member()) or is_admin())
  with check ((owner_id = auth.uid() and is_member()) or is_admin());
create policy listings_delete on listings for delete to authenticated
  using ((owner_id = auth.uid() and is_member()) or is_admin());

-- interests (writes for accept/reject/withdraw go through RPCs)
create policy interests_read on interests for select to authenticated
  using (
    requester_id = auth.uid()
    or exists (select 1 from listings l where l.id = listing_id and l.owner_id = auth.uid())
    or is_admin()
  );
create policy interests_insert on interests for insert to authenticated
  with check (
    requester_id = auth.uid()
    and is_member()
    and status = 'pending'
    and exists (select 1 from listings l
                where l.id = listing_id and l.status = 'active'
                  and l.expires_at > now() and l.owner_id <> auth.uid())
  );

-- notifications: users read/mark-read/delete their own; only triggers/RPCs create them
create policy notifs_read   on notifications for select to authenticated using (user_id = auth.uid());
create policy notifs_update on notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifs_delete on notifications for delete to authenticated using (user_id = auth.uid());

-- reports
create policy reports_insert on reports for insert to authenticated
  with check (reporter_id = auth.uid() and is_member());
create policy reports_read on reports for select to authenticated
  using (reporter_id = auth.uid() or is_admin());
create policy reports_admin_update on reports for update to authenticated
  using (is_admin()) with check (is_admin());

-- ---------- COLUMN-LEVEL WRITE LIMITS --------------------------------
-- Users can never edit role/status/owner_id etc. from the browser.
revoke update on profiles      from authenticated;
grant  update (full_name, avatar_url, batch) on profiles to authenticated;

revoke update on listings      from authenticated;
grant  update (kind, title, description, category_id, price, rent_period, deposit,
               condition, pickup_area, image_paths, status, expires_at)
       on listings to authenticated;

revoke update on notifications from authenticated;
grant  update (read_at) on notifications to authenticated;

revoke update on reports       from authenticated;
grant  update (status, handled_by, handled_at) on reports to authenticated;

-- Nothing is readable by logged-out visitors.
revoke all on all tables in schema public from anon;

-- ---------- STORAGE (listing photos) ---------------------------------
-- Public bucket (random file names), max 500 KB per image, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 512000,
        array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "members upload to own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-images'
              and (storage.foldername(name))[1] = auth.uid()::text
              and public.is_member());

create policy "owners delete own images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-images'
         and (storage.foldername(name))[1] = auth.uid()::text);

create policy "admins delete any image" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-images' and public.is_admin());

-- =====================================================================
-- AFTER RUNNING (run these separately in the SQL editor):
--
-- 1) Create your first campus access code (make it long and random):
--    insert into access_codes (code, label, max_uses, expires_at)
--    values ('INFY-MYS-K7Q2X9PD', 'Pilot batch', 100, now() + interval '30 days');
--
-- 2) Sign in to the app once with Google, then make yourself admin:
--    update profiles set role = 'admin', status = 'active'
--    where id = (select id from auth.users where email = 'YOUR_GMAIL@gmail.com');
--
-- 3) Only when you build live notifications (Playbook phase 6):
--    alter publication supabase_realtime add table notifications;
-- =====================================================================
