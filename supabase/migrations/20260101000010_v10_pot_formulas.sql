-- v9 (post-v8): pot game formula shapes.
--
-- Adds two columns to pot_games so the admin can pick which handicap shape
-- the pot uses:
--   formula  ∈ {'top_anchored', 'ceiling_anchored', 'scratch'}
--   ceiling  smallint (only used by ceiling_anchored)
--
-- Existing pots default to 'top_anchored' so the prior behavior is preserved.

alter table public.pot_games
  add column if not exists formula text not null default 'top_anchored',
  add column if not exists ceiling smallint;

do $$
begin
  if not exists (
    select 1 from information_schema.check_constraints
    where constraint_name = 'pot_games_formula_kind'
  ) then
    alter table public.pot_games
      add constraint pot_games_formula_kind
      check (formula in ('top_anchored', 'ceiling_anchored', 'scratch'));
  end if;
end $$;
