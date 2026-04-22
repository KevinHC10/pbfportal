-- v2: affiliation, lane number, league handicap formula
--
-- All additive / nullable / default — safe to run on an existing DB.

alter table public.players
  add column if not exists affiliation text;

alter table public.event_players
  add column if not exists lane_number smallint;

alter table public.events
  add column if not exists hdcp_base   smallint      not null default 200,
  add column if not exists hdcp_factor numeric(4,2)  not null default 0.80,
  add column if not exists hdcp_max    smallint      not null default 80,
  add column if not exists hdcp_min    smallint      not null default 0;

-- Sanity checks (ignore errors if already applied)
do $$
begin
  if not exists (select 1 from information_schema.check_constraints where constraint_name = 'events_hdcp_factor_range') then
    alter table public.events add constraint events_hdcp_factor_range check (hdcp_factor between 0 and 2);
  end if;
  if not exists (select 1 from information_schema.check_constraints where constraint_name = 'events_hdcp_min_max') then
    alter table public.events add constraint events_hdcp_min_max check (hdcp_min >= 0 and hdcp_max >= hdcp_min);
  end if;
end $$;
