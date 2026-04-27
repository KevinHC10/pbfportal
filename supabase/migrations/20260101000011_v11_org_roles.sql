-- v11: organizer roles + per-league access control.
--
-- Adds a role layer on top of auth.users so we can distinguish:
--   superadmin — sees / writes everything
--   organizer  — default for new signups; sees only leagues they admin
--                and events under those leagues (plus tournaments they
--                personally created without a league_id).
--
-- league_admins is the per-league grant table. The league creator is
-- automatically inserted as an admin of their own league.
--
-- After running this migration, mark yourself as superadmin in the SQL
-- Editor with:
--   update public.user_profiles
--   set role = 'superadmin'
--   where user_id = (select id from auth.users where email = '<your email>');

-- ------------------------------------------------------------------
-- user_profiles
-- ------------------------------------------------------------------
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'organizer' check (role in ('superadmin', 'organizer')),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists user_profiles_touch_updated_at on public.user_profiles;
create trigger user_profiles_touch_updated_at
before update on public.user_profiles
for each row execute function public.touch_updated_at();

-- Backfill existing auth users
insert into public.user_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- New signups get a profile row automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------
-- league_admins
-- ------------------------------------------------------------------
create table if not exists public.league_admins (
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

create index if not exists league_admins_user_idx on public.league_admins (user_id);

-- Backfill: every existing league's creator is automatically an admin
insert into public.league_admins (league_id, user_id, granted_by)
select id, created_by, created_by from public.leagues
on conflict (league_id, user_id) do nothing;

-- New leagues auto-grant admin to the creator
create or replace function public.handle_new_league()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.league_admins (league_id, user_id, granted_by)
  values (new.id, new.created_by, new.created_by)
  on conflict (league_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_league_created on public.leagues;
create trigger on_league_created
after insert on public.leagues
for each row execute function public.handle_new_league();

-- ------------------------------------------------------------------
-- Helper functions
-- ------------------------------------------------------------------
create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles
    where user_id = auth.uid() and role = 'superadmin'
  );
$$;

create or replace function public.can_manage_league(_league uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_superadmin()
    or exists (
      select 1 from public.league_admins la
      where la.league_id = _league and la.user_id = auth.uid()
    );
$$;

-- Re-point the legacy is_league_owner / is_event_owner gates so every
-- existing policy that calls them now respects league_admins + superadmin.
create or replace function public.is_league_owner(league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_league(league_id);
$$;

create or replace function public.is_event_owner(event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.events e
    where e.id = event_id
      and (
        e.created_by = auth.uid()
        or public.is_superadmin()
        or (e.league_id is not null and public.can_manage_league(e.league_id))
      )
  );
$$;

-- ------------------------------------------------------------------
-- find_user_id_by_email
-- Lets the client resolve an email to a uuid for the "grant league admin"
-- flow without exposing the whole auth.users table. Returns null if none.
-- ------------------------------------------------------------------
create or replace function public.find_user_id_by_email(_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from auth.users where lower(email) = lower(_email) limit 1;
$$;

revoke all on function public.find_user_id_by_email(text) from public;
grant execute on function public.find_user_id_by_email(text) to authenticated;

-- ------------------------------------------------------------------
-- RLS for user_profiles
-- ------------------------------------------------------------------
alter table public.user_profiles enable row level security;

-- A user can read their own profile; superadmins can read all (so the
-- "All organizers" page works).
drop policy if exists user_profiles_select on public.user_profiles;
create policy user_profiles_select on public.user_profiles
  for select
  using (user_id = auth.uid() or public.is_superadmin());

-- A user can update their own row (full_name) but not their role.
drop policy if exists user_profiles_update_self on public.user_profiles;
create policy user_profiles_update_self on public.user_profiles
  for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and role = (select up.role from public.user_profiles up where up.user_id = auth.uid())
  );

-- Superadmins can update anyone's profile (including role).
drop policy if exists user_profiles_update_super on public.user_profiles;
create policy user_profiles_update_super on public.user_profiles
  for update
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Inserts only happen via the trigger; no policy is needed for clients.

-- ------------------------------------------------------------------
-- RLS for league_admins
-- ------------------------------------------------------------------
alter table public.league_admins enable row level security;

drop policy if exists league_admins_select on public.league_admins;
create policy league_admins_select on public.league_admins
  for select
  using (
    user_id = auth.uid()
    or public.is_superadmin()
    or public.can_manage_league(league_id)
  );

drop policy if exists league_admins_write on public.league_admins;
create policy league_admins_write on public.league_admins
  for all
  using (public.is_superadmin() or public.can_manage_league(league_id))
  with check (public.is_superadmin() or public.can_manage_league(league_id));

-- ------------------------------------------------------------------
-- Players: switch to a shared pool. Anyone authenticated can read; only
-- the creator (or superadmin) can mutate. This lets organizers re-use
-- existing player records across leagues.
-- ------------------------------------------------------------------
drop policy if exists players_select_by_owner_or_public_event on public.players;
drop policy if exists players_select_all on public.players;
create policy players_select_all on public.players
  for select
  using (true);

drop policy if exists players_update_own on public.players;
create policy players_update_own on public.players
  for update
  using (created_by = auth.uid() or public.is_superadmin())
  with check (created_by = auth.uid() or public.is_superadmin());

drop policy if exists players_delete_own on public.players;
create policy players_delete_own on public.players
  for delete
  using (created_by = auth.uid() or public.is_superadmin());

-- Insert: still by the calling user
drop policy if exists players_insert_own on public.players;
create policy players_insert_own on public.players
  for insert
  with check (created_by = auth.uid());

-- ------------------------------------------------------------------
-- Leagues: update gate now allows league admins (via can_manage_league),
-- delete is still creator-only (or superadmin).
-- ------------------------------------------------------------------
drop policy if exists leagues_update_own on public.leagues;
create policy leagues_update_own on public.leagues
  for update
  using (public.can_manage_league(id))
  with check (public.can_manage_league(id));

drop policy if exists leagues_delete_own on public.leagues;
create policy leagues_delete_own on public.leagues
  for delete
  using (created_by = auth.uid() or public.is_superadmin());

-- Events: update / delete gate widens to league admins
drop policy if exists events_update_own on public.events;
create policy events_update_own on public.events
  for update
  using (public.is_event_owner(id))
  with check (public.is_event_owner(id));

drop policy if exists events_delete_own on public.events;
create policy events_delete_own on public.events
  for delete
  using (public.is_event_owner(id));

-- Associations: update / delete gate adds superadmin override
drop policy if exists associations_update_own on public.associations;
create policy associations_update_own on public.associations
  for update
  using (created_by = auth.uid() or public.is_superadmin())
  with check (created_by = auth.uid() or public.is_superadmin());

drop policy if exists associations_delete_own on public.associations;
create policy associations_delete_own on public.associations
  for delete
  using (created_by = auth.uid() or public.is_superadmin());
