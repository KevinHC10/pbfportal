-- v6: public slug for players so they get a standalone profile URL.
--
-- Slug shape: "<name-slugified>-<6 hex>" using md5(id) as the tail for
-- deterministic backfill uniqueness. Client code uses crypto-random for new
-- rows.

alter table public.players
  add column if not exists public_slug text;

-- Backfill every existing row. trim strips leading/trailing hyphens that
-- appear when a name starts with punctuation.
update public.players
set public_slug =
  nullif(
    trim(both '-' from lower(regexp_replace(full_name, '[^a-zA-Z0-9]+', '-', 'g'))),
    ''
  ) || '-' || substr(md5(id::text), 1, 6)
where public_slug is null;

-- Any row where full_name normalized to empty (weird unicode only) would now
-- have "null-xxxxxx"; fall back to just the random suffix.
update public.players
set public_slug = 'player-' || substr(md5(id::text), 1, 8)
where public_slug is null or public_slug like 'null-%';

alter table public.players
  alter column public_slug set not null;

create unique index if not exists players_public_slug_idx on public.players (public_slug);
