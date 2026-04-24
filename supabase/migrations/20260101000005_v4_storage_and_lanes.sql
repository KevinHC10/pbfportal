-- v4: storage bucket for league images + per-session lane assignments.

-- ------------------------------------------------------------------
-- Storage bucket for league logos/banners.
-- Public read; authenticated write.
-- ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('league-assets', 'league-assets', true)
on conflict (id) do nothing;

drop policy if exists "league-assets public read" on storage.objects;
create policy "league-assets public read" on storage.objects
  for select
  using (bucket_id = 'league-assets');

drop policy if exists "league-assets authenticated insert" on storage.objects;
create policy "league-assets authenticated insert" on storage.objects
  for insert
  with check (bucket_id = 'league-assets' and auth.role() = 'authenticated');

drop policy if exists "league-assets authenticated update" on storage.objects;
create policy "league-assets authenticated update" on storage.objects
  for update
  using (bucket_id = 'league-assets' and auth.role() = 'authenticated')
  with check (bucket_id = 'league-assets' and auth.role() = 'authenticated');

drop policy if exists "league-assets authenticated delete" on storage.objects;
create policy "league-assets authenticated delete" on storage.objects
  for delete
  using (bucket_id = 'league-assets' and auth.role() = 'authenticated');

-- ------------------------------------------------------------------
-- session_lane_assignments
-- One row per (session, event_player) overrides the default lane on
-- event_players for that specific session.
-- ------------------------------------------------------------------
create table if not exists public.session_lane_assignments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  event_player_id uuid not null references public.event_players(id) on delete cascade,
  lane_number smallint check (lane_number is null or lane_number between 1 and 999),
  updated_at timestamptz not null default now(),
  unique (session_id, event_player_id)
);

create index if not exists session_lane_assignments_session_idx
  on public.session_lane_assignments (session_id);

drop trigger if exists session_lane_assignments_touch on public.session_lane_assignments;
create trigger session_lane_assignments_touch
before update on public.session_lane_assignments
for each row execute function public.touch_updated_at();

alter table public.session_lane_assignments enable row level security;

drop policy if exists session_lane_select on public.session_lane_assignments;
create policy session_lane_select on public.session_lane_assignments
  for select
  using (
    exists (select 1 from public.sessions s where s.id = session_lane_assignments.session_id)
  );

drop policy if exists session_lane_write on public.session_lane_assignments;
create policy session_lane_write on public.session_lane_assignments
  for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_lane_assignments.session_id and public.is_event_owner(s.event_id)
    )
  )
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_lane_assignments.session_id and public.is_event_owner(s.event_id)
    )
  );
