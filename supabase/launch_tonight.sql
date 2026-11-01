-- =====================================================================
-- LAUNCH-TONIGHT CONTACT RULE  (run AFTER schema.sql)
-- Any signed-in, active campus member can see the WhatsApp number and block
-- of a person who CURRENTLY has an active/reserved listing. Nothing else is exposed:
-- people with no live listing, pending or logged-out visitors see nothing.
-- =====================================================================
create or replace function can_see_contact(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_member() and (
    auth.uid() = p_user
    or exists (
      select 1 from listings l
      where l.owner_id = p_user
        and l.status in ('active', 'reserved')
        and l.expires_at > now()
    )
  );
$$;

-- ---------------------------------------------------------------------
-- LATER (when you build the request/accept flow): paste this to go back to
-- "contact is revealed only after the owner accepts a request".
-- ---------------------------------------------------------------------
-- create or replace function can_see_contact(p_user uuid) returns boolean
-- language sql stable security definer set search_path = public as $$
--   select is_member() and (
--     auth.uid() = p_user
--     or exists (
--       select 1 from interests i join listings l on l.id = i.listing_id
--       where i.status = 'accepted'
--         and (   (l.owner_id = auth.uid() and i.requester_id = p_user)
--              or (i.requester_id = auth.uid() and l.owner_id = p_user))
--     )
--   );
-- $$;
