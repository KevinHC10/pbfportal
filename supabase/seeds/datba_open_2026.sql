-- ============================================================
-- BowlTrack seed: DATBA Invitational Open Championship 2026
-- 40 bowlers × 10 games, fictional roster.
--
-- HOW TO USE
--   1. In Supabase Studio → SQL Editor → New query.
--   2. Edit the email below to match the admin user that should own this event.
--      (The admin must already exist; create one in Authentication → Users.)
--   3. Paste this whole file → Run.
--   4. The slug is printed at the bottom; visit /e/<slug> on your deployed app.
-- ============================================================

do $$
declare
  admin_email     text := 'admin@bowltrack.local'; -- <-- EDIT ME
  v_admin_id      uuid;
  v_event_id      uuid;
  v_session_id    uuid;
  v_player_id     uuid;
  v_event_player  uuid;
  v_game_id       uuid;
  v_slug          text := 'r9gngyufew';
begin
  select id into v_admin_id from auth.users where email = admin_email limit 1;
  if v_admin_id is null then
    raise exception 'Admin user with email % not found. Create one in Authentication → Users first.', admin_email;
  end if;

  -- Event
  insert into public.events (name, type, start_date, end_date, status, public_slug, center_name, total_games, created_by)
  values ('DATBA Invitational Open Championship 2026', 'tournament', '2026-04-11', '2026-04-19', 'completed', v_slug, 'Sunrise Bowling Center, Manila', 10, v_admin_id)
  returning id into v_event_id;

  -- Single session for the whole tournament
  insert into public.sessions (event_id, session_number, session_date)
  values (v_event_id, 1, '2026-04-19')
  returning id into v_session_id;

  -- Anton Reyes
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Anton Reyes', 'right', 177, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 168, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 27),
    (v_game_id, 2, 10, null, null, 47),
    (v_game_id, 3, 7, 3, null, 67),
    (v_game_id, 4, 10, null, null, 88),
    (v_game_id, 5, 10, null, null, 104),
    (v_game_id, 6, 1, 5, null, 110),
    (v_game_id, 7, 10, null, null, 125),
    (v_game_id, 8, 3, 2, null, 130),
    (v_game_id, 9, 2, 6, null, 138),
    (v_game_id, 10, 10, 10, 10, 168);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 189, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 20),
    (v_game_id, 2, 10, null, null, 37),
    (v_game_id, 3, 0, 7, null, 44),
    (v_game_id, 4, 10, null, null, 74),
    (v_game_id, 5, 10, null, null, 98),
    (v_game_id, 6, 10, null, null, 114),
    (v_game_id, 7, 4, 2, null, 120),
    (v_game_id, 8, 10, null, null, 149),
    (v_game_id, 9, 10, null, null, 169),
    (v_game_id, 10, 9, 1, 10, 189);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 282, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 60),
    (v_game_id, 3, 10, null, null, 90),
    (v_game_id, 4, 10, null, null, 120),
    (v_game_id, 5, 10, null, null, 150),
    (v_game_id, 6, 10, null, null, 180),
    (v_game_id, 7, 10, null, null, 210),
    (v_game_id, 8, 10, null, null, 240),
    (v_game_id, 9, 10, null, null, 266),
    (v_game_id, 10, 10, 6, 0, 282);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 245, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 20),
    (v_game_id, 2, 10, null, null, 49),
    (v_game_id, 3, 10, null, null, 69),
    (v_game_id, 4, 9, 1, null, 89),
    (v_game_id, 5, 10, null, null, 119),
    (v_game_id, 6, 10, null, null, 149),
    (v_game_id, 7, 10, null, null, 179),
    (v_game_id, 8, 10, null, null, 209),
    (v_game_id, 9, 10, null, null, 231),
    (v_game_id, 10, 10, 2, 2, 245);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 19),
    (v_game_id, 2, 9, 1, null, 35),
    (v_game_id, 3, 6, 4, null, 55),
    (v_game_id, 4, 10, null, null, 85),
    (v_game_id, 5, 10, null, null, 107),
    (v_game_id, 6, 10, null, null, 123),
    (v_game_id, 7, 2, 4, null, 129),
    (v_game_id, 8, 9, 1, null, 139),
    (v_game_id, 9, 0, 1, null, 140),
    (v_game_id, 10, 2, 5, null, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 128, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 2, null, 3),
    (v_game_id, 2, 1, 4, null, 8),
    (v_game_id, 3, 10, null, null, 27),
    (v_game_id, 4, 4, 5, null, 36),
    (v_game_id, 5, 7, 3, null, 53),
    (v_game_id, 6, 7, 2, null, 62),
    (v_game_id, 7, 10, null, null, 76),
    (v_game_id, 8, 4, 0, null, 80),
    (v_game_id, 9, 10, null, null, 109),
    (v_game_id, 10, 10, 9, 0, 128);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 150, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 0, null, 2),
    (v_game_id, 2, 3, 3, null, 8),
    (v_game_id, 3, 2, 8, null, 23),
    (v_game_id, 4, 5, 5, null, 33),
    (v_game_id, 5, 0, 10, null, 50),
    (v_game_id, 6, 7, 3, null, 70),
    (v_game_id, 7, 10, null, null, 90),
    (v_game_id, 8, 9, 1, null, 110),
    (v_game_id, 9, 10, null, null, 130),
    (v_game_id, 10, 7, 3, 10, 150);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 144, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 0, 10, null, 56),
    (v_game_id, 4, 6, 2, null, 64),
    (v_game_id, 5, 3, 7, null, 81),
    (v_game_id, 6, 7, 2, null, 90),
    (v_game_id, 7, 6, 3, null, 99),
    (v_game_id, 8, 1, 0, null, 100),
    (v_game_id, 9, 10, null, null, 125),
    (v_game_id, 10, 10, 5, 4, 144);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 154, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 5, null, 8),
    (v_game_id, 2, 7, 2, null, 17),
    (v_game_id, 3, 4, 6, null, 33),
    (v_game_id, 4, 6, 4, null, 53),
    (v_game_id, 5, 10, null, null, 73),
    (v_game_id, 6, 2, 8, null, 86),
    (v_game_id, 7, 3, 7, null, 105),
    (v_game_id, 8, 9, 0, null, 114),
    (v_game_id, 9, 7, 3, null, 134),
    (v_game_id, 10, 10, 1, 9, 154);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 133, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 3, null, 4),
    (v_game_id, 2, 3, 4, null, 11),
    (v_game_id, 3, 10, null, null, 39),
    (v_game_id, 4, 10, null, null, 59),
    (v_game_id, 5, 8, 2, null, 77),
    (v_game_id, 6, 8, 2, null, 96),
    (v_game_id, 7, 9, 1, null, 113),
    (v_game_id, 8, 7, 0, null, 120),
    (v_game_id, 9, 8, 1, null, 129),
    (v_game_id, 10, 1, 3, null, 133);

  -- Bryan Lim
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Bryan Lim', 'right', 188, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 155, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 17),
    (v_game_id, 2, 6, 1, null, 24),
    (v_game_id, 3, 10, null, null, 38),
    (v_game_id, 4, 3, 1, null, 42),
    (v_game_id, 5, 0, 8, null, 50),
    (v_game_id, 6, 1, 9, null, 70),
    (v_game_id, 7, 10, null, null, 95),
    (v_game_id, 8, 10, null, null, 115),
    (v_game_id, 9, 5, 5, null, 135),
    (v_game_id, 10, 10, 4, 6, 155);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 169, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 26),
    (v_game_id, 2, 10, null, null, 46),
    (v_game_id, 3, 6, 4, null, 64),
    (v_game_id, 4, 8, 0, null, 72),
    (v_game_id, 5, 3, 2, null, 77),
    (v_game_id, 6, 1, 9, null, 97),
    (v_game_id, 7, 10, null, null, 117),
    (v_game_id, 8, 6, 4, null, 137),
    (v_game_id, 9, 10, null, null, 157),
    (v_game_id, 10, 6, 4, 2, 169);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 187, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 14),
    (v_game_id, 2, 0, 4, null, 18),
    (v_game_id, 3, 10, null, null, 44),
    (v_game_id, 4, 10, null, null, 62),
    (v_game_id, 5, 6, 2, null, 70),
    (v_game_id, 6, 10, null, null, 90),
    (v_game_id, 7, 8, 2, null, 107),
    (v_game_id, 8, 7, 3, null, 127),
    (v_game_id, 9, 10, null, null, 157),
    (v_game_id, 10, 10, 10, 10, 187);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 200, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 2, null, 4),
    (v_game_id, 2, 5, 0, null, 9),
    (v_game_id, 3, 2, 8, null, 29),
    (v_game_id, 4, 10, null, null, 59),
    (v_game_id, 5, 10, null, null, 89),
    (v_game_id, 6, 10, null, null, 119),
    (v_game_id, 7, 10, null, null, 144),
    (v_game_id, 8, 10, null, null, 164),
    (v_game_id, 9, 5, 5, null, 180),
    (v_game_id, 10, 6, 4, 10, 200);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 132, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 0, null, 8),
    (v_game_id, 2, 2, 8, null, 20),
    (v_game_id, 3, 2, 3, null, 25),
    (v_game_id, 4, 1, 9, null, 41),
    (v_game_id, 5, 6, 1, null, 48),
    (v_game_id, 6, 9, 1, null, 68),
    (v_game_id, 7, 10, null, null, 88),
    (v_game_id, 8, 5, 5, null, 106),
    (v_game_id, 9, 8, 2, null, 116),
    (v_game_id, 10, 0, 10, 6, 132);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 104, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 0, null, 1),
    (v_game_id, 2, 2, 6, null, 9),
    (v_game_id, 3, 6, 3, null, 18),
    (v_game_id, 4, 10, null, null, 32),
    (v_game_id, 5, 2, 2, null, 36),
    (v_game_id, 6, 4, 6, null, 49),
    (v_game_id, 7, 3, 7, null, 65),
    (v_game_id, 8, 6, 4, null, 79),
    (v_game_id, 9, 4, 1, null, 84),
    (v_game_id, 10, 2, 8, 10, 104);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 151, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 11),
    (v_game_id, 2, 1, 0, null, 12),
    (v_game_id, 3, 10, null, null, 32),
    (v_game_id, 4, 2, 8, null, 52),
    (v_game_id, 5, 10, null, null, 73),
    (v_game_id, 6, 10, null, null, 93),
    (v_game_id, 7, 1, 9, null, 103),
    (v_game_id, 8, 0, 10, null, 123),
    (v_game_id, 9, 10, null, null, 142),
    (v_game_id, 10, 5, 4, null, 151);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 208, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 9, null, 11),
    (v_game_id, 2, 1, 9, null, 28),
    (v_game_id, 3, 7, 3, null, 48),
    (v_game_id, 4, 10, null, null, 67),
    (v_game_id, 5, 9, 0, null, 76),
    (v_game_id, 6, 10, null, null, 106),
    (v_game_id, 7, 10, null, null, 136),
    (v_game_id, 8, 10, null, null, 166),
    (v_game_id, 9, 10, null, null, 192),
    (v_game_id, 10, 10, 6, 0, 208);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 137, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 3, null, 7),
    (v_game_id, 2, 10, null, null, 34),
    (v_game_id, 3, 10, null, null, 52),
    (v_game_id, 4, 7, 1, null, 60),
    (v_game_id, 5, 5, 5, null, 78),
    (v_game_id, 6, 8, 1, null, 87),
    (v_game_id, 7, 3, 3, null, 93),
    (v_game_id, 8, 10, null, null, 112),
    (v_game_id, 9, 9, 0, null, 121),
    (v_game_id, 10, 8, 2, 6, 137);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 229, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 60),
    (v_game_id, 3, 10, null, null, 89),
    (v_game_id, 4, 10, null, null, 109),
    (v_game_id, 5, 9, 1, null, 122),
    (v_game_id, 6, 3, 3, null, 128),
    (v_game_id, 7, 2, 8, null, 148),
    (v_game_id, 8, 10, null, null, 178),
    (v_game_id, 9, 10, null, null, 208),
    (v_game_id, 10, 10, 10, 1, 229);

  -- Carlos Mendoza
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Carlos Mendoza', 'right', 188, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 161, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 6, 4, null, 40),
    (v_game_id, 3, 10, null, null, 55),
    (v_game_id, 4, 4, 1, null, 60),
    (v_game_id, 5, 3, 7, null, 76),
    (v_game_id, 6, 6, 4, null, 96),
    (v_game_id, 7, 10, null, null, 116),
    (v_game_id, 8, 1, 9, null, 132),
    (v_game_id, 9, 6, 4, null, 147),
    (v_game_id, 10, 5, 5, 4, 161);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 7, null, 9),
    (v_game_id, 2, 4, 2, null, 15),
    (v_game_id, 3, 1, 9, null, 30),
    (v_game_id, 4, 5, 5, null, 50),
    (v_game_id, 5, 10, null, null, 70),
    (v_game_id, 6, 4, 6, null, 89),
    (v_game_id, 7, 9, 1, null, 109),
    (v_game_id, 8, 10, null, null, 123),
    (v_game_id, 9, 0, 4, null, 127),
    (v_game_id, 10, 9, 1, 10, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 188, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 0, 10, null, 40),
    (v_game_id, 3, 10, null, null, 70),
    (v_game_id, 4, 10, null, null, 97),
    (v_game_id, 5, 10, null, null, 114),
    (v_game_id, 6, 7, 0, null, 121),
    (v_game_id, 7, 10, null, null, 149),
    (v_game_id, 8, 10, null, null, 169),
    (v_game_id, 9, 8, 2, null, 182),
    (v_game_id, 10, 3, 3, null, 188);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 118, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 0, null, 3),
    (v_game_id, 2, 10, null, null, 23),
    (v_game_id, 3, 1, 9, null, 43),
    (v_game_id, 4, 10, null, null, 60),
    (v_game_id, 5, 5, 2, null, 67),
    (v_game_id, 6, 1, 1, null, 69),
    (v_game_id, 7, 7, 2, null, 78),
    (v_game_id, 8, 9, 1, null, 98),
    (v_game_id, 9, 10, null, null, 113),
    (v_game_id, 10, 3, 2, null, 118);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 142, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 8, 0, null, 26),
    (v_game_id, 3, 3, 7, null, 46),
    (v_game_id, 4, 10, null, null, 65),
    (v_game_id, 5, 7, 2, null, 74),
    (v_game_id, 6, 8, 0, null, 82),
    (v_game_id, 7, 6, 4, null, 95),
    (v_game_id, 8, 3, 4, null, 102),
    (v_game_id, 9, 10, null, null, 122),
    (v_game_id, 10, 6, 4, 10, 142);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 194, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 26),
    (v_game_id, 2, 10, null, null, 46),
    (v_game_id, 3, 6, 4, null, 66),
    (v_game_id, 4, 10, null, null, 95),
    (v_game_id, 5, 10, null, null, 114),
    (v_game_id, 6, 9, 0, null, 123),
    (v_game_id, 7, 7, 3, null, 143),
    (v_game_id, 8, 10, null, null, 168),
    (v_game_id, 9, 10, null, null, 186),
    (v_game_id, 10, 5, 3, null, 194);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 192, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 0, null, 7),
    (v_game_id, 2, 9, 0, null, 16),
    (v_game_id, 3, 10, null, null, 39),
    (v_game_id, 4, 10, null, null, 59),
    (v_game_id, 5, 3, 7, null, 74),
    (v_game_id, 6, 5, 5, null, 93),
    (v_game_id, 7, 9, 0, null, 102),
    (v_game_id, 8, 10, null, null, 132),
    (v_game_id, 9, 10, null, null, 162),
    (v_game_id, 10, 10, 10, 10, 192);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 118, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 6, 4, null, 36),
    (v_game_id, 3, 6, 0, null, 42),
    (v_game_id, 4, 5, 4, null, 51),
    (v_game_id, 5, 1, 9, null, 71),
    (v_game_id, 6, 10, null, null, 84),
    (v_game_id, 7, 1, 2, null, 87),
    (v_game_id, 8, 5, 2, null, 94),
    (v_game_id, 9, 3, 1, null, 98),
    (v_game_id, 10, 10, 7, 3, 118);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 120, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 8, 1, null, 28),
    (v_game_id, 3, 1, 2, null, 31),
    (v_game_id, 4, 10, null, null, 57),
    (v_game_id, 5, 10, null, null, 73),
    (v_game_id, 6, 6, 0, null, 79),
    (v_game_id, 7, 6, 3, null, 88),
    (v_game_id, 8, 10, null, null, 108),
    (v_game_id, 9, 8, 2, null, 118),
    (v_game_id, 10, 0, 2, null, 120);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 172, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 17),
    (v_game_id, 2, 5, 2, null, 24),
    (v_game_id, 3, 1, 2, null, 27),
    (v_game_id, 4, 5, 0, null, 32),
    (v_game_id, 5, 6, 4, null, 52),
    (v_game_id, 6, 10, null, null, 82),
    (v_game_id, 7, 10, null, null, 112),
    (v_game_id, 8, 10, null, null, 142),
    (v_game_id, 9, 10, null, null, 162),
    (v_game_id, 10, 10, 0, 0, 172);

  -- Dexter Tan
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Dexter Tan', 'right', 174, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 137, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 21),
    (v_game_id, 2, 10, null, null, 39),
    (v_game_id, 3, 1, 7, null, 47),
    (v_game_id, 4, 8, 2, null, 57),
    (v_game_id, 5, 0, 9, null, 66),
    (v_game_id, 6, 3, 7, null, 85),
    (v_game_id, 7, 9, 1, null, 98),
    (v_game_id, 8, 3, 5, null, 106),
    (v_game_id, 9, 5, 3, null, 114),
    (v_game_id, 10, 10, 10, 3, 137);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 128, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 4, null, 6),
    (v_game_id, 2, 9, 0, null, 15),
    (v_game_id, 3, 10, null, null, 35),
    (v_game_id, 4, 8, 2, null, 55),
    (v_game_id, 5, 10, null, null, 70),
    (v_game_id, 6, 4, 1, null, 75),
    (v_game_id, 7, 0, 9, null, 84),
    (v_game_id, 8, 10, null, null, 104),
    (v_game_id, 9, 9, 1, null, 120),
    (v_game_id, 10, 6, 2, null, 128);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 154, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 17),
    (v_game_id, 2, 7, 0, null, 24),
    (v_game_id, 3, 10, null, null, 42),
    (v_game_id, 4, 8, 0, null, 50),
    (v_game_id, 5, 3, 7, null, 70),
    (v_game_id, 6, 10, null, null, 87),
    (v_game_id, 7, 7, 0, null, 94),
    (v_game_id, 8, 9, 1, null, 114),
    (v_game_id, 9, 10, null, null, 134),
    (v_game_id, 10, 4, 6, 10, 154);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 150, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 3, null, 7),
    (v_game_id, 2, 10, null, null, 27),
    (v_game_id, 3, 6, 4, null, 47),
    (v_game_id, 4, 10, null, null, 61),
    (v_game_id, 5, 2, 2, null, 65),
    (v_game_id, 6, 10, null, null, 85),
    (v_game_id, 7, 2, 8, null, 105),
    (v_game_id, 8, 10, null, null, 125),
    (v_game_id, 9, 4, 6, null, 142),
    (v_game_id, 10, 7, 1, null, 150);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 187, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 9, null, 20),
    (v_game_id, 2, 10, null, null, 50),
    (v_game_id, 3, 10, null, null, 80),
    (v_game_id, 4, 10, null, null, 105),
    (v_game_id, 5, 10, null, null, 125),
    (v_game_id, 6, 5, 5, null, 139),
    (v_game_id, 7, 4, 5, null, 148),
    (v_game_id, 8, 10, null, null, 168),
    (v_game_id, 9, 8, 2, null, 182),
    (v_game_id, 10, 4, 1, null, 187);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 179, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 40),
    (v_game_id, 3, 10, null, null, 60),
    (v_game_id, 4, 4, 6, null, 80),
    (v_game_id, 5, 10, null, null, 99),
    (v_game_id, 6, 3, 6, null, 108),
    (v_game_id, 7, 9, 1, null, 128),
    (v_game_id, 8, 10, null, null, 148),
    (v_game_id, 9, 1, 9, null, 163),
    (v_game_id, 10, 5, 5, 6, 179);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 94, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 11),
    (v_game_id, 2, 1, 0, null, 12),
    (v_game_id, 3, 0, 10, null, 22),
    (v_game_id, 4, 0, 2, null, 24),
    (v_game_id, 5, 4, 0, null, 28),
    (v_game_id, 6, 4, 0, null, 32),
    (v_game_id, 7, 3, 3, null, 38),
    (v_game_id, 8, 10, null, null, 58),
    (v_game_id, 9, 6, 4, null, 74),
    (v_game_id, 10, 6, 4, 10, 94);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 141, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 6, 4, null, 40),
    (v_game_id, 3, 10, null, null, 60),
    (v_game_id, 4, 8, 2, null, 76),
    (v_game_id, 5, 6, 4, null, 93),
    (v_game_id, 6, 7, 0, null, 100),
    (v_game_id, 7, 2, 3, null, 105),
    (v_game_id, 8, 8, 2, null, 115),
    (v_game_id, 9, 0, 5, null, 120),
    (v_game_id, 10, 10, 10, 1, 141);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 161, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 8, 2, null, 53),
    (v_game_id, 4, 3, 1, null, 57),
    (v_game_id, 5, 5, 5, null, 77),
    (v_game_id, 6, 10, null, null, 99),
    (v_game_id, 7, 10, null, null, 117),
    (v_game_id, 8, 2, 6, null, 125),
    (v_game_id, 9, 4, 6, null, 141),
    (v_game_id, 10, 6, 4, 10, 161);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 162, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 13),
    (v_game_id, 2, 3, 7, null, 31),
    (v_game_id, 3, 8, 2, null, 47),
    (v_game_id, 4, 6, 0, null, 53),
    (v_game_id, 5, 8, 2, null, 73),
    (v_game_id, 6, 10, null, null, 103),
    (v_game_id, 7, 10, null, null, 129),
    (v_game_id, 8, 10, null, null, 146),
    (v_game_id, 9, 6, 1, null, 153),
    (v_game_id, 10, 8, 1, null, 162);

  -- Edgar Bautista
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Edgar Bautista', 'right', 172, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 130, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 20),
    (v_game_id, 2, 10, null, null, 42),
    (v_game_id, 3, 10, null, null, 62),
    (v_game_id, 4, 2, 8, null, 82),
    (v_game_id, 5, 10, null, null, 93),
    (v_game_id, 6, 1, 0, null, 94),
    (v_game_id, 7, 2, 6, null, 102),
    (v_game_id, 8, 10, null, null, 113),
    (v_game_id, 9, 0, 1, null, 114),
    (v_game_id, 10, 9, 1, 6, 130);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 146, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 17),
    (v_game_id, 2, 7, 0, null, 24),
    (v_game_id, 3, 10, null, null, 42),
    (v_game_id, 4, 3, 5, null, 50),
    (v_game_id, 5, 1, 9, null, 70),
    (v_game_id, 6, 10, null, null, 90),
    (v_game_id, 7, 8, 2, null, 110),
    (v_game_id, 8, 10, null, null, 124),
    (v_game_id, 9, 0, 4, null, 128),
    (v_game_id, 10, 10, 6, 2, 146);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 155, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 20),
    (v_game_id, 2, 10, null, null, 48),
    (v_game_id, 3, 10, null, null, 68),
    (v_game_id, 4, 8, 2, null, 88),
    (v_game_id, 5, 10, null, null, 108),
    (v_game_id, 6, 2, 8, null, 120),
    (v_game_id, 7, 2, 1, null, 123),
    (v_game_id, 8, 4, 2, null, 129),
    (v_game_id, 9, 10, null, null, 147),
    (v_game_id, 10, 2, 6, null, 155);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 110, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 2, null, 13),
    (v_game_id, 2, 3, 0, null, 16),
    (v_game_id, 3, 8, 0, null, 24),
    (v_game_id, 4, 10, null, null, 41),
    (v_game_id, 5, 4, 3, null, 48),
    (v_game_id, 6, 2, 8, null, 68),
    (v_game_id, 7, 10, null, null, 86),
    (v_game_id, 8, 2, 6, null, 94),
    (v_game_id, 9, 10, null, null, 107),
    (v_game_id, 10, 3, 0, null, 110);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 15),
    (v_game_id, 2, 5, 0, null, 20),
    (v_game_id, 3, 2, 4, null, 26),
    (v_game_id, 4, 7, 1, null, 34),
    (v_game_id, 5, 2, 5, null, 41),
    (v_game_id, 6, 10, null, null, 69),
    (v_game_id, 7, 10, null, null, 89),
    (v_game_id, 8, 8, 2, null, 109),
    (v_game_id, 9, 10, null, null, 129),
    (v_game_id, 10, 7, 3, 8, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 154, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 54),
    (v_game_id, 3, 10, null, null, 70),
    (v_game_id, 4, 4, 2, null, 76),
    (v_game_id, 5, 9, 1, null, 96),
    (v_game_id, 6, 10, null, null, 116),
    (v_game_id, 7, 7, 3, null, 128),
    (v_game_id, 8, 2, 1, null, 131),
    (v_game_id, 9, 3, 2, null, 136),
    (v_game_id, 10, 10, 5, 3, 154);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 206, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 20),
    (v_game_id, 2, 10, null, null, 42),
    (v_game_id, 3, 10, null, null, 62),
    (v_game_id, 4, 2, 8, null, 82),
    (v_game_id, 5, 10, null, null, 102),
    (v_game_id, 6, 2, 8, null, 119),
    (v_game_id, 7, 7, 0, null, 126),
    (v_game_id, 8, 1, 9, null, 146),
    (v_game_id, 9, 10, null, null, 176),
    (v_game_id, 10, 10, 10, 10, 206);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 160, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 10, null, null, 39),
    (v_game_id, 3, 0, 9, null, 48),
    (v_game_id, 4, 2, 4, null, 54),
    (v_game_id, 5, 10, null, null, 74),
    (v_game_id, 6, 1, 9, null, 94),
    (v_game_id, 7, 10, null, null, 111),
    (v_game_id, 8, 1, 6, null, 118),
    (v_game_id, 9, 10, null, null, 143),
    (v_game_id, 10, 10, 5, 2, 160);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 168, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 32),
    (v_game_id, 3, 2, 1, null, 35),
    (v_game_id, 4, 9, 1, null, 52),
    (v_game_id, 5, 7, 3, null, 72),
    (v_game_id, 6, 10, null, null, 96),
    (v_game_id, 7, 10, null, null, 112),
    (v_game_id, 8, 4, 2, null, 118),
    (v_game_id, 9, 6, 4, null, 138),
    (v_game_id, 10, 10, 10, 10, 168);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 167, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 12),
    (v_game_id, 2, 2, 8, null, 32),
    (v_game_id, 3, 10, null, null, 54),
    (v_game_id, 4, 10, null, null, 73),
    (v_game_id, 5, 2, 7, null, 82),
    (v_game_id, 6, 10, null, null, 106),
    (v_game_id, 7, 10, null, null, 122),
    (v_game_id, 8, 4, 2, null, 128),
    (v_game_id, 9, 0, 10, null, 148),
    (v_game_id, 10, 10, 4, 5, 167);

  -- Maya Coronel
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Maya Coronel', 'right', 182, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 8)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 177, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 58),
    (v_game_id, 3, 10, null, null, 77),
    (v_game_id, 4, 8, 1, null, 86),
    (v_game_id, 5, 5, 0, null, 91),
    (v_game_id, 6, 0, 10, null, 111),
    (v_game_id, 7, 10, null, null, 129),
    (v_game_id, 8, 4, 4, null, 137),
    (v_game_id, 9, 10, null, null, 157),
    (v_game_id, 10, 1, 9, 10, 177);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 153, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 2, null, 8),
    (v_game_id, 2, 10, null, null, 28),
    (v_game_id, 3, 8, 2, null, 43),
    (v_game_id, 4, 5, 0, null, 48),
    (v_game_id, 5, 1, 2, null, 51),
    (v_game_id, 6, 10, null, null, 68),
    (v_game_id, 7, 7, 0, null, 75),
    (v_game_id, 8, 4, 6, null, 95),
    (v_game_id, 9, 10, null, null, 125),
    (v_game_id, 10, 10, 10, 8, 153);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 123, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 2, null, 9),
    (v_game_id, 2, 10, null, null, 29),
    (v_game_id, 3, 10, null, null, 49),
    (v_game_id, 4, 0, 10, null, 65),
    (v_game_id, 5, 6, 0, null, 71),
    (v_game_id, 6, 10, null, null, 83),
    (v_game_id, 7, 2, 0, null, 85),
    (v_game_id, 8, 4, 2, null, 91),
    (v_game_id, 9, 10, null, null, 111),
    (v_game_id, 10, 5, 5, 2, 123);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 163, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 12),
    (v_game_id, 2, 2, 3, null, 17),
    (v_game_id, 3, 3, 7, null, 35),
    (v_game_id, 4, 8, 2, null, 48),
    (v_game_id, 5, 3, 7, null, 63),
    (v_game_id, 6, 5, 5, null, 83),
    (v_game_id, 7, 10, null, null, 103),
    (v_game_id, 8, 8, 2, null, 123),
    (v_game_id, 9, 10, null, null, 143),
    (v_game_id, 10, 3, 7, 10, 163);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 6, 4, null, 32),
    (v_game_id, 3, 2, 5, null, 39),
    (v_game_id, 4, 10, null, null, 54),
    (v_game_id, 5, 5, 0, null, 59),
    (v_game_id, 6, 1, 9, null, 79),
    (v_game_id, 7, 10, null, null, 93),
    (v_game_id, 8, 0, 4, null, 97),
    (v_game_id, 9, 8, 2, null, 117),
    (v_game_id, 10, 10, 10, 10, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 148, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 5, null, 6),
    (v_game_id, 2, 2, 6, null, 14),
    (v_game_id, 3, 2, 0, null, 16),
    (v_game_id, 4, 10, null, null, 36),
    (v_game_id, 5, 5, 5, null, 56),
    (v_game_id, 6, 10, null, null, 83),
    (v_game_id, 7, 10, null, null, 103),
    (v_game_id, 8, 7, 3, null, 115),
    (v_game_id, 9, 2, 1, null, 118),
    (v_game_id, 10, 10, 10, 10, 148);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 183, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 20),
    (v_game_id, 2, 10, null, null, 47),
    (v_game_id, 3, 10, null, null, 67),
    (v_game_id, 4, 7, 3, null, 86),
    (v_game_id, 5, 9, 1, null, 103),
    (v_game_id, 6, 7, 3, null, 123),
    (v_game_id, 7, 10, null, null, 148),
    (v_game_id, 8, 10, null, null, 166),
    (v_game_id, 9, 5, 3, null, 174),
    (v_game_id, 10, 9, 0, null, 183);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 131, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 9, 0, null, 28),
    (v_game_id, 3, 4, 6, null, 40),
    (v_game_id, 4, 2, 8, null, 54),
    (v_game_id, 5, 4, 6, null, 67),
    (v_game_id, 6, 3, 7, null, 79),
    (v_game_id, 7, 2, 2, null, 83),
    (v_game_id, 8, 5, 5, null, 94),
    (v_game_id, 9, 1, 9, null, 111),
    (v_game_id, 10, 7, 3, 10, 131);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 97, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 1, null, 7),
    (v_game_id, 2, 4, 1, null, 12),
    (v_game_id, 3, 4, 6, null, 22),
    (v_game_id, 4, 0, 0, null, 22),
    (v_game_id, 5, 4, 1, null, 27),
    (v_game_id, 6, 10, null, null, 50),
    (v_game_id, 7, 10, null, null, 70),
    (v_game_id, 8, 3, 7, null, 82),
    (v_game_id, 9, 2, 1, null, 85),
    (v_game_id, 10, 6, 4, 2, 97);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 134, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 21),
    (v_game_id, 2, 10, null, null, 38),
    (v_game_id, 3, 1, 6, null, 45),
    (v_game_id, 4, 9, 1, null, 62),
    (v_game_id, 5, 7, 1, null, 70),
    (v_game_id, 6, 10, null, null, 90),
    (v_game_id, 7, 8, 2, null, 104),
    (v_game_id, 8, 4, 1, null, 109),
    (v_game_id, 9, 7, 3, null, 121),
    (v_game_id, 10, 2, 8, 3, 134);

  -- Felix Cruz
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Felix Cruz', 'right', 189, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 175, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 55),
    (v_game_id, 3, 10, null, null, 75),
    (v_game_id, 4, 5, 5, null, 90),
    (v_game_id, 5, 5, 5, null, 103),
    (v_game_id, 6, 3, 1, null, 107),
    (v_game_id, 7, 0, 10, null, 125),
    (v_game_id, 8, 8, 2, null, 145),
    (v_game_id, 9, 10, null, null, 165),
    (v_game_id, 10, 3, 7, 0, 175);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 180, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 0, 10, null, 60),
    (v_game_id, 4, 10, null, null, 80),
    (v_game_id, 5, 6, 4, null, 100),
    (v_game_id, 6, 10, null, null, 120),
    (v_game_id, 7, 0, 10, null, 137),
    (v_game_id, 8, 7, 0, null, 144),
    (v_game_id, 9, 1, 9, null, 163),
    (v_game_id, 10, 9, 1, 7, 180);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 144, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 13),
    (v_game_id, 2, 2, 1, null, 16),
    (v_game_id, 3, 10, null, null, 35),
    (v_game_id, 4, 8, 1, null, 44),
    (v_game_id, 5, 5, 4, null, 53),
    (v_game_id, 6, 10, null, null, 73),
    (v_game_id, 7, 5, 5, null, 91),
    (v_game_id, 8, 8, 1, null, 100),
    (v_game_id, 9, 10, null, null, 127),
    (v_game_id, 10, 10, 7, 0, 144);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 161, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 54),
    (v_game_id, 3, 10, null, null, 74),
    (v_game_id, 4, 4, 6, null, 89),
    (v_game_id, 5, 5, 4, null, 98),
    (v_game_id, 6, 10, null, null, 117),
    (v_game_id, 7, 9, 0, null, 126),
    (v_game_id, 8, 5, 5, null, 137),
    (v_game_id, 9, 1, 3, null, 141),
    (v_game_id, 10, 10, 4, 6, 161);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 5, 5, null, 40),
    (v_game_id, 3, 10, null, null, 60),
    (v_game_id, 4, 0, 10, null, 76),
    (v_game_id, 5, 6, 4, null, 90),
    (v_game_id, 6, 4, 1, null, 95),
    (v_game_id, 7, 0, 10, null, 113),
    (v_game_id, 8, 8, 2, null, 130),
    (v_game_id, 9, 7, 0, null, 137),
    (v_game_id, 10, 9, 1, 0, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 162, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 33),
    (v_game_id, 3, 3, 7, null, 53),
    (v_game_id, 4, 10, null, null, 73),
    (v_game_id, 5, 9, 1, null, 91),
    (v_game_id, 6, 8, 0, null, 99),
    (v_game_id, 7, 4, 4, null, 107),
    (v_game_id, 8, 9, 0, null, 116),
    (v_game_id, 9, 10, null, null, 142),
    (v_game_id, 10, 10, 6, 4, 162);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 153, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 29),
    (v_game_id, 2, 10, null, null, 49),
    (v_game_id, 3, 9, 1, null, 69),
    (v_game_id, 4, 10, null, null, 91),
    (v_game_id, 5, 10, null, null, 107),
    (v_game_id, 6, 2, 4, null, 113),
    (v_game_id, 7, 1, 8, null, 122),
    (v_game_id, 8, 4, 6, null, 133),
    (v_game_id, 9, 1, 9, null, 147),
    (v_game_id, 10, 4, 2, null, 153);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 153, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 4, null, 6),
    (v_game_id, 2, 6, 4, null, 17),
    (v_game_id, 3, 1, 9, null, 32),
    (v_game_id, 4, 5, 2, null, 39),
    (v_game_id, 5, 10, null, null, 59),
    (v_game_id, 6, 6, 4, null, 76),
    (v_game_id, 7, 7, 3, null, 96),
    (v_game_id, 8, 10, null, null, 125),
    (v_game_id, 9, 10, null, null, 144),
    (v_game_id, 10, 9, 0, null, 153);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 222, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 40),
    (v_game_id, 3, 10, null, null, 60),
    (v_game_id, 4, 0, 10, null, 80),
    (v_game_id, 5, 10, null, null, 110),
    (v_game_id, 6, 10, null, null, 140),
    (v_game_id, 7, 10, null, null, 164),
    (v_game_id, 8, 10, null, null, 183),
    (v_game_id, 9, 4, 5, null, 192),
    (v_game_id, 10, 10, 10, 10, 222);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 139, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 6, 4, null, 36),
    (v_game_id, 3, 6, 0, null, 42),
    (v_game_id, 4, 1, 9, null, 55),
    (v_game_id, 5, 3, 3, null, 61),
    (v_game_id, 6, 0, 10, null, 81),
    (v_game_id, 7, 10, null, null, 101),
    (v_game_id, 8, 3, 7, null, 119),
    (v_game_id, 9, 8, 0, null, 127),
    (v_game_id, 10, 10, 1, 1, 139);

  -- Gilbert Mariano
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Gilbert Mariano', 'right', 182, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 206, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 5, 5, null, 38),
    (v_game_id, 3, 8, 2, null, 50),
    (v_game_id, 4, 2, 0, null, 52),
    (v_game_id, 5, 10, null, null, 82),
    (v_game_id, 6, 10, null, null, 112),
    (v_game_id, 7, 10, null, null, 142),
    (v_game_id, 8, 10, null, null, 166),
    (v_game_id, 9, 10, null, null, 186),
    (v_game_id, 10, 4, 6, 10, 206);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 161, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 0, null, 6),
    (v_game_id, 2, 9, 0, null, 15),
    (v_game_id, 3, 10, null, null, 35),
    (v_game_id, 4, 8, 2, null, 55),
    (v_game_id, 5, 10, null, null, 75),
    (v_game_id, 6, 0, 10, null, 95),
    (v_game_id, 7, 10, null, null, 115),
    (v_game_id, 8, 8, 2, null, 134),
    (v_game_id, 9, 9, 0, null, 143),
    (v_game_id, 10, 5, 5, 8, 161);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 205, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 60),
    (v_game_id, 3, 10, null, null, 82),
    (v_game_id, 4, 10, null, null, 97),
    (v_game_id, 5, 2, 3, null, 102),
    (v_game_id, 6, 10, null, null, 122),
    (v_game_id, 7, 7, 3, null, 142),
    (v_game_id, 8, 10, null, null, 162),
    (v_game_id, 9, 6, 4, null, 182),
    (v_game_id, 10, 10, 10, 3, 205);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 165, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 21),
    (v_game_id, 2, 10, null, null, 39),
    (v_game_id, 3, 1, 7, null, 47),
    (v_game_id, 4, 0, 4, null, 51),
    (v_game_id, 5, 10, null, null, 81),
    (v_game_id, 6, 10, null, null, 109),
    (v_game_id, 7, 10, null, null, 129),
    (v_game_id, 8, 8, 2, null, 139),
    (v_game_id, 9, 0, 10, null, 150),
    (v_game_id, 10, 1, 9, 5, 165);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 182, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 20),
    (v_game_id, 2, 10, null, null, 50),
    (v_game_id, 3, 10, null, null, 80),
    (v_game_id, 4, 10, null, null, 110),
    (v_game_id, 5, 10, null, null, 131),
    (v_game_id, 6, 10, null, null, 142),
    (v_game_id, 7, 1, 0, null, 143),
    (v_game_id, 8, 8, 1, null, 152),
    (v_game_id, 9, 0, 0, null, 152),
    (v_game_id, 10, 10, 10, 10, 182);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 181, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 19),
    (v_game_id, 2, 9, 1, null, 39),
    (v_game_id, 3, 10, null, null, 65),
    (v_game_id, 4, 10, null, null, 85),
    (v_game_id, 5, 6, 4, null, 102),
    (v_game_id, 6, 7, 3, null, 122),
    (v_game_id, 7, 10, null, null, 140),
    (v_game_id, 8, 7, 1, null, 148),
    (v_game_id, 9, 10, null, null, 168),
    (v_game_id, 10, 4, 6, 3, 181);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 133, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 11),
    (v_game_id, 2, 1, 9, null, 29),
    (v_game_id, 3, 8, 2, null, 41),
    (v_game_id, 4, 2, 1, null, 44),
    (v_game_id, 5, 10, null, null, 64),
    (v_game_id, 6, 9, 1, null, 79),
    (v_game_id, 7, 5, 2, null, 86),
    (v_game_id, 8, 4, 6, null, 100),
    (v_game_id, 9, 4, 0, null, 104),
    (v_game_id, 10, 10, 10, 9, 133);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 109, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 1, null, 4),
    (v_game_id, 2, 1, 9, null, 14),
    (v_game_id, 3, 0, 3, null, 17),
    (v_game_id, 4, 1, 4, null, 22),
    (v_game_id, 5, 9, 0, null, 31),
    (v_game_id, 6, 5, 4, null, 40),
    (v_game_id, 7, 7, 3, null, 58),
    (v_game_id, 8, 8, 0, null, 66),
    (v_game_id, 9, 2, 8, null, 86),
    (v_game_id, 10, 10, 10, 3, 109);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 182, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 17),
    (v_game_id, 2, 7, 3, null, 30),
    (v_game_id, 3, 3, 5, null, 38),
    (v_game_id, 4, 1, 7, null, 46),
    (v_game_id, 5, 0, 10, null, 62),
    (v_game_id, 6, 6, 4, null, 82),
    (v_game_id, 7, 10, null, null, 102),
    (v_game_id, 8, 6, 4, null, 122),
    (v_game_id, 9, 10, null, null, 152),
    (v_game_id, 10, 10, 10, 10, 182);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 167, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 1, null, 9),
    (v_game_id, 2, 10, null, null, 29),
    (v_game_id, 3, 9, 1, null, 49),
    (v_game_id, 4, 10, null, null, 69),
    (v_game_id, 5, 10, null, null, 89),
    (v_game_id, 6, 0, 10, null, 104),
    (v_game_id, 7, 5, 0, null, 109),
    (v_game_id, 8, 10, null, null, 129),
    (v_game_id, 9, 2, 8, null, 149),
    (v_game_id, 10, 10, 8, 0, 167);

  -- Diana Lazaro
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Diana Lazaro', 'right', 187, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 8)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 156, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 2, null, 14),
    (v_game_id, 2, 4, 5, null, 23),
    (v_game_id, 3, 0, 7, null, 30),
    (v_game_id, 4, 6, 0, null, 36),
    (v_game_id, 5, 10, null, null, 56),
    (v_game_id, 6, 2, 8, null, 76),
    (v_game_id, 7, 10, null, null, 96),
    (v_game_id, 8, 10, null, null, 116),
    (v_game_id, 9, 0, 10, null, 136),
    (v_game_id, 10, 10, 8, 2, 156);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 137, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 20),
    (v_game_id, 2, 10, null, null, 39),
    (v_game_id, 3, 8, 1, null, 48),
    (v_game_id, 4, 0, 10, null, 68),
    (v_game_id, 5, 10, null, null, 84),
    (v_game_id, 6, 5, 1, null, 90),
    (v_game_id, 7, 2, 0, null, 92),
    (v_game_id, 8, 10, null, null, 110),
    (v_game_id, 9, 7, 1, null, 118),
    (v_game_id, 10, 10, 9, 0, 137);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 153, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 12),
    (v_game_id, 2, 2, 8, null, 32),
    (v_game_id, 3, 10, null, null, 60),
    (v_game_id, 4, 10, null, null, 80),
    (v_game_id, 5, 8, 2, null, 96),
    (v_game_id, 6, 6, 1, null, 103),
    (v_game_id, 7, 2, 5, null, 110),
    (v_game_id, 8, 1, 9, null, 129),
    (v_game_id, 9, 9, 1, null, 139),
    (v_game_id, 10, 0, 10, 4, 153);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 2, null, 9),
    (v_game_id, 2, 3, 7, null, 26),
    (v_game_id, 3, 7, 1, null, 34),
    (v_game_id, 4, 10, null, null, 63),
    (v_game_id, 5, 10, null, null, 83),
    (v_game_id, 6, 9, 1, null, 95),
    (v_game_id, 7, 2, 5, null, 102),
    (v_game_id, 8, 5, 2, null, 109),
    (v_game_id, 9, 6, 4, null, 127),
    (v_game_id, 10, 8, 2, 10, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 154, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 17),
    (v_game_id, 2, 5, 2, null, 24),
    (v_game_id, 3, 9, 1, null, 43),
    (v_game_id, 4, 9, 1, null, 61),
    (v_game_id, 5, 8, 0, null, 69),
    (v_game_id, 6, 7, 1, null, 77),
    (v_game_id, 7, 5, 5, null, 97),
    (v_game_id, 8, 10, null, null, 117),
    (v_game_id, 9, 1, 9, null, 134),
    (v_game_id, 10, 7, 3, 10, 154);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 133, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 0, null, 6),
    (v_game_id, 2, 7, 0, null, 13),
    (v_game_id, 3, 0, 6, null, 19),
    (v_game_id, 4, 10, null, null, 39),
    (v_game_id, 5, 1, 9, null, 59),
    (v_game_id, 6, 10, null, null, 75),
    (v_game_id, 7, 3, 3, null, 81),
    (v_game_id, 8, 2, 8, null, 100),
    (v_game_id, 9, 9, 1, null, 113),
    (v_game_id, 10, 3, 7, 10, 133);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 180, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 1, null, 8),
    (v_game_id, 2, 10, null, null, 35),
    (v_game_id, 3, 10, null, null, 55),
    (v_game_id, 4, 7, 3, null, 69),
    (v_game_id, 5, 4, 6, null, 83),
    (v_game_id, 6, 4, 6, null, 103),
    (v_game_id, 7, 10, null, null, 123),
    (v_game_id, 8, 4, 6, null, 134),
    (v_game_id, 9, 1, 9, null, 154),
    (v_game_id, 10, 10, 10, 6, 180);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 174, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 2, null, 7),
    (v_game_id, 2, 1, 9, null, 27),
    (v_game_id, 3, 10, null, null, 57),
    (v_game_id, 4, 10, null, null, 78),
    (v_game_id, 5, 10, null, null, 98),
    (v_game_id, 6, 1, 9, null, 114),
    (v_game_id, 7, 6, 2, null, 122),
    (v_game_id, 8, 7, 3, null, 135),
    (v_game_id, 9, 3, 6, null, 144),
    (v_game_id, 10, 10, 10, 10, 174);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 241, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 52),
    (v_game_id, 3, 10, null, null, 72),
    (v_game_id, 4, 2, 8, null, 92),
    (v_game_id, 5, 10, null, null, 122),
    (v_game_id, 6, 10, null, null, 152),
    (v_game_id, 7, 10, null, null, 182),
    (v_game_id, 8, 10, null, null, 202),
    (v_game_id, 9, 10, null, null, 222),
    (v_game_id, 10, 0, 10, 9, 241);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 130, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 8, 1, null, 28),
    (v_game_id, 3, 8, 1, null, 37),
    (v_game_id, 4, 2, 6, null, 45),
    (v_game_id, 5, 0, 10, null, 65),
    (v_game_id, 6, 10, null, null, 84),
    (v_game_id, 7, 9, 0, null, 93),
    (v_game_id, 8, 2, 8, null, 103),
    (v_game_id, 9, 0, 10, null, 118),
    (v_game_id, 10, 5, 5, 2, 130);

  -- Hector Diwa
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Hector Diwa', 'right', 194, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 113, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 2, null, 5),
    (v_game_id, 2, 10, null, null, 29),
    (v_game_id, 3, 10, null, null, 49),
    (v_game_id, 4, 4, 6, null, 60),
    (v_game_id, 5, 1, 9, null, 72),
    (v_game_id, 6, 2, 4, null, 78),
    (v_game_id, 7, 10, null, null, 91),
    (v_game_id, 8, 3, 0, null, 94),
    (v_game_id, 9, 9, 1, null, 105),
    (v_game_id, 10, 1, 7, null, 113);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 178, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 51),
    (v_game_id, 3, 10, null, null, 71),
    (v_game_id, 4, 1, 9, null, 87),
    (v_game_id, 5, 6, 4, null, 106),
    (v_game_id, 6, 9, 1, null, 117),
    (v_game_id, 7, 1, 9, null, 130),
    (v_game_id, 8, 3, 7, null, 150),
    (v_game_id, 9, 10, null, null, 169),
    (v_game_id, 10, 7, 2, null, 178);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 138, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 1, null, 4),
    (v_game_id, 2, 0, 10, null, 24),
    (v_game_id, 3, 10, null, null, 37),
    (v_game_id, 4, 2, 1, null, 40),
    (v_game_id, 5, 6, 0, null, 46),
    (v_game_id, 6, 6, 4, null, 66),
    (v_game_id, 7, 10, null, null, 93),
    (v_game_id, 8, 10, null, null, 113),
    (v_game_id, 9, 7, 3, null, 126),
    (v_game_id, 10, 3, 7, 2, 138);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 121, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 16),
    (v_game_id, 2, 6, 0, null, 22),
    (v_game_id, 3, 10, null, null, 42),
    (v_game_id, 4, 9, 1, null, 52),
    (v_game_id, 5, 0, 10, null, 72),
    (v_game_id, 6, 10, null, null, 91),
    (v_game_id, 7, 8, 1, null, 100),
    (v_game_id, 8, 10, null, null, 111),
    (v_game_id, 9, 1, 0, null, 112),
    (v_game_id, 10, 3, 6, null, 121);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 143, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 2, null, 20),
    (v_game_id, 2, 10, null, null, 44),
    (v_game_id, 3, 10, null, null, 61),
    (v_game_id, 4, 4, 3, null, 68),
    (v_game_id, 5, 3, 4, null, 75),
    (v_game_id, 6, 7, 0, null, 82),
    (v_game_id, 7, 7, 3, null, 98),
    (v_game_id, 8, 6, 0, null, 104),
    (v_game_id, 9, 8, 2, null, 124),
    (v_game_id, 10, 10, 9, 0, 143);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 124, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 15),
    (v_game_id, 2, 5, 5, null, 35),
    (v_game_id, 3, 10, null, null, 61),
    (v_game_id, 4, 10, null, null, 77),
    (v_game_id, 5, 6, 0, null, 83),
    (v_game_id, 6, 1, 0, null, 84),
    (v_game_id, 7, 0, 1, null, 85),
    (v_game_id, 8, 10, null, null, 102),
    (v_game_id, 9, 7, 0, null, 109),
    (v_game_id, 10, 10, 5, 0, 124);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 138, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 14),
    (v_game_id, 2, 3, 1, null, 18),
    (v_game_id, 3, 5, 4, null, 27),
    (v_game_id, 4, 8, 2, null, 44),
    (v_game_id, 5, 7, 2, null, 53),
    (v_game_id, 6, 10, null, null, 79),
    (v_game_id, 7, 10, null, null, 99),
    (v_game_id, 8, 6, 4, null, 111),
    (v_game_id, 9, 2, 5, null, 118),
    (v_game_id, 10, 6, 4, 10, 138);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 145, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 7, null, 9),
    (v_game_id, 2, 4, 1, null, 14),
    (v_game_id, 3, 10, null, null, 34),
    (v_game_id, 4, 0, 10, null, 52),
    (v_game_id, 5, 8, 2, null, 71),
    (v_game_id, 6, 9, 0, null, 80),
    (v_game_id, 7, 10, null, null, 105),
    (v_game_id, 8, 10, null, null, 120),
    (v_game_id, 9, 5, 0, null, 125),
    (v_game_id, 10, 1, 9, 10, 145);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 160, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 6, 4, null, 59),
    (v_game_id, 4, 9, 1, null, 79),
    (v_game_id, 5, 10, null, null, 98),
    (v_game_id, 6, 7, 2, null, 107),
    (v_game_id, 7, 7, 1, null, 115),
    (v_game_id, 8, 10, null, null, 133),
    (v_game_id, 9, 5, 3, null, 141),
    (v_game_id, 10, 9, 1, 9, 160);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 160, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 10),
    (v_game_id, 2, 0, 10, null, 30),
    (v_game_id, 3, 10, null, null, 50),
    (v_game_id, 4, 0, 10, null, 63),
    (v_game_id, 5, 3, 7, null, 82),
    (v_game_id, 6, 9, 1, null, 102),
    (v_game_id, 7, 10, null, null, 116),
    (v_game_id, 8, 0, 4, null, 120),
    (v_game_id, 9, 10, null, null, 140),
    (v_game_id, 10, 0, 10, 10, 160);

  -- Ivan Martinez
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Ivan Martinez', 'right', 172, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 144, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 2, null, 18),
    (v_game_id, 2, 8, 1, null, 27),
    (v_game_id, 3, 2, 7, null, 36),
    (v_game_id, 4, 5, 5, null, 46),
    (v_game_id, 5, 0, 10, null, 66),
    (v_game_id, 6, 10, null, null, 86),
    (v_game_id, 7, 1, 9, null, 99),
    (v_game_id, 8, 3, 5, null, 107),
    (v_game_id, 9, 9, 1, null, 127),
    (v_game_id, 10, 10, 4, 3, 144);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 133, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 6, null, 6),
    (v_game_id, 2, 0, 4, null, 10),
    (v_game_id, 3, 8, 2, null, 20),
    (v_game_id, 4, 0, 3, null, 23),
    (v_game_id, 5, 10, null, null, 49),
    (v_game_id, 6, 10, null, null, 68),
    (v_game_id, 7, 6, 3, null, 77),
    (v_game_id, 8, 10, null, null, 95),
    (v_game_id, 9, 0, 8, null, 103),
    (v_game_id, 10, 10, 10, 10, 133);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 176, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 22),
    (v_game_id, 2, 10, null, null, 42),
    (v_game_id, 3, 2, 8, null, 60),
    (v_game_id, 4, 8, 2, null, 79),
    (v_game_id, 5, 9, 0, null, 88),
    (v_game_id, 6, 5, 5, null, 108),
    (v_game_id, 7, 10, null, null, 135),
    (v_game_id, 8, 10, null, null, 155),
    (v_game_id, 9, 7, 3, null, 170),
    (v_game_id, 10, 5, 1, null, 176);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 171, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 22),
    (v_game_id, 2, 10, null, null, 42),
    (v_game_id, 3, 2, 8, null, 62),
    (v_game_id, 4, 10, null, null, 80),
    (v_game_id, 5, 4, 4, null, 88),
    (v_game_id, 6, 10, null, null, 117),
    (v_game_id, 7, 10, null, null, 136),
    (v_game_id, 8, 9, 0, null, 145),
    (v_game_id, 9, 1, 9, null, 163),
    (v_game_id, 10, 8, 0, null, 171);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 148, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 1, null, 9),
    (v_game_id, 2, 10, null, null, 39),
    (v_game_id, 3, 10, null, null, 60),
    (v_game_id, 4, 10, null, null, 72),
    (v_game_id, 5, 1, 1, null, 74),
    (v_game_id, 6, 8, 0, null, 82),
    (v_game_id, 7, 9, 1, null, 101),
    (v_game_id, 8, 9, 1, null, 120),
    (v_game_id, 9, 9, 1, null, 139),
    (v_game_id, 10, 9, 0, null, 148);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 141, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 6, 2, null, 26),
    (v_game_id, 3, 6, 4, null, 43),
    (v_game_id, 4, 7, 3, null, 57),
    (v_game_id, 5, 4, 6, null, 76),
    (v_game_id, 6, 9, 1, null, 87),
    (v_game_id, 7, 1, 9, null, 105),
    (v_game_id, 8, 8, 2, null, 118),
    (v_game_id, 9, 3, 7, null, 129),
    (v_game_id, 10, 1, 9, 2, 141);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 146, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 2, null, 3),
    (v_game_id, 2, 5, 5, null, 20),
    (v_game_id, 3, 7, 3, null, 40),
    (v_game_id, 4, 10, null, null, 70),
    (v_game_id, 5, 10, null, null, 92),
    (v_game_id, 6, 10, null, null, 112),
    (v_game_id, 7, 2, 8, null, 125),
    (v_game_id, 8, 3, 3, null, 131),
    (v_game_id, 9, 9, 1, null, 141),
    (v_game_id, 10, 0, 5, null, 146);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 114, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 0, null, 5),
    (v_game_id, 2, 0, 3, null, 8),
    (v_game_id, 3, 6, 2, null, 16),
    (v_game_id, 4, 10, null, null, 28),
    (v_game_id, 5, 2, 0, null, 30),
    (v_game_id, 6, 10, null, null, 47),
    (v_game_id, 7, 6, 1, null, 54),
    (v_game_id, 8, 9, 1, null, 74),
    (v_game_id, 9, 10, null, null, 94),
    (v_game_id, 10, 5, 5, 10, 114);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 159, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 7, 3, null, 40),
    (v_game_id, 3, 10, null, null, 60),
    (v_game_id, 4, 1, 9, null, 79),
    (v_game_id, 5, 9, 1, null, 96),
    (v_game_id, 6, 7, 0, null, 103),
    (v_game_id, 7, 8, 0, null, 111),
    (v_game_id, 8, 10, null, null, 130),
    (v_game_id, 9, 9, 0, null, 139),
    (v_game_id, 10, 10, 6, 4, 159);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 154, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 28),
    (v_game_id, 2, 10, null, null, 48),
    (v_game_id, 3, 8, 2, null, 59),
    (v_game_id, 4, 1, 0, null, 60),
    (v_game_id, 5, 8, 2, null, 75),
    (v_game_id, 6, 5, 5, null, 90),
    (v_game_id, 7, 5, 5, null, 110),
    (v_game_id, 8, 10, null, null, 130),
    (v_game_id, 9, 0, 10, null, 143),
    (v_game_id, 10, 3, 7, 1, 154);

  -- Jared Rivera
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Jared Rivera', 'right', 202, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 144, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 19),
    (v_game_id, 2, 9, 1, null, 36),
    (v_game_id, 3, 7, 3, null, 56),
    (v_game_id, 4, 10, null, null, 73),
    (v_game_id, 5, 3, 4, null, 80),
    (v_game_id, 6, 4, 4, null, 88),
    (v_game_id, 7, 3, 1, null, 92),
    (v_game_id, 8, 2, 7, null, 101),
    (v_game_id, 9, 10, null, null, 127),
    (v_game_id, 10, 10, 6, 1, 144);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 110, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 15),
    (v_game_id, 2, 5, 2, null, 22),
    (v_game_id, 3, 5, 0, null, 27),
    (v_game_id, 4, 0, 7, null, 34),
    (v_game_id, 5, 7, 2, null, 43),
    (v_game_id, 6, 10, null, null, 59),
    (v_game_id, 7, 1, 5, null, 65),
    (v_game_id, 8, 3, 7, null, 75),
    (v_game_id, 9, 0, 5, null, 80),
    (v_game_id, 10, 10, 10, 10, 110);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 153, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 3, null, 3),
    (v_game_id, 2, 7, 3, null, 22),
    (v_game_id, 3, 9, 0, null, 31),
    (v_game_id, 4, 10, null, null, 51),
    (v_game_id, 5, 1, 9, null, 71),
    (v_game_id, 6, 10, null, null, 90),
    (v_game_id, 7, 9, 0, null, 99),
    (v_game_id, 8, 7, 3, null, 114),
    (v_game_id, 9, 5, 5, null, 134),
    (v_game_id, 10, 10, 4, 5, 153);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 140, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 27),
    (v_game_id, 2, 10, null, null, 44),
    (v_game_id, 3, 7, 0, null, 51),
    (v_game_id, 4, 3, 4, null, 58),
    (v_game_id, 5, 4, 6, null, 78),
    (v_game_id, 6, 10, null, null, 98),
    (v_game_id, 7, 7, 3, null, 113),
    (v_game_id, 8, 5, 2, null, 120),
    (v_game_id, 9, 1, 9, null, 135),
    (v_game_id, 10, 5, 0, null, 140);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 133, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 13),
    (v_game_id, 2, 3, 0, null, 16),
    (v_game_id, 3, 4, 2, null, 22),
    (v_game_id, 4, 1, 0, null, 23),
    (v_game_id, 5, 5, 5, null, 43),
    (v_game_id, 6, 10, null, null, 63),
    (v_game_id, 7, 5, 5, null, 83),
    (v_game_id, 8, 10, null, null, 105),
    (v_game_id, 9, 10, null, null, 124),
    (v_game_id, 10, 2, 7, null, 133);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 188, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 2, null, 20),
    (v_game_id, 2, 10, null, null, 33),
    (v_game_id, 3, 2, 1, null, 36),
    (v_game_id, 4, 10, null, null, 56),
    (v_game_id, 5, 4, 6, null, 76),
    (v_game_id, 6, 10, null, null, 103),
    (v_game_id, 7, 10, null, null, 123),
    (v_game_id, 8, 7, 3, null, 138),
    (v_game_id, 9, 5, 5, null, 158),
    (v_game_id, 10, 10, 10, 10, 188);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 135, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 5, null, 8),
    (v_game_id, 2, 10, null, null, 28),
    (v_game_id, 3, 9, 1, null, 45),
    (v_game_id, 4, 7, 3, null, 63),
    (v_game_id, 5, 8, 0, null, 71),
    (v_game_id, 6, 10, null, null, 97),
    (v_game_id, 7, 10, null, null, 114),
    (v_game_id, 8, 6, 1, null, 121),
    (v_game_id, 9, 1, 7, null, 129),
    (v_game_id, 10, 0, 6, null, 135);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 155, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 10, null, null, 25),
    (v_game_id, 3, 6, 0, null, 31),
    (v_game_id, 4, 10, null, null, 61),
    (v_game_id, 5, 10, null, null, 87),
    (v_game_id, 6, 10, null, null, 105),
    (v_game_id, 7, 6, 2, null, 113),
    (v_game_id, 8, 5, 5, null, 123),
    (v_game_id, 9, 0, 10, null, 140),
    (v_game_id, 10, 7, 3, 5, 155);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 144, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 16),
    (v_game_id, 2, 6, 4, null, 36),
    (v_game_id, 3, 10, null, null, 56),
    (v_game_id, 4, 7, 3, null, 71),
    (v_game_id, 5, 5, 5, null, 87),
    (v_game_id, 6, 6, 2, null, 95),
    (v_game_id, 7, 8, 2, null, 109),
    (v_game_id, 8, 4, 5, null, 118),
    (v_game_id, 9, 2, 4, null, 124),
    (v_game_id, 10, 9, 1, 10, 144);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 144, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 3, null, 8),
    (v_game_id, 2, 5, 5, null, 18),
    (v_game_id, 3, 0, 10, null, 29),
    (v_game_id, 4, 1, 9, null, 49),
    (v_game_id, 5, 10, null, null, 69),
    (v_game_id, 6, 1, 9, null, 89),
    (v_game_id, 7, 10, null, null, 109),
    (v_game_id, 8, 10, null, null, 127),
    (v_game_id, 9, 0, 8, null, 135),
    (v_game_id, 10, 8, 1, null, 144);

  -- Karl Santos
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Karl Santos', 'right', 208, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 128, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 5, null, 6),
    (v_game_id, 2, 2, 7, null, 15),
    (v_game_id, 3, 10, null, null, 35),
    (v_game_id, 4, 9, 1, null, 46),
    (v_game_id, 5, 1, 9, null, 62),
    (v_game_id, 6, 6, 4, null, 82),
    (v_game_id, 7, 10, null, null, 100),
    (v_game_id, 8, 7, 1, null, 108),
    (v_game_id, 9, 4, 5, null, 117),
    (v_game_id, 10, 8, 2, 1, 128);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 163, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 9, 0, null, 28),
    (v_game_id, 3, 5, 4, null, 37),
    (v_game_id, 4, 10, null, null, 55),
    (v_game_id, 5, 8, 0, null, 63),
    (v_game_id, 6, 6, 4, null, 83),
    (v_game_id, 7, 10, null, null, 103),
    (v_game_id, 8, 9, 1, null, 123),
    (v_game_id, 9, 10, null, null, 143),
    (v_game_id, 10, 9, 1, 10, 163);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 134, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 5, null, 5),
    (v_game_id, 2, 9, 1, null, 20),
    (v_game_id, 3, 5, 1, null, 26),
    (v_game_id, 4, 8, 1, null, 35),
    (v_game_id, 5, 10, null, null, 52),
    (v_game_id, 6, 6, 1, null, 59),
    (v_game_id, 7, 9, 1, null, 72),
    (v_game_id, 8, 3, 5, null, 80),
    (v_game_id, 9, 10, null, null, 110),
    (v_game_id, 10, 10, 10, 4, 134);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 135, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 9, null, 11),
    (v_game_id, 2, 1, 7, null, 19),
    (v_game_id, 3, 10, null, null, 36),
    (v_game_id, 4, 5, 2, null, 43),
    (v_game_id, 5, 3, 7, null, 56),
    (v_game_id, 6, 3, 3, null, 62),
    (v_game_id, 7, 9, 1, null, 82),
    (v_game_id, 8, 10, null, null, 102),
    (v_game_id, 9, 6, 4, null, 115),
    (v_game_id, 10, 3, 7, 10, 135);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 131, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 1, null, 9),
    (v_game_id, 2, 9, 1, null, 29),
    (v_game_id, 3, 10, null, null, 49),
    (v_game_id, 4, 5, 5, null, 62),
    (v_game_id, 5, 3, 2, null, 67),
    (v_game_id, 6, 10, null, null, 82),
    (v_game_id, 7, 5, 0, null, 87),
    (v_game_id, 8, 9, 1, null, 107),
    (v_game_id, 9, 10, null, null, 124),
    (v_game_id, 10, 5, 2, null, 131);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 155, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 0, 10, null, 38),
    (v_game_id, 3, 8, 2, null, 58),
    (v_game_id, 4, 10, null, null, 76),
    (v_game_id, 5, 4, 4, null, 84),
    (v_game_id, 6, 10, null, null, 104),
    (v_game_id, 7, 5, 5, null, 118),
    (v_game_id, 8, 4, 6, null, 129),
    (v_game_id, 9, 1, 9, null, 146),
    (v_game_id, 10, 7, 2, null, 155);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 183, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 0, 10, null, 40),
    (v_game_id, 3, 10, null, null, 70),
    (v_game_id, 4, 10, null, null, 100),
    (v_game_id, 5, 10, null, null, 121),
    (v_game_id, 6, 10, null, null, 135),
    (v_game_id, 7, 1, 3, null, 139),
    (v_game_id, 8, 6, 2, null, 147),
    (v_game_id, 9, 10, null, null, 167),
    (v_game_id, 10, 8, 2, 6, 183);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 161, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 3, 7, null, 40),
    (v_game_id, 3, 10, null, null, 54),
    (v_game_id, 4, 1, 3, null, 58),
    (v_game_id, 5, 3, 7, null, 75),
    (v_game_id, 6, 7, 3, null, 95),
    (v_game_id, 7, 10, null, null, 115),
    (v_game_id, 8, 7, 3, null, 130),
    (v_game_id, 9, 5, 5, null, 141),
    (v_game_id, 10, 1, 9, 10, 161);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 109, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 16),
    (v_game_id, 2, 2, 4, null, 22),
    (v_game_id, 3, 7, 1, null, 30),
    (v_game_id, 4, 2, 8, null, 47),
    (v_game_id, 5, 7, 2, null, 56),
    (v_game_id, 6, 4, 0, null, 60),
    (v_game_id, 7, 2, 8, null, 79),
    (v_game_id, 8, 9, 1, null, 95),
    (v_game_id, 9, 6, 1, null, 102),
    (v_game_id, 10, 1, 6, null, 109);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 136, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 14),
    (v_game_id, 2, 4, 6, null, 26),
    (v_game_id, 3, 2, 8, null, 43),
    (v_game_id, 4, 7, 3, null, 63),
    (v_game_id, 5, 10, null, null, 82),
    (v_game_id, 6, 0, 9, null, 91),
    (v_game_id, 7, 2, 8, null, 107),
    (v_game_id, 8, 6, 1, null, 114),
    (v_game_id, 9, 2, 6, null, 122),
    (v_game_id, 10, 6, 4, 4, 136);

  -- Lance Acosta
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Lance Acosta', 'right', 180, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 88, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 1, null, 7),
    (v_game_id, 2, 6, 2, null, 15),
    (v_game_id, 3, 10, null, null, 31),
    (v_game_id, 4, 4, 2, null, 37),
    (v_game_id, 5, 4, 4, null, 45),
    (v_game_id, 6, 8, 0, null, 53),
    (v_game_id, 7, 3, 0, null, 56),
    (v_game_id, 8, 8, 1, null, 65),
    (v_game_id, 9, 3, 7, null, 80),
    (v_game_id, 10, 5, 3, null, 88);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 148, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 3, null, 9),
    (v_game_id, 2, 10, null, null, 31),
    (v_game_id, 3, 10, null, null, 46),
    (v_game_id, 4, 2, 3, null, 51),
    (v_game_id, 5, 0, 10, null, 65),
    (v_game_id, 6, 4, 6, null, 85),
    (v_game_id, 7, 10, null, null, 103),
    (v_game_id, 8, 4, 4, null, 111),
    (v_game_id, 9, 10, null, null, 131),
    (v_game_id, 10, 1, 9, 7, 148);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 159, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 20),
    (v_game_id, 2, 10, null, null, 36),
    (v_game_id, 3, 5, 1, null, 42),
    (v_game_id, 4, 10, null, null, 72),
    (v_game_id, 5, 10, null, null, 99),
    (v_game_id, 6, 10, null, null, 119),
    (v_game_id, 7, 7, 3, null, 137),
    (v_game_id, 8, 8, 1, null, 146),
    (v_game_id, 9, 3, 0, null, 149),
    (v_game_id, 10, 1, 9, 0, 159);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 151, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 20),
    (v_game_id, 2, 10, null, null, 42),
    (v_game_id, 3, 10, null, null, 60),
    (v_game_id, 4, 2, 6, null, 68),
    (v_game_id, 5, 8, 2, null, 88),
    (v_game_id, 6, 10, null, null, 108),
    (v_game_id, 7, 6, 4, null, 121),
    (v_game_id, 8, 3, 3, null, 127),
    (v_game_id, 9, 2, 3, null, 132),
    (v_game_id, 10, 10, 4, 5, 151);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 181, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 16),
    (v_game_id, 2, 6, 4, null, 36),
    (v_game_id, 3, 10, null, null, 66),
    (v_game_id, 4, 10, null, null, 93),
    (v_game_id, 5, 10, null, null, 110),
    (v_game_id, 6, 7, 0, null, 117),
    (v_game_id, 7, 10, null, null, 144),
    (v_game_id, 8, 10, null, null, 164),
    (v_game_id, 9, 7, 3, null, 174),
    (v_game_id, 10, 0, 7, null, 181);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 132, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 6, 2, null, 26),
    (v_game_id, 3, 10, null, null, 38),
    (v_game_id, 4, 2, 0, null, 40),
    (v_game_id, 5, 9, 1, null, 59),
    (v_game_id, 6, 9, 0, null, 68),
    (v_game_id, 7, 10, null, null, 88),
    (v_game_id, 8, 6, 4, null, 101),
    (v_game_id, 9, 3, 7, null, 113),
    (v_game_id, 10, 2, 8, 9, 132);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 165, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 8, 2, null, 32),
    (v_game_id, 3, 2, 3, null, 37),
    (v_game_id, 4, 5, 5, null, 51),
    (v_game_id, 5, 4, 6, null, 71),
    (v_game_id, 6, 10, null, null, 89),
    (v_game_id, 7, 0, 8, null, 97),
    (v_game_id, 8, 10, null, null, 125),
    (v_game_id, 9, 10, null, null, 145),
    (v_game_id, 10, 8, 2, 10, 165);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 122, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 4, null, 4),
    (v_game_id, 2, 10, null, null, 24),
    (v_game_id, 3, 8, 2, null, 44),
    (v_game_id, 4, 10, null, null, 64),
    (v_game_id, 5, 8, 2, null, 75),
    (v_game_id, 6, 1, 1, null, 77),
    (v_game_id, 7, 3, 7, null, 92),
    (v_game_id, 8, 5, 5, null, 102),
    (v_game_id, 9, 0, 2, null, 104),
    (v_game_id, 10, 8, 2, 8, 122);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 179, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 13),
    (v_game_id, 2, 3, 1, null, 17),
    (v_game_id, 3, 2, 8, null, 34),
    (v_game_id, 4, 7, 2, null, 43),
    (v_game_id, 5, 3, 7, null, 63),
    (v_game_id, 6, 10, null, null, 83),
    (v_game_id, 7, 4, 6, null, 103),
    (v_game_id, 8, 10, null, null, 133),
    (v_game_id, 9, 10, null, null, 161),
    (v_game_id, 10, 10, 8, 0, 179);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 132, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 9, 0, null, 18),
    (v_game_id, 3, 5, 0, null, 23),
    (v_game_id, 4, 8, 2, null, 33),
    (v_game_id, 5, 0, 10, null, 53),
    (v_game_id, 6, 10, null, null, 76),
    (v_game_id, 7, 10, null, null, 95),
    (v_game_id, 8, 3, 6, null, 104),
    (v_game_id, 9, 7, 1, null, 112),
    (v_game_id, 10, 7, 3, 10, 132);

  -- Miggy Chen
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Miggy Chen', 'right', 196, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 159, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 4, null, 5),
    (v_game_id, 2, 8, 0, null, 13),
    (v_game_id, 3, 2, 8, null, 33),
    (v_game_id, 4, 10, null, null, 63),
    (v_game_id, 5, 10, null, null, 93),
    (v_game_id, 6, 10, null, null, 115),
    (v_game_id, 7, 10, null, null, 135),
    (v_game_id, 8, 2, 8, null, 150),
    (v_game_id, 9, 5, 0, null, 155),
    (v_game_id, 10, 0, 4, null, 159);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 174, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 20),
    (v_game_id, 2, 10, null, null, 47),
    (v_game_id, 3, 10, null, null, 66),
    (v_game_id, 4, 7, 2, null, 75),
    (v_game_id, 5, 10, null, null, 95),
    (v_game_id, 6, 9, 1, null, 110),
    (v_game_id, 7, 5, 2, null, 117),
    (v_game_id, 8, 1, 9, null, 137),
    (v_game_id, 9, 10, null, null, 157),
    (v_game_id, 10, 7, 3, 7, 174);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 139, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 9, 1, null, 60),
    (v_game_id, 4, 10, null, null, 80),
    (v_game_id, 5, 0, 10, null, 90),
    (v_game_id, 6, 0, 3, null, 93),
    (v_game_id, 7, 7, 3, null, 103),
    (v_game_id, 8, 0, 5, null, 108),
    (v_game_id, 9, 4, 4, null, 116),
    (v_game_id, 10, 10, 10, 3, 139);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 166, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 6, null, 9),
    (v_game_id, 2, 10, null, null, 29),
    (v_game_id, 3, 6, 4, null, 48),
    (v_game_id, 4, 9, 0, null, 57),
    (v_game_id, 5, 1, 6, null, 64),
    (v_game_id, 6, 9, 1, null, 84),
    (v_game_id, 7, 10, null, null, 114),
    (v_game_id, 8, 10, null, null, 138),
    (v_game_id, 9, 10, null, null, 157),
    (v_game_id, 10, 4, 5, null, 166);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 143, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 7, 0, null, 16),
    (v_game_id, 3, 8, 2, null, 36),
    (v_game_id, 4, 10, null, null, 56),
    (v_game_id, 5, 3, 7, null, 76),
    (v_game_id, 6, 10, null, null, 101),
    (v_game_id, 7, 10, null, null, 120),
    (v_game_id, 8, 5, 4, null, 129),
    (v_game_id, 9, 10, null, null, 141),
    (v_game_id, 10, 0, 2, null, 143);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 140, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 4, null, 7),
    (v_game_id, 2, 3, 7, null, 20),
    (v_game_id, 3, 3, 7, null, 37),
    (v_game_id, 4, 7, 1, null, 45),
    (v_game_id, 5, 7, 3, null, 64),
    (v_game_id, 6, 9, 1, null, 84),
    (v_game_id, 7, 10, null, null, 97),
    (v_game_id, 8, 1, 2, null, 100),
    (v_game_id, 9, 10, null, null, 120),
    (v_game_id, 10, 4, 6, 10, 140);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 157, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 14),
    (v_game_id, 2, 4, 3, null, 21),
    (v_game_id, 3, 7, 0, null, 28),
    (v_game_id, 4, 8, 0, null, 36),
    (v_game_id, 5, 8, 2, null, 56),
    (v_game_id, 6, 10, null, null, 86),
    (v_game_id, 7, 10, null, null, 116),
    (v_game_id, 8, 10, null, null, 139),
    (v_game_id, 9, 10, null, null, 153),
    (v_game_id, 10, 3, 1, null, 157);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 119, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 2, null, 4),
    (v_game_id, 2, 7, 2, null, 13),
    (v_game_id, 3, 7, 3, null, 30),
    (v_game_id, 4, 7, 3, null, 42),
    (v_game_id, 5, 2, 2, null, 46),
    (v_game_id, 6, 4, 6, null, 65),
    (v_game_id, 7, 9, 1, null, 79),
    (v_game_id, 8, 4, 6, null, 90),
    (v_game_id, 9, 1, 9, null, 108),
    (v_game_id, 10, 8, 2, 1, 119);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 135, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 29),
    (v_game_id, 2, 10, null, null, 49),
    (v_game_id, 3, 9, 1, null, 59),
    (v_game_id, 4, 0, 2, null, 61),
    (v_game_id, 5, 10, null, null, 79),
    (v_game_id, 6, 8, 0, null, 87),
    (v_game_id, 7, 2, 0, null, 89),
    (v_game_id, 8, 7, 2, null, 98),
    (v_game_id, 9, 10, null, null, 118),
    (v_game_id, 10, 2, 8, 7, 135);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 175, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 2, null, 19),
    (v_game_id, 2, 9, 1, null, 38),
    (v_game_id, 3, 9, 1, null, 55),
    (v_game_id, 4, 7, 3, null, 66),
    (v_game_id, 5, 1, 9, null, 86),
    (v_game_id, 6, 10, null, null, 106),
    (v_game_id, 7, 8, 2, null, 126),
    (v_game_id, 8, 10, null, null, 151),
    (v_game_id, 9, 10, null, null, 168),
    (v_game_id, 10, 5, 2, null, 175);

  -- Nico Villa
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Nico Villa', 'right', 201, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 142, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 18),
    (v_game_id, 2, 8, 2, null, 38),
    (v_game_id, 3, 10, null, null, 58),
    (v_game_id, 4, 2, 8, null, 71),
    (v_game_id, 5, 3, 3, null, 77),
    (v_game_id, 6, 10, null, null, 97),
    (v_game_id, 7, 10, null, null, 115),
    (v_game_id, 8, 0, 8, null, 123),
    (v_game_id, 9, 2, 8, null, 135),
    (v_game_id, 10, 2, 5, null, 142);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 126, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 2, null, 5),
    (v_game_id, 2, 1, 9, null, 22),
    (v_game_id, 3, 7, 3, null, 40),
    (v_game_id, 4, 8, 2, null, 50),
    (v_game_id, 5, 0, 7, null, 57),
    (v_game_id, 6, 0, 10, null, 77),
    (v_game_id, 7, 10, null, null, 95),
    (v_game_id, 8, 2, 6, null, 103),
    (v_game_id, 9, 9, 0, null, 112),
    (v_game_id, 10, 0, 10, 4, 126);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 145, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 19),
    (v_game_id, 2, 9, 0, null, 28),
    (v_game_id, 3, 1, 7, null, 36),
    (v_game_id, 4, 4, 3, null, 43),
    (v_game_id, 5, 8, 2, null, 60),
    (v_game_id, 6, 7, 3, null, 74),
    (v_game_id, 7, 4, 3, null, 81),
    (v_game_id, 8, 5, 5, null, 95),
    (v_game_id, 9, 4, 6, null, 115),
    (v_game_id, 10, 10, 10, 10, 145);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 101, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 15),
    (v_game_id, 2, 5, 0, null, 20),
    (v_game_id, 3, 8, 2, null, 31),
    (v_game_id, 4, 1, 6, null, 38),
    (v_game_id, 5, 0, 1, null, 39),
    (v_game_id, 6, 10, null, null, 63),
    (v_game_id, 7, 10, null, null, 79),
    (v_game_id, 8, 4, 2, null, 85),
    (v_game_id, 9, 10, null, null, 98),
    (v_game_id, 10, 0, 3, null, 101);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 158, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 10, null, null, 25),
    (v_game_id, 3, 1, 5, null, 31),
    (v_game_id, 4, 9, 1, null, 41),
    (v_game_id, 5, 0, 10, null, 58),
    (v_game_id, 6, 7, 3, null, 78),
    (v_game_id, 7, 10, null, null, 98),
    (v_game_id, 8, 6, 4, null, 118),
    (v_game_id, 9, 10, null, null, 138),
    (v_game_id, 10, 5, 5, 10, 158);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 140, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 1, null, 3),
    (v_game_id, 2, 0, 10, null, 23),
    (v_game_id, 3, 10, null, null, 43),
    (v_game_id, 4, 2, 8, null, 61),
    (v_game_id, 5, 8, 0, null, 69),
    (v_game_id, 6, 10, null, null, 89),
    (v_game_id, 7, 9, 1, null, 105),
    (v_game_id, 8, 6, 0, null, 111),
    (v_game_id, 9, 1, 8, null, 120),
    (v_game_id, 10, 0, 10, 10, 140);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 143, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 13),
    (v_game_id, 2, 3, 2, null, 18),
    (v_game_id, 3, 4, 6, null, 38),
    (v_game_id, 4, 10, null, null, 57),
    (v_game_id, 5, 9, 0, null, 66),
    (v_game_id, 6, 8, 1, null, 75),
    (v_game_id, 7, 10, null, null, 104),
    (v_game_id, 8, 10, null, null, 123),
    (v_game_id, 9, 9, 0, null, 132),
    (v_game_id, 10, 10, 0, 1, 143);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 135, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 5, null, 8),
    (v_game_id, 2, 4, 6, null, 19),
    (v_game_id, 3, 1, 8, null, 28),
    (v_game_id, 4, 10, null, null, 58),
    (v_game_id, 5, 10, null, null, 82),
    (v_game_id, 6, 10, null, null, 96),
    (v_game_id, 7, 4, 0, null, 100),
    (v_game_id, 8, 7, 3, null, 112),
    (v_game_id, 9, 2, 3, null, 117),
    (v_game_id, 10, 10, 4, 4, 135);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 142, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 26),
    (v_game_id, 2, 10, null, null, 42),
    (v_game_id, 3, 6, 0, null, 48),
    (v_game_id, 4, 10, null, null, 68),
    (v_game_id, 5, 8, 2, null, 80),
    (v_game_id, 6, 2, 8, null, 94),
    (v_game_id, 7, 4, 3, null, 101),
    (v_game_id, 8, 0, 10, null, 116),
    (v_game_id, 9, 5, 1, null, 122),
    (v_game_id, 10, 8, 2, 10, 142);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 156, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 1, null, 6),
    (v_game_id, 2, 7, 3, null, 26),
    (v_game_id, 3, 10, null, null, 51),
    (v_game_id, 4, 10, null, null, 71),
    (v_game_id, 5, 5, 5, null, 88),
    (v_game_id, 6, 7, 0, null, 95),
    (v_game_id, 7, 0, 1, null, 96),
    (v_game_id, 8, 10, null, null, 116),
    (v_game_id, 9, 2, 8, null, 136),
    (v_game_id, 10, 10, 6, 4, 156);

  -- Oscar Domingo
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Oscar Domingo', 'right', 201, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 0, 10, null, 40),
    (v_game_id, 3, 10, null, null, 58),
    (v_game_id, 4, 1, 7, null, 66),
    (v_game_id, 5, 0, 2, null, 68),
    (v_game_id, 6, 8, 2, null, 84),
    (v_game_id, 7, 6, 2, null, 92),
    (v_game_id, 8, 10, null, null, 116),
    (v_game_id, 9, 10, null, null, 136),
    (v_game_id, 10, 4, 6, 1, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 115, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 3, null, 3),
    (v_game_id, 2, 0, 9, null, 12),
    (v_game_id, 3, 4, 0, null, 16),
    (v_game_id, 4, 0, 6, null, 22),
    (v_game_id, 5, 8, 2, null, 34),
    (v_game_id, 6, 2, 8, null, 48),
    (v_game_id, 7, 4, 6, null, 63),
    (v_game_id, 8, 5, 3, null, 71),
    (v_game_id, 9, 10, null, null, 96),
    (v_game_id, 10, 10, 5, 4, 115);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 113, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 0, null, 2),
    (v_game_id, 2, 7, 1, null, 10),
    (v_game_id, 3, 0, 8, null, 18),
    (v_game_id, 4, 10, null, null, 40),
    (v_game_id, 5, 10, null, null, 53),
    (v_game_id, 6, 2, 1, null, 56),
    (v_game_id, 7, 5, 4, null, 65),
    (v_game_id, 8, 10, null, null, 84),
    (v_game_id, 9, 6, 3, null, 93),
    (v_game_id, 10, 1, 9, 10, 113);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 118, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 2, null, 7),
    (v_game_id, 2, 0, 5, null, 12),
    (v_game_id, 3, 0, 10, null, 28),
    (v_game_id, 4, 6, 4, null, 43),
    (v_game_id, 5, 5, 5, null, 59),
    (v_game_id, 6, 6, 4, null, 77),
    (v_game_id, 7, 8, 2, null, 90),
    (v_game_id, 8, 3, 4, null, 97),
    (v_game_id, 9, 5, 5, null, 112),
    (v_game_id, 10, 5, 1, null, 118);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 184, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 1, null, 4),
    (v_game_id, 2, 3, 2, null, 9),
    (v_game_id, 3, 0, 10, null, 29),
    (v_game_id, 4, 10, null, null, 49),
    (v_game_id, 5, 6, 4, null, 69),
    (v_game_id, 6, 10, null, null, 98),
    (v_game_id, 7, 10, null, null, 118),
    (v_game_id, 8, 9, 1, null, 138),
    (v_game_id, 9, 10, null, null, 164),
    (v_game_id, 10, 10, 6, 4, 184);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 211, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 1, null, 6),
    (v_game_id, 2, 10, null, null, 36),
    (v_game_id, 3, 10, null, null, 66),
    (v_game_id, 4, 10, null, null, 96),
    (v_game_id, 5, 10, null, null, 126),
    (v_game_id, 6, 10, null, null, 156),
    (v_game_id, 7, 10, null, null, 176),
    (v_game_id, 8, 10, null, null, 196),
    (v_game_id, 9, 0, 10, null, 207),
    (v_game_id, 10, 1, 3, null, 211);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 102, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 0, null, 2),
    (v_game_id, 2, 10, null, null, 21),
    (v_game_id, 3, 9, 0, null, 30),
    (v_game_id, 4, 1, 0, null, 31),
    (v_game_id, 5, 6, 4, null, 43),
    (v_game_id, 6, 2, 3, null, 48),
    (v_game_id, 7, 10, null, null, 68),
    (v_game_id, 8, 9, 1, null, 82),
    (v_game_id, 9, 4, 0, null, 86),
    (v_game_id, 10, 9, 1, 6, 102);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 124, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 11),
    (v_game_id, 2, 0, 1, null, 12),
    (v_game_id, 3, 10, null, null, 32),
    (v_game_id, 4, 9, 1, null, 52),
    (v_game_id, 5, 10, null, null, 68),
    (v_game_id, 6, 0, 6, null, 74),
    (v_game_id, 7, 1, 9, null, 91),
    (v_game_id, 8, 7, 3, null, 109),
    (v_game_id, 9, 8, 0, null, 117),
    (v_game_id, 10, 4, 3, null, 124);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 84, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 10),
    (v_game_id, 2, 0, 10, null, 21),
    (v_game_id, 3, 1, 0, null, 22),
    (v_game_id, 4, 7, 3, null, 39),
    (v_game_id, 5, 7, 1, null, 47),
    (v_game_id, 6, 2, 0, null, 49),
    (v_game_id, 7, 8, 0, null, 57),
    (v_game_id, 8, 2, 3, null, 62),
    (v_game_id, 9, 5, 3, null, 70),
    (v_game_id, 10, 10, 0, 4, 84);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 101, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 16),
    (v_game_id, 2, 6, 2, null, 24),
    (v_game_id, 3, 9, 1, null, 35),
    (v_game_id, 4, 1, 9, null, 52),
    (v_game_id, 5, 7, 2, null, 61),
    (v_game_id, 6, 4, 0, null, 65),
    (v_game_id, 7, 3, 1, null, 69),
    (v_game_id, 8, 7, 1, null, 77),
    (v_game_id, 9, 8, 0, null, 85),
    (v_game_id, 10, 8, 2, 6, 101);

  -- Patrick Dolor
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Patrick Dolor', 'right', 188, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 159, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 20),
    (v_game_id, 2, 10, null, null, 50),
    (v_game_id, 3, 10, null, null, 70),
    (v_game_id, 4, 10, null, null, 90),
    (v_game_id, 5, 0, 10, null, 100),
    (v_game_id, 6, 0, 4, null, 104),
    (v_game_id, 7, 10, null, null, 126),
    (v_game_id, 8, 10, null, null, 144),
    (v_game_id, 9, 2, 6, null, 152),
    (v_game_id, 10, 3, 4, null, 159);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 4, 6, null, 39),
    (v_game_id, 3, 9, 0, null, 48),
    (v_game_id, 4, 1, 8, null, 57),
    (v_game_id, 5, 4, 0, null, 61),
    (v_game_id, 6, 4, 6, null, 81),
    (v_game_id, 7, 10, null, null, 99),
    (v_game_id, 8, 2, 6, null, 107),
    (v_game_id, 9, 10, null, null, 127),
    (v_game_id, 10, 8, 2, 10, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 136, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 1, null, 2),
    (v_game_id, 2, 10, null, null, 22),
    (v_game_id, 3, 4, 6, null, 39),
    (v_game_id, 4, 7, 3, null, 58),
    (v_game_id, 5, 9, 1, null, 73),
    (v_game_id, 6, 5, 3, null, 81),
    (v_game_id, 7, 10, null, null, 101),
    (v_game_id, 8, 5, 5, null, 114),
    (v_game_id, 9, 3, 1, null, 118),
    (v_game_id, 10, 5, 5, 8, 136);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 179, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 11),
    (v_game_id, 2, 1, 9, null, 31),
    (v_game_id, 3, 10, null, null, 61),
    (v_game_id, 4, 10, null, null, 91),
    (v_game_id, 5, 10, null, null, 112),
    (v_game_id, 6, 10, null, null, 132),
    (v_game_id, 7, 1, 9, null, 146),
    (v_game_id, 8, 4, 6, null, 162),
    (v_game_id, 9, 6, 1, null, 169),
    (v_game_id, 10, 10, 0, 0, 179);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 133, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 13),
    (v_game_id, 2, 3, 7, null, 31),
    (v_game_id, 3, 8, 2, null, 41),
    (v_game_id, 4, 0, 9, null, 50),
    (v_game_id, 5, 4, 0, null, 54),
    (v_game_id, 6, 4, 6, null, 74),
    (v_game_id, 7, 10, null, null, 89),
    (v_game_id, 8, 4, 1, null, 94),
    (v_game_id, 9, 0, 9, null, 103),
    (v_game_id, 10, 10, 10, 10, 133);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 150, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 26),
    (v_game_id, 2, 10, null, null, 43),
    (v_game_id, 3, 6, 1, null, 50),
    (v_game_id, 4, 8, 0, null, 58),
    (v_game_id, 5, 0, 3, null, 61),
    (v_game_id, 6, 1, 9, null, 81),
    (v_game_id, 7, 10, null, null, 101),
    (v_game_id, 8, 4, 6, null, 112),
    (v_game_id, 9, 1, 9, null, 130),
    (v_game_id, 10, 8, 2, 10, 150);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 179, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 4, null, 8),
    (v_game_id, 2, 10, null, null, 35),
    (v_game_id, 3, 10, null, null, 52),
    (v_game_id, 4, 7, 0, null, 59),
    (v_game_id, 5, 9, 1, null, 79),
    (v_game_id, 6, 10, null, null, 97),
    (v_game_id, 7, 5, 3, null, 105),
    (v_game_id, 8, 10, null, null, 135),
    (v_game_id, 9, 10, null, null, 159),
    (v_game_id, 10, 10, 4, 6, 179);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 163, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 32),
    (v_game_id, 3, 2, 2, null, 36),
    (v_game_id, 4, 4, 4, null, 44),
    (v_game_id, 5, 10, null, null, 64),
    (v_game_id, 6, 10, null, null, 80),
    (v_game_id, 7, 0, 6, null, 86),
    (v_game_id, 8, 10, null, null, 116),
    (v_game_id, 9, 10, null, null, 143),
    (v_game_id, 10, 10, 7, 3, 163);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 103, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 8, 2, null, 35),
    (v_game_id, 3, 5, 5, null, 45),
    (v_game_id, 4, 0, 1, null, 46),
    (v_game_id, 5, 8, 2, null, 56),
    (v_game_id, 6, 0, 6, null, 62),
    (v_game_id, 7, 10, null, null, 75),
    (v_game_id, 8, 1, 2, null, 78),
    (v_game_id, 9, 5, 3, null, 86),
    (v_game_id, 10, 10, 6, 1, 103);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 146, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 12),
    (v_game_id, 2, 0, 2, null, 14),
    (v_game_id, 3, 5, 5, null, 34),
    (v_game_id, 4, 10, null, null, 53),
    (v_game_id, 5, 6, 3, null, 62),
    (v_game_id, 6, 1, 3, null, 66),
    (v_game_id, 7, 10, null, null, 86),
    (v_game_id, 8, 3, 7, null, 106),
    (v_game_id, 9, 10, null, null, 126),
    (v_game_id, 10, 3, 7, 10, 146);

  -- Quentin Salas
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Quentin Salas', 'right', 181, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 124, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 1, null, 1),
    (v_game_id, 2, 10, null, null, 21),
    (v_game_id, 3, 7, 3, null, 41),
    (v_game_id, 4, 10, null, null, 61),
    (v_game_id, 5, 9, 1, null, 81),
    (v_game_id, 6, 10, null, null, 96),
    (v_game_id, 7, 2, 3, null, 101),
    (v_game_id, 8, 3, 6, null, 110),
    (v_game_id, 9, 9, 0, null, 119),
    (v_game_id, 10, 4, 1, null, 124);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 151, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 4, null, 9),
    (v_game_id, 2, 1, 9, null, 29),
    (v_game_id, 3, 10, null, null, 49),
    (v_game_id, 4, 1, 9, null, 68),
    (v_game_id, 5, 9, 1, null, 83),
    (v_game_id, 6, 5, 3, null, 91),
    (v_game_id, 7, 8, 2, null, 109),
    (v_game_id, 8, 8, 0, null, 117),
    (v_game_id, 9, 8, 2, null, 136),
    (v_game_id, 10, 9, 1, 5, 151);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 162, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 40),
    (v_game_id, 3, 10, null, null, 70),
    (v_game_id, 4, 10, null, null, 91),
    (v_game_id, 5, 10, null, null, 111),
    (v_game_id, 6, 1, 9, null, 123),
    (v_game_id, 7, 2, 8, null, 137),
    (v_game_id, 8, 4, 6, null, 150),
    (v_game_id, 9, 3, 6, null, 159),
    (v_game_id, 10, 2, 1, null, 162);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 112, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 0, null, 4),
    (v_game_id, 2, 2, 1, null, 7),
    (v_game_id, 3, 8, 0, null, 15),
    (v_game_id, 4, 9, 1, null, 32),
    (v_game_id, 5, 7, 3, null, 49),
    (v_game_id, 6, 7, 2, null, 58),
    (v_game_id, 7, 7, 2, null, 67),
    (v_game_id, 8, 7, 1, null, 75),
    (v_game_id, 9, 6, 4, null, 93),
    (v_game_id, 10, 8, 2, 9, 112);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 153, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 32),
    (v_game_id, 3, 2, 8, null, 48),
    (v_game_id, 4, 6, 4, null, 68),
    (v_game_id, 5, 10, null, null, 87),
    (v_game_id, 6, 4, 5, null, 96),
    (v_game_id, 7, 2, 8, null, 113),
    (v_game_id, 8, 7, 3, null, 133),
    (v_game_id, 9, 10, null, null, 148),
    (v_game_id, 10, 2, 3, null, 153);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 125, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 5, 3, null, 26),
    (v_game_id, 3, 8, 2, null, 38),
    (v_game_id, 4, 2, 5, null, 45),
    (v_game_id, 5, 4, 2, null, 51),
    (v_game_id, 6, 6, 0, null, 57),
    (v_game_id, 7, 5, 5, null, 77),
    (v_game_id, 8, 10, null, null, 97),
    (v_game_id, 9, 8, 2, null, 116),
    (v_game_id, 10, 9, 0, null, 125);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 166, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 15),
    (v_game_id, 2, 5, 1, null, 21),
    (v_game_id, 3, 9, 1, null, 35),
    (v_game_id, 4, 4, 5, null, 44),
    (v_game_id, 5, 10, null, null, 66),
    (v_game_id, 6, 10, null, null, 83),
    (v_game_id, 7, 2, 5, null, 90),
    (v_game_id, 8, 10, null, null, 120),
    (v_game_id, 9, 10, null, null, 148),
    (v_game_id, 10, 10, 8, 0, 166);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 190, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 7, null, 9),
    (v_game_id, 2, 5, 5, null, 25),
    (v_game_id, 3, 6, 4, null, 45),
    (v_game_id, 4, 10, null, null, 65),
    (v_game_id, 5, 8, 2, null, 85),
    (v_game_id, 6, 10, null, null, 104),
    (v_game_id, 7, 7, 2, null, 113),
    (v_game_id, 8, 8, 2, null, 133),
    (v_game_id, 9, 10, null, null, 163),
    (v_game_id, 10, 10, 10, 7, 190);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 114, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 5, 5, null, 36),
    (v_game_id, 3, 6, 3, null, 45),
    (v_game_id, 4, 0, 1, null, 46),
    (v_game_id, 5, 2, 5, null, 53),
    (v_game_id, 6, 6, 2, null, 61),
    (v_game_id, 7, 7, 3, null, 72),
    (v_game_id, 8, 1, 9, null, 84),
    (v_game_id, 9, 2, 8, null, 94),
    (v_game_id, 10, 0, 10, 10, 114);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 174, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 20),
    (v_game_id, 2, 10, null, null, 39),
    (v_game_id, 3, 6, 3, null, 48),
    (v_game_id, 4, 10, null, null, 76),
    (v_game_id, 5, 10, null, null, 96),
    (v_game_id, 6, 8, 2, null, 109),
    (v_game_id, 7, 3, 7, null, 129),
    (v_game_id, 8, 10, null, null, 144),
    (v_game_id, 9, 5, 0, null, 149),
    (v_game_id, 10, 10, 10, 5, 174);

  -- Ramon Iglesias
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Ramon Iglesias', 'right', 200, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 150, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 9, null, 16),
    (v_game_id, 2, 6, 0, null, 22),
    (v_game_id, 3, 3, 7, null, 34),
    (v_game_id, 4, 2, 5, null, 41),
    (v_game_id, 5, 6, 4, null, 51),
    (v_game_id, 6, 0, 10, null, 62),
    (v_game_id, 7, 1, 7, null, 70),
    (v_game_id, 8, 1, 9, null, 90),
    (v_game_id, 9, 10, null, null, 120),
    (v_game_id, 10, 10, 10, 10, 150);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 224, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 35),
    (v_game_id, 3, 5, 3, null, 43),
    (v_game_id, 4, 3, 7, null, 63),
    (v_game_id, 5, 10, null, null, 93),
    (v_game_id, 6, 10, null, null, 123),
    (v_game_id, 7, 10, null, null, 153),
    (v_game_id, 8, 10, null, null, 183),
    (v_game_id, 9, 10, null, null, 205),
    (v_game_id, 10, 10, 2, 7, 224);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 130, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 12),
    (v_game_id, 2, 2, 8, null, 32),
    (v_game_id, 3, 10, null, null, 50),
    (v_game_id, 4, 6, 2, null, 58),
    (v_game_id, 5, 4, 6, null, 70),
    (v_game_id, 6, 2, 7, null, 79),
    (v_game_id, 7, 9, 0, null, 88),
    (v_game_id, 8, 5, 5, null, 104),
    (v_game_id, 9, 6, 0, null, 110),
    (v_game_id, 10, 4, 6, 10, 130);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 115, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 11),
    (v_game_id, 2, 1, 4, null, 16),
    (v_game_id, 3, 1, 1, null, 18),
    (v_game_id, 4, 10, null, null, 38),
    (v_game_id, 5, 8, 2, null, 57),
    (v_game_id, 6, 9, 1, null, 76),
    (v_game_id, 7, 9, 0, null, 85),
    (v_game_id, 8, 2, 4, null, 91),
    (v_game_id, 9, 2, 8, null, 108),
    (v_game_id, 10, 7, 0, null, 115);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 134, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 6, null, 6),
    (v_game_id, 2, 10, null, null, 21),
    (v_game_id, 3, 3, 2, null, 26),
    (v_game_id, 4, 10, null, null, 40),
    (v_game_id, 5, 4, 0, null, 44),
    (v_game_id, 6, 10, null, null, 63),
    (v_game_id, 7, 8, 1, null, 72),
    (v_game_id, 8, 6, 1, null, 79),
    (v_game_id, 9, 10, null, null, 109),
    (v_game_id, 10, 10, 10, 5, 134);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 166, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 20),
    (v_game_id, 2, 10, null, null, 39),
    (v_game_id, 3, 6, 3, null, 48),
    (v_game_id, 4, 9, 0, null, 57),
    (v_game_id, 5, 9, 1, null, 71),
    (v_game_id, 6, 4, 6, null, 89),
    (v_game_id, 7, 8, 2, null, 108),
    (v_game_id, 8, 9, 1, null, 128),
    (v_game_id, 9, 10, null, null, 152),
    (v_game_id, 10, 10, 4, 0, 166);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 124, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 15),
    (v_game_id, 2, 5, 2, null, 22),
    (v_game_id, 3, 2, 5, null, 29),
    (v_game_id, 4, 7, 0, null, 36),
    (v_game_id, 5, 3, 7, null, 48),
    (v_game_id, 6, 2, 8, null, 68),
    (v_game_id, 7, 10, null, null, 88),
    (v_game_id, 8, 8, 2, null, 102),
    (v_game_id, 9, 4, 0, null, 106),
    (v_game_id, 10, 10, 7, 1, 124);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 128, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 4, null, 6),
    (v_game_id, 2, 2, 3, null, 11),
    (v_game_id, 3, 8, 0, null, 19),
    (v_game_id, 4, 5, 5, null, 39),
    (v_game_id, 5, 10, null, null, 62),
    (v_game_id, 6, 10, null, null, 80),
    (v_game_id, 7, 3, 5, null, 88),
    (v_game_id, 8, 3, 7, null, 108),
    (v_game_id, 9, 10, null, null, 123),
    (v_game_id, 10, 2, 3, null, 128);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 120, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 4, null, 5),
    (v_game_id, 2, 0, 0, null, 5),
    (v_game_id, 3, 6, 4, null, 22),
    (v_game_id, 4, 7, 2, null, 31),
    (v_game_id, 5, 0, 6, null, 37),
    (v_game_id, 6, 7, 3, null, 57),
    (v_game_id, 7, 10, null, null, 77),
    (v_game_id, 8, 10, null, null, 96),
    (v_game_id, 9, 0, 9, null, 105),
    (v_game_id, 10, 4, 6, 5, 120);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 120, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 1, null, 1),
    (v_game_id, 2, 10, null, null, 21),
    (v_game_id, 3, 6, 4, null, 32),
    (v_game_id, 4, 1, 2, null, 35),
    (v_game_id, 5, 3, 7, null, 54),
    (v_game_id, 6, 9, 1, null, 74),
    (v_game_id, 7, 10, null, null, 88),
    (v_game_id, 8, 4, 0, null, 92),
    (v_game_id, 9, 10, null, null, 111),
    (v_game_id, 10, 9, 0, null, 120);

  -- Steven Abad
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Steven Abad', 'right', 208, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 145, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 6, 4, null, 38),
    (v_game_id, 3, 8, 2, null, 58),
    (v_game_id, 4, 10, null, null, 75),
    (v_game_id, 5, 1, 6, null, 82),
    (v_game_id, 6, 3, 1, null, 86),
    (v_game_id, 7, 10, null, null, 103),
    (v_game_id, 8, 7, 0, null, 110),
    (v_game_id, 9, 7, 1, null, 118),
    (v_game_id, 10, 10, 10, 7, 145);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 117, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 4, 4, null, 26),
    (v_game_id, 3, 9, 0, null, 35),
    (v_game_id, 4, 2, 7, null, 44),
    (v_game_id, 5, 1, 7, null, 52),
    (v_game_id, 6, 2, 8, null, 68),
    (v_game_id, 7, 6, 0, null, 74),
    (v_game_id, 8, 10, null, null, 94),
    (v_game_id, 9, 4, 6, null, 109),
    (v_game_id, 10, 5, 3, null, 117);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 120, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 17),
    (v_game_id, 2, 6, 1, null, 24),
    (v_game_id, 3, 0, 10, null, 37),
    (v_game_id, 4, 3, 4, null, 44),
    (v_game_id, 5, 10, null, null, 62),
    (v_game_id, 6, 8, 0, null, 70),
    (v_game_id, 7, 1, 9, null, 90),
    (v_game_id, 8, 10, null, null, 100),
    (v_game_id, 9, 0, 0, null, 100),
    (v_game_id, 10, 9, 1, 10, 120);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 162, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 8, 2, null, 34),
    (v_game_id, 3, 4, 6, null, 48),
    (v_game_id, 4, 4, 6, null, 68),
    (v_game_id, 5, 10, null, null, 88),
    (v_game_id, 6, 7, 3, null, 103),
    (v_game_id, 7, 5, 5, null, 120),
    (v_game_id, 8, 7, 2, null, 129),
    (v_game_id, 9, 10, null, null, 149),
    (v_game_id, 10, 7, 3, 3, 162);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 137, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 0, 10, null, 30),
    (v_game_id, 3, 0, 10, null, 47),
    (v_game_id, 4, 7, 0, null, 54),
    (v_game_id, 5, 10, null, null, 75),
    (v_game_id, 6, 10, null, null, 95),
    (v_game_id, 7, 1, 9, null, 111),
    (v_game_id, 8, 6, 4, null, 122),
    (v_game_id, 9, 1, 2, null, 125),
    (v_game_id, 10, 10, 2, 0, 137);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 119, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 6, null, 9),
    (v_game_id, 2, 9, 1, null, 22),
    (v_game_id, 3, 3, 2, null, 27),
    (v_game_id, 4, 10, null, null, 47),
    (v_game_id, 5, 7, 3, null, 67),
    (v_game_id, 6, 10, null, null, 87),
    (v_game_id, 7, 1, 9, null, 103),
    (v_game_id, 8, 6, 0, null, 109),
    (v_game_id, 9, 2, 6, null, 117),
    (v_game_id, 10, 1, 1, null, 119);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 4, null, 5),
    (v_game_id, 2, 7, 1, null, 13),
    (v_game_id, 3, 3, 5, null, 21),
    (v_game_id, 4, 10, null, null, 51),
    (v_game_id, 5, 10, null, null, 81),
    (v_game_id, 6, 10, null, null, 104),
    (v_game_id, 7, 10, null, null, 119),
    (v_game_id, 8, 3, 2, null, 124),
    (v_game_id, 9, 4, 6, null, 139),
    (v_game_id, 10, 5, 3, null, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 104, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 0, 10, null, 33),
    (v_game_id, 3, 3, 1, null, 37),
    (v_game_id, 4, 7, 1, null, 45),
    (v_game_id, 5, 7, 3, null, 59),
    (v_game_id, 6, 4, 6, null, 78),
    (v_game_id, 7, 9, 1, null, 93),
    (v_game_id, 8, 5, 0, null, 98),
    (v_game_id, 9, 0, 0, null, 98),
    (v_game_id, 10, 1, 5, null, 104);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 163, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 20),
    (v_game_id, 2, 10, null, null, 42),
    (v_game_id, 3, 10, null, null, 61),
    (v_game_id, 4, 2, 7, null, 70),
    (v_game_id, 5, 2, 6, null, 78),
    (v_game_id, 6, 0, 10, null, 98),
    (v_game_id, 7, 10, null, null, 122),
    (v_game_id, 8, 10, null, null, 138),
    (v_game_id, 9, 4, 2, null, 144),
    (v_game_id, 10, 10, 7, 2, 163);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 161, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 7, 3, null, 40),
    (v_game_id, 3, 10, null, null, 56),
    (v_game_id, 4, 6, 0, null, 62),
    (v_game_id, 5, 10, null, null, 81),
    (v_game_id, 6, 5, 4, null, 90),
    (v_game_id, 7, 10, null, null, 110),
    (v_game_id, 8, 1, 9, null, 126),
    (v_game_id, 9, 6, 4, null, 143),
    (v_game_id, 10, 7, 3, 8, 161);

  -- Toby Hernandez
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Toby Hernandez', 'right', 185, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 188, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 20),
    (v_game_id, 2, 10, null, null, 42),
    (v_game_id, 3, 10, null, null, 62),
    (v_game_id, 4, 2, 8, null, 82),
    (v_game_id, 5, 10, null, null, 111),
    (v_game_id, 6, 10, null, null, 130),
    (v_game_id, 7, 9, 0, null, 139),
    (v_game_id, 8, 6, 4, null, 153),
    (v_game_id, 9, 4, 6, null, 169),
    (v_game_id, 10, 6, 4, 9, 188);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 146, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 1, null, 7),
    (v_game_id, 2, 9, 1, null, 27),
    (v_game_id, 3, 10, null, null, 57),
    (v_game_id, 4, 10, null, null, 85),
    (v_game_id, 5, 10, null, null, 103),
    (v_game_id, 6, 8, 0, null, 111),
    (v_game_id, 7, 2, 8, null, 125),
    (v_game_id, 8, 4, 0, null, 129),
    (v_game_id, 9, 3, 5, null, 137),
    (v_game_id, 10, 2, 7, null, 146);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 99, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 6, 3, null, 28),
    (v_game_id, 3, 10, null, null, 38),
    (v_game_id, 4, 0, 0, null, 38),
    (v_game_id, 5, 7, 2, null, 47),
    (v_game_id, 6, 2, 8, null, 62),
    (v_game_id, 7, 5, 3, null, 70),
    (v_game_id, 8, 3, 7, null, 81),
    (v_game_id, 9, 1, 7, null, 89),
    (v_game_id, 10, 8, 2, 0, 99);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 128, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 3, null, 4),
    (v_game_id, 2, 6, 4, null, 14),
    (v_game_id, 3, 0, 10, null, 30),
    (v_game_id, 4, 6, 4, null, 46),
    (v_game_id, 5, 6, 0, null, 52),
    (v_game_id, 6, 10, null, null, 71),
    (v_game_id, 7, 9, 0, null, 80),
    (v_game_id, 8, 10, null, null, 100),
    (v_game_id, 9, 2, 8, null, 119),
    (v_game_id, 10, 9, 0, null, 128);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 100, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 7, 1, null, 17),
    (v_game_id, 3, 8, 2, null, 29),
    (v_game_id, 4, 2, 4, null, 35),
    (v_game_id, 5, 6, 3, null, 44),
    (v_game_id, 6, 6, 4, null, 56),
    (v_game_id, 7, 2, 0, null, 58),
    (v_game_id, 8, 8, 2, null, 72),
    (v_game_id, 9, 4, 5, null, 81),
    (v_game_id, 10, 10, 8, 1, 100);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 156, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 0, null, 8),
    (v_game_id, 2, 10, null, null, 30),
    (v_game_id, 3, 10, null, null, 42),
    (v_game_id, 4, 2, 0, null, 44),
    (v_game_id, 5, 3, 7, null, 64),
    (v_game_id, 6, 10, null, null, 84),
    (v_game_id, 7, 9, 1, null, 104),
    (v_game_id, 8, 10, null, null, 124),
    (v_game_id, 9, 1, 9, null, 142),
    (v_game_id, 10, 8, 2, 4, 156);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 163, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 1, 9, null, 60),
    (v_game_id, 4, 10, null, null, 79),
    (v_game_id, 5, 6, 3, null, 88),
    (v_game_id, 6, 10, null, null, 111),
    (v_game_id, 7, 10, null, null, 131),
    (v_game_id, 8, 3, 7, null, 147),
    (v_game_id, 9, 6, 3, null, 156),
    (v_game_id, 10, 7, 0, null, 163);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 122, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 0, null, 8),
    (v_game_id, 2, 7, 3, null, 23),
    (v_game_id, 3, 5, 0, null, 28),
    (v_game_id, 4, 2, 0, null, 30),
    (v_game_id, 5, 7, 3, null, 50),
    (v_game_id, 6, 10, null, null, 70),
    (v_game_id, 7, 9, 1, null, 84),
    (v_game_id, 8, 4, 6, null, 103),
    (v_game_id, 9, 9, 1, null, 113),
    (v_game_id, 10, 0, 9, null, 122);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 143, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 2, null, 6),
    (v_game_id, 2, 5, 4, null, 15),
    (v_game_id, 3, 1, 2, null, 18),
    (v_game_id, 4, 4, 6, null, 38),
    (v_game_id, 5, 10, null, null, 58),
    (v_game_id, 6, 8, 2, null, 75),
    (v_game_id, 7, 7, 3, null, 95),
    (v_game_id, 8, 10, null, null, 114),
    (v_game_id, 9, 6, 3, null, 123),
    (v_game_id, 10, 10, 10, 0, 143);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 130, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 16),
    (v_game_id, 2, 6, 4, null, 28),
    (v_game_id, 3, 2, 8, null, 46),
    (v_game_id, 4, 8, 2, null, 58),
    (v_game_id, 5, 2, 8, null, 72),
    (v_game_id, 6, 4, 6, null, 89),
    (v_game_id, 7, 7, 0, null, 96),
    (v_game_id, 8, 2, 8, null, 108),
    (v_game_id, 9, 2, 6, null, 116),
    (v_game_id, 10, 1, 9, 4, 130);

  -- Uriel Caballero
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Uriel Caballero', 'right', 202, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 194, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 40),
    (v_game_id, 3, 10, null, null, 69),
    (v_game_id, 4, 10, null, null, 89),
    (v_game_id, 5, 9, 1, null, 109),
    (v_game_id, 6, 10, null, null, 129),
    (v_game_id, 7, 0, 10, null, 149),
    (v_game_id, 8, 10, null, null, 167),
    (v_game_id, 9, 1, 7, null, 175),
    (v_game_id, 10, 10, 1, 8, 194);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 158, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 2, null, 14),
    (v_game_id, 2, 4, 6, null, 34),
    (v_game_id, 3, 10, null, null, 58),
    (v_game_id, 4, 10, null, null, 78),
    (v_game_id, 5, 4, 6, null, 96),
    (v_game_id, 6, 8, 0, null, 104),
    (v_game_id, 7, 5, 1, null, 110),
    (v_game_id, 8, 9, 1, null, 130),
    (v_game_id, 9, 10, null, null, 149),
    (v_game_id, 10, 1, 8, null, 158);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 111, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 13),
    (v_game_id, 2, 3, 0, null, 16),
    (v_game_id, 3, 8, 2, null, 26),
    (v_game_id, 4, 0, 5, null, 31),
    (v_game_id, 5, 10, null, null, 50),
    (v_game_id, 6, 8, 1, null, 59),
    (v_game_id, 7, 10, null, null, 83),
    (v_game_id, 8, 10, null, null, 100),
    (v_game_id, 9, 4, 3, null, 107),
    (v_game_id, 10, 1, 3, null, 111);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 157, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 11),
    (v_game_id, 2, 1, 4, null, 16),
    (v_game_id, 3, 10, null, null, 37),
    (v_game_id, 4, 10, null, null, 57),
    (v_game_id, 5, 1, 9, null, 75),
    (v_game_id, 6, 8, 2, null, 92),
    (v_game_id, 7, 7, 1, null, 100),
    (v_game_id, 8, 10, null, null, 120),
    (v_game_id, 9, 2, 8, null, 137),
    (v_game_id, 10, 7, 3, 10, 157);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 140, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 2, null, 8),
    (v_game_id, 2, 5, 5, null, 28),
    (v_game_id, 3, 10, null, null, 40),
    (v_game_id, 4, 0, 2, null, 42),
    (v_game_id, 5, 6, 3, null, 51),
    (v_game_id, 6, 3, 7, null, 71),
    (v_game_id, 7, 10, null, null, 89),
    (v_game_id, 8, 4, 4, null, 97),
    (v_game_id, 9, 10, null, null, 122),
    (v_game_id, 10, 10, 5, 3, 140);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 125, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 0, 10, null, 50),
    (v_game_id, 4, 0, 6, null, 56),
    (v_game_id, 5, 9, 0, null, 65),
    (v_game_id, 6, 3, 7, null, 85),
    (v_game_id, 7, 10, null, null, 105),
    (v_game_id, 8, 0, 10, null, 118),
    (v_game_id, 9, 3, 0, null, 121),
    (v_game_id, 10, 2, 2, null, 125);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 153, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 3, null, 4),
    (v_game_id, 2, 10, null, null, 24),
    (v_game_id, 3, 6, 4, null, 42),
    (v_game_id, 4, 8, 2, null, 56),
    (v_game_id, 5, 4, 3, null, 63),
    (v_game_id, 6, 7, 1, null, 71),
    (v_game_id, 7, 10, null, null, 91),
    (v_game_id, 8, 9, 1, null, 111),
    (v_game_id, 9, 10, null, null, 133),
    (v_game_id, 10, 10, 2, 8, 153);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 121, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 2, null, 8),
    (v_game_id, 2, 5, 5, null, 18),
    (v_game_id, 3, 0, 7, null, 25),
    (v_game_id, 4, 6, 4, null, 35),
    (v_game_id, 5, 0, 10, null, 45),
    (v_game_id, 6, 0, 8, null, 53),
    (v_game_id, 7, 10, null, null, 70),
    (v_game_id, 8, 6, 1, null, 77),
    (v_game_id, 9, 10, null, null, 103),
    (v_game_id, 10, 10, 6, 2, 121);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 153, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 2, 8, null, 37),
    (v_game_id, 3, 7, 3, null, 57),
    (v_game_id, 4, 10, null, null, 77),
    (v_game_id, 5, 9, 1, null, 94),
    (v_game_id, 6, 7, 1, null, 102),
    (v_game_id, 7, 3, 7, null, 114),
    (v_game_id, 8, 2, 8, null, 130),
    (v_game_id, 9, 6, 4, null, 145),
    (v_game_id, 10, 5, 3, null, 153);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 128, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 9, null, 15),
    (v_game_id, 2, 5, 5, null, 35),
    (v_game_id, 3, 10, null, null, 54),
    (v_game_id, 4, 3, 6, null, 63),
    (v_game_id, 5, 10, null, null, 83),
    (v_game_id, 6, 9, 1, null, 95),
    (v_game_id, 7, 2, 4, null, 101),
    (v_game_id, 8, 0, 6, null, 107),
    (v_game_id, 9, 8, 2, null, 119),
    (v_game_id, 10, 2, 7, null, 128);

  -- Victor Laderas
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Victor Laderas', 'right', 213, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 122, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 14),
    (v_game_id, 2, 4, 1, null, 19),
    (v_game_id, 3, 0, 10, null, 34),
    (v_game_id, 4, 5, 5, null, 44),
    (v_game_id, 5, 0, 10, null, 57),
    (v_game_id, 6, 3, 7, null, 67),
    (v_game_id, 7, 0, 10, null, 87),
    (v_game_id, 8, 10, null, null, 102),
    (v_game_id, 9, 4, 1, null, 107),
    (v_game_id, 10, 0, 10, 5, 122);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 126, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 20),
    (v_game_id, 2, 10, null, null, 37),
    (v_game_id, 3, 3, 4, null, 44),
    (v_game_id, 4, 2, 2, null, 48),
    (v_game_id, 5, 10, null, null, 69),
    (v_game_id, 6, 10, null, null, 89),
    (v_game_id, 7, 1, 9, null, 101),
    (v_game_id, 8, 2, 1, null, 104),
    (v_game_id, 9, 4, 6, null, 118),
    (v_game_id, 10, 4, 4, null, 126);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 115, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 3, 5, null, 17),
    (v_game_id, 3, 7, 3, null, 32),
    (v_game_id, 4, 5, 5, null, 45),
    (v_game_id, 5, 3, 5, null, 53),
    (v_game_id, 6, 9, 1, null, 70),
    (v_game_id, 7, 7, 3, null, 84),
    (v_game_id, 8, 4, 1, null, 89),
    (v_game_id, 9, 6, 0, null, 95),
    (v_game_id, 10, 5, 5, 10, 115);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 170, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 3, 6, null, 28),
    (v_game_id, 3, 10, null, null, 48),
    (v_game_id, 4, 5, 5, null, 68),
    (v_game_id, 5, 10, null, null, 88),
    (v_game_id, 6, 8, 2, null, 99),
    (v_game_id, 7, 1, 9, null, 119),
    (v_game_id, 8, 10, null, null, 144),
    (v_game_id, 9, 10, null, null, 162),
    (v_game_id, 10, 5, 3, null, 170);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 132, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 9, null, 17),
    (v_game_id, 2, 7, 0, null, 24),
    (v_game_id, 3, 6, 0, null, 30),
    (v_game_id, 4, 7, 0, null, 37),
    (v_game_id, 5, 10, null, null, 66),
    (v_game_id, 6, 10, null, null, 86),
    (v_game_id, 7, 9, 1, null, 102),
    (v_game_id, 8, 6, 3, null, 111),
    (v_game_id, 9, 3, 7, null, 123),
    (v_game_id, 10, 2, 7, null, 132);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 148, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 6, 4, null, 40),
    (v_game_id, 3, 10, null, null, 60),
    (v_game_id, 4, 8, 2, null, 78),
    (v_game_id, 5, 8, 1, null, 87),
    (v_game_id, 6, 5, 4, null, 96),
    (v_game_id, 7, 4, 6, null, 113),
    (v_game_id, 8, 7, 3, null, 129),
    (v_game_id, 9, 6, 2, null, 137),
    (v_game_id, 10, 3, 7, 1, 148);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 160, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 0, 10, null, 56),
    (v_game_id, 4, 6, 4, null, 70),
    (v_game_id, 5, 4, 6, null, 90),
    (v_game_id, 6, 10, null, null, 110),
    (v_game_id, 7, 2, 8, null, 130),
    (v_game_id, 8, 10, null, null, 141),
    (v_game_id, 9, 0, 1, null, 142),
    (v_game_id, 10, 8, 2, 8, 160);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 4, 6, null, 52),
    (v_game_id, 4, 2, 8, null, 66),
    (v_game_id, 5, 4, 6, null, 85),
    (v_game_id, 6, 9, 1, null, 105),
    (v_game_id, 7, 10, null, null, 124),
    (v_game_id, 8, 2, 7, null, 133),
    (v_game_id, 9, 0, 2, null, 135),
    (v_game_id, 10, 0, 10, 2, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 144, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 20),
    (v_game_id, 2, 10, null, null, 50),
    (v_game_id, 3, 10, null, null, 70),
    (v_game_id, 4, 10, null, null, 85),
    (v_game_id, 5, 0, 5, null, 90),
    (v_game_id, 6, 6, 0, null, 96),
    (v_game_id, 7, 10, null, null, 116),
    (v_game_id, 8, 1, 9, null, 133),
    (v_game_id, 9, 7, 0, null, 140),
    (v_game_id, 10, 3, 1, null, 144);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 183, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 51),
    (v_game_id, 3, 10, null, null, 70),
    (v_game_id, 4, 1, 8, null, 79),
    (v_game_id, 5, 9, 1, null, 95),
    (v_game_id, 6, 6, 4, null, 115),
    (v_game_id, 7, 10, null, null, 135),
    (v_game_id, 8, 2, 8, null, 155),
    (v_game_id, 9, 10, null, null, 174),
    (v_game_id, 10, 9, 0, null, 183);

  -- Wesley Wong
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Wesley Wong', 'right', 192, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 188, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 56),
    (v_game_id, 3, 10, null, null, 74),
    (v_game_id, 4, 6, 2, null, 82),
    (v_game_id, 5, 7, 3, null, 102),
    (v_game_id, 6, 10, null, null, 127),
    (v_game_id, 7, 10, null, null, 147),
    (v_game_id, 8, 5, 5, null, 161),
    (v_game_id, 9, 4, 3, null, 168),
    (v_game_id, 10, 0, 10, 10, 188);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 116, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 1, 7, null, 26),
    (v_game_id, 3, 8, 2, null, 40),
    (v_game_id, 4, 4, 6, null, 57),
    (v_game_id, 5, 7, 1, null, 65),
    (v_game_id, 6, 0, 4, null, 69),
    (v_game_id, 7, 4, 3, null, 76),
    (v_game_id, 8, 10, null, null, 96),
    (v_game_id, 9, 10, null, null, 111),
    (v_game_id, 10, 0, 5, null, 116);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 2, null, 6),
    (v_game_id, 2, 10, null, null, 26),
    (v_game_id, 3, 2, 8, null, 41),
    (v_game_id, 4, 5, 4, null, 50),
    (v_game_id, 5, 10, null, null, 70),
    (v_game_id, 6, 4, 6, null, 88),
    (v_game_id, 7, 8, 0, null, 96),
    (v_game_id, 8, 4, 1, null, 101),
    (v_game_id, 9, 6, 4, null, 121),
    (v_game_id, 10, 10, 10, 6, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 155, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 0, 10, null, 34),
    (v_game_id, 3, 4, 6, null, 52),
    (v_game_id, 4, 8, 0, null, 60),
    (v_game_id, 5, 10, null, null, 80),
    (v_game_id, 6, 9, 1, null, 100),
    (v_game_id, 7, 10, null, null, 120),
    (v_game_id, 8, 10, null, null, 139),
    (v_game_id, 9, 0, 9, null, 148),
    (v_game_id, 10, 7, 0, null, 155);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 167, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 5, null, 8),
    (v_game_id, 2, 9, 1, null, 28),
    (v_game_id, 3, 10, null, null, 48),
    (v_game_id, 4, 9, 1, null, 68),
    (v_game_id, 5, 10, null, null, 88),
    (v_game_id, 6, 10, null, null, 108),
    (v_game_id, 7, 0, 10, null, 126),
    (v_game_id, 8, 8, 2, null, 145),
    (v_game_id, 9, 9, 0, null, 154),
    (v_game_id, 10, 9, 1, 3, 167);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 183, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 0, null, 5),
    (v_game_id, 2, 10, null, null, 25),
    (v_game_id, 3, 9, 1, null, 41),
    (v_game_id, 4, 6, 4, null, 53),
    (v_game_id, 5, 2, 5, null, 60),
    (v_game_id, 6, 10, null, null, 90),
    (v_game_id, 7, 10, null, null, 120),
    (v_game_id, 8, 10, null, null, 147),
    (v_game_id, 9, 10, null, null, 167),
    (v_game_id, 10, 7, 3, 6, 183);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 132, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 4, null, 9),
    (v_game_id, 2, 0, 10, null, 26),
    (v_game_id, 3, 7, 1, null, 34),
    (v_game_id, 4, 5, 5, null, 47),
    (v_game_id, 5, 3, 7, null, 57),
    (v_game_id, 6, 0, 1, null, 58),
    (v_game_id, 7, 1, 8, null, 67),
    (v_game_id, 8, 1, 9, null, 87),
    (v_game_id, 9, 10, null, null, 112),
    (v_game_id, 10, 10, 5, 5, 132);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 117, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 5, null, 7),
    (v_game_id, 2, 8, 1, null, 16),
    (v_game_id, 3, 4, 4, null, 24),
    (v_game_id, 4, 6, 3, null, 33),
    (v_game_id, 5, 1, 8, null, 42),
    (v_game_id, 6, 7, 2, null, 51),
    (v_game_id, 7, 2, 8, null, 70),
    (v_game_id, 8, 9, 0, null, 79),
    (v_game_id, 9, 8, 2, null, 99),
    (v_game_id, 10, 10, 8, 0, 117);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 171, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 7, 2, null, 28),
    (v_game_id, 3, 10, null, null, 58),
    (v_game_id, 4, 10, null, null, 88),
    (v_game_id, 5, 10, null, null, 108),
    (v_game_id, 6, 10, null, null, 123),
    (v_game_id, 7, 0, 5, null, 128),
    (v_game_id, 8, 6, 1, null, 135),
    (v_game_id, 9, 0, 10, null, 151),
    (v_game_id, 10, 6, 4, 10, 171);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 110, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 6, null, 6),
    (v_game_id, 2, 2, 5, null, 13),
    (v_game_id, 3, 10, null, null, 36),
    (v_game_id, 4, 10, null, null, 53),
    (v_game_id, 5, 3, 4, null, 60),
    (v_game_id, 6, 4, 1, null, 65),
    (v_game_id, 7, 8, 2, null, 77),
    (v_game_id, 8, 2, 8, null, 89),
    (v_game_id, 9, 2, 5, null, 96),
    (v_game_id, 10, 4, 6, 4, 110);

  -- Xavier Kelsey
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Xavier Kelsey', 'right', 201, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 137, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 38),
    (v_game_id, 3, 8, 2, null, 57),
    (v_game_id, 4, 9, 1, null, 67),
    (v_game_id, 5, 0, 2, null, 69),
    (v_game_id, 6, 9, 1, null, 84),
    (v_game_id, 7, 5, 2, null, 91),
    (v_game_id, 8, 3, 4, null, 98),
    (v_game_id, 9, 8, 2, null, 118),
    (v_game_id, 10, 10, 9, 0, 137);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 198, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 2, null, 9),
    (v_game_id, 2, 1, 8, null, 18),
    (v_game_id, 3, 6, 4, null, 38),
    (v_game_id, 4, 10, null, null, 68),
    (v_game_id, 5, 10, null, null, 98),
    (v_game_id, 6, 10, null, null, 125),
    (v_game_id, 7, 10, null, null, 145),
    (v_game_id, 8, 7, 3, null, 158),
    (v_game_id, 9, 3, 7, null, 178),
    (v_game_id, 10, 10, 9, 1, 198);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 177, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 20),
    (v_game_id, 2, 10, null, null, 34),
    (v_game_id, 3, 0, 4, null, 38),
    (v_game_id, 4, 10, null, null, 61),
    (v_game_id, 5, 10, null, null, 81),
    (v_game_id, 6, 3, 7, null, 101),
    (v_game_id, 7, 10, null, null, 131),
    (v_game_id, 8, 10, null, null, 153),
    (v_game_id, 9, 10, null, null, 170),
    (v_game_id, 10, 2, 5, null, 177);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 105, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 15),
    (v_game_id, 2, 2, 3, null, 20),
    (v_game_id, 3, 6, 0, null, 26),
    (v_game_id, 4, 6, 1, null, 33),
    (v_game_id, 5, 2, 8, null, 51),
    (v_game_id, 6, 8, 1, null, 60),
    (v_game_id, 7, 5, 1, null, 66),
    (v_game_id, 8, 8, 2, null, 81),
    (v_game_id, 9, 5, 5, null, 97),
    (v_game_id, 10, 6, 2, null, 105);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 182, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 4, 6, null, 37),
    (v_game_id, 3, 7, 0, null, 44),
    (v_game_id, 4, 6, 3, null, 53),
    (v_game_id, 5, 4, 6, null, 73),
    (v_game_id, 6, 10, null, null, 103),
    (v_game_id, 7, 10, null, null, 132),
    (v_game_id, 8, 10, null, null, 152),
    (v_game_id, 9, 9, 1, null, 171),
    (v_game_id, 10, 9, 1, 1, 182);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 164, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 56),
    (v_game_id, 3, 10, null, null, 76),
    (v_game_id, 4, 6, 4, null, 89),
    (v_game_id, 5, 3, 7, null, 102),
    (v_game_id, 6, 3, 7, null, 115),
    (v_game_id, 7, 3, 7, null, 133),
    (v_game_id, 8, 8, 2, null, 143),
    (v_game_id, 9, 0, 10, null, 158),
    (v_game_id, 10, 5, 1, null, 164);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 112, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 5, 5, null, 57),
    (v_game_id, 4, 7, 3, null, 67),
    (v_game_id, 5, 0, 7, null, 74),
    (v_game_id, 6, 7, 0, null, 81),
    (v_game_id, 7, 3, 6, null, 90),
    (v_game_id, 8, 3, 2, null, 95),
    (v_game_id, 9, 7, 2, null, 104),
    (v_game_id, 10, 4, 4, null, 112);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 120, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 11),
    (v_game_id, 2, 1, 6, null, 18),
    (v_game_id, 3, 10, null, null, 38),
    (v_game_id, 4, 0, 10, null, 50),
    (v_game_id, 5, 2, 2, null, 54),
    (v_game_id, 6, 6, 4, null, 68),
    (v_game_id, 7, 4, 5, null, 77),
    (v_game_id, 8, 6, 0, null, 83),
    (v_game_id, 9, 10, null, null, 103),
    (v_game_id, 10, 3, 7, 7, 120);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 210, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 20),
    (v_game_id, 2, 10, null, null, 50),
    (v_game_id, 3, 10, null, null, 70),
    (v_game_id, 4, 10, null, null, 90),
    (v_game_id, 5, 0, 10, null, 102),
    (v_game_id, 6, 2, 8, null, 122),
    (v_game_id, 7, 10, null, null, 151),
    (v_game_id, 8, 10, null, null, 171),
    (v_game_id, 9, 9, 1, null, 190),
    (v_game_id, 10, 9, 1, 10, 210);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 157, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 8, 2, null, 38),
    (v_game_id, 3, 8, 0, null, 46),
    (v_game_id, 4, 10, null, null, 66),
    (v_game_id, 5, 6, 4, null, 78),
    (v_game_id, 6, 2, 0, null, 80),
    (v_game_id, 7, 10, null, null, 108),
    (v_game_id, 8, 10, null, null, 128),
    (v_game_id, 9, 8, 2, null, 145),
    (v_game_id, 10, 7, 3, 2, 157);

  -- Paula Santi
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Paula Santi', 'right', 179, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 8)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 144, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 5, null, 6),
    (v_game_id, 2, 2, 1, null, 9),
    (v_game_id, 3, 5, 2, null, 16),
    (v_game_id, 4, 10, null, null, 45),
    (v_game_id, 5, 10, null, null, 64),
    (v_game_id, 6, 9, 0, null, 73),
    (v_game_id, 7, 10, null, null, 93),
    (v_game_id, 8, 5, 5, null, 107),
    (v_game_id, 9, 4, 6, null, 124),
    (v_game_id, 10, 7, 3, 10, 144);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 141, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 7, 2, null, 28),
    (v_game_id, 3, 6, 4, null, 48),
    (v_game_id, 4, 10, null, null, 68),
    (v_game_id, 5, 8, 2, null, 83),
    (v_game_id, 6, 5, 2, null, 90),
    (v_game_id, 7, 5, 2, null, 97),
    (v_game_id, 8, 10, null, null, 119),
    (v_game_id, 9, 10, null, null, 135),
    (v_game_id, 10, 2, 4, null, 141);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 130, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 1, null, 8),
    (v_game_id, 2, 6, 2, null, 16),
    (v_game_id, 3, 10, null, null, 35),
    (v_game_id, 4, 9, 0, null, 44),
    (v_game_id, 5, 6, 4, null, 61),
    (v_game_id, 6, 7, 3, null, 78),
    (v_game_id, 7, 7, 3, null, 90),
    (v_game_id, 8, 2, 4, null, 96),
    (v_game_id, 9, 7, 1, null, 104),
    (v_game_id, 10, 10, 10, 6, 130);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 135, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 2, null, 6),
    (v_game_id, 2, 5, 2, null, 13),
    (v_game_id, 3, 1, 6, null, 20),
    (v_game_id, 4, 3, 3, null, 26),
    (v_game_id, 5, 10, null, null, 44),
    (v_game_id, 6, 8, 0, null, 52),
    (v_game_id, 7, 9, 1, null, 70),
    (v_game_id, 8, 8, 2, null, 90),
    (v_game_id, 9, 10, null, null, 116),
    (v_game_id, 10, 10, 6, 3, 135);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 124, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 4, 4, null, 26),
    (v_game_id, 3, 3, 2, null, 31),
    (v_game_id, 4, 10, null, null, 50),
    (v_game_id, 5, 7, 2, null, 59),
    (v_game_id, 6, 10, null, null, 79),
    (v_game_id, 7, 8, 2, null, 91),
    (v_game_id, 8, 2, 1, null, 94),
    (v_game_id, 9, 4, 6, null, 111),
    (v_game_id, 10, 7, 3, 3, 124);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 129, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 1, null, 6),
    (v_game_id, 2, 3, 3, null, 12),
    (v_game_id, 3, 1, 9, null, 30),
    (v_game_id, 4, 8, 2, null, 43),
    (v_game_id, 5, 3, 7, null, 57),
    (v_game_id, 6, 4, 6, null, 77),
    (v_game_id, 7, 10, null, null, 97),
    (v_game_id, 8, 2, 8, null, 111),
    (v_game_id, 9, 4, 5, null, 120),
    (v_game_id, 10, 6, 3, null, 129);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 119, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 2, null, 7),
    (v_game_id, 2, 0, 9, null, 16),
    (v_game_id, 3, 10, null, null, 35),
    (v_game_id, 4, 0, 9, null, 44),
    (v_game_id, 5, 5, 5, null, 54),
    (v_game_id, 6, 0, 10, null, 65),
    (v_game_id, 7, 1, 4, null, 70),
    (v_game_id, 8, 5, 5, null, 87),
    (v_game_id, 9, 7, 3, null, 106),
    (v_game_id, 10, 9, 1, 3, 119);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 187, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 8, null, 8),
    (v_game_id, 2, 10, null, null, 36),
    (v_game_id, 3, 10, null, null, 55),
    (v_game_id, 4, 8, 1, null, 64),
    (v_game_id, 5, 10, null, null, 91),
    (v_game_id, 6, 10, null, null, 111),
    (v_game_id, 7, 7, 3, null, 130),
    (v_game_id, 8, 9, 1, null, 147),
    (v_game_id, 9, 7, 3, null, 167),
    (v_game_id, 10, 10, 9, 1, 187);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 20),
    (v_game_id, 2, 10, null, null, 39),
    (v_game_id, 3, 8, 1, null, 48),
    (v_game_id, 4, 0, 2, null, 50),
    (v_game_id, 5, 6, 4, null, 70),
    (v_game_id, 6, 10, null, null, 87),
    (v_game_id, 7, 7, 0, null, 94),
    (v_game_id, 8, 9, 1, null, 111),
    (v_game_id, 9, 7, 3, null, 128),
    (v_game_id, 10, 7, 3, 9, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 139, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 1, null, 9),
    (v_game_id, 2, 8, 2, null, 26),
    (v_game_id, 3, 7, 0, null, 33),
    (v_game_id, 4, 2, 1, null, 36),
    (v_game_id, 5, 5, 5, null, 54),
    (v_game_id, 6, 8, 0, null, 62),
    (v_game_id, 7, 6, 4, null, 82),
    (v_game_id, 8, 10, null, null, 109),
    (v_game_id, 9, 10, null, null, 129),
    (v_game_id, 10, 7, 3, 0, 139);

  -- Yves Calumpang
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Yves Calumpang', 'right', 170, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 140, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 13),
    (v_game_id, 2, 2, 1, null, 16),
    (v_game_id, 3, 4, 6, null, 33),
    (v_game_id, 4, 7, 1, null, 41),
    (v_game_id, 5, 2, 8, null, 61),
    (v_game_id, 6, 10, null, null, 87),
    (v_game_id, 7, 10, null, null, 107),
    (v_game_id, 8, 6, 4, null, 121),
    (v_game_id, 9, 4, 1, null, 126),
    (v_game_id, 10, 7, 3, 4, 140);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 111, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 7, 1, null, 26),
    (v_game_id, 3, 5, 5, null, 40),
    (v_game_id, 4, 4, 3, null, 47),
    (v_game_id, 5, 7, 2, null, 56),
    (v_game_id, 6, 2, 7, null, 65),
    (v_game_id, 7, 5, 2, null, 72),
    (v_game_id, 8, 8, 0, null, 80),
    (v_game_id, 9, 10, null, null, 100),
    (v_game_id, 10, 8, 2, 1, 111);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 150, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 0, null, 6),
    (v_game_id, 2, 10, null, null, 28),
    (v_game_id, 3, 10, null, null, 48),
    (v_game_id, 4, 2, 8, null, 62),
    (v_game_id, 5, 4, 6, null, 82),
    (v_game_id, 6, 10, null, null, 99),
    (v_game_id, 7, 3, 4, null, 106),
    (v_game_id, 8, 9, 1, null, 123),
    (v_game_id, 9, 7, 3, null, 135),
    (v_game_id, 10, 2, 8, 5, 150);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 108, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 15),
    (v_game_id, 2, 5, 0, null, 20),
    (v_game_id, 3, 4, 6, null, 33),
    (v_game_id, 4, 3, 7, null, 50),
    (v_game_id, 5, 7, 3, null, 63),
    (v_game_id, 6, 3, 2, null, 68),
    (v_game_id, 7, 10, null, null, 79),
    (v_game_id, 8, 0, 1, null, 80),
    (v_game_id, 9, 10, null, null, 99),
    (v_game_id, 10, 8, 1, null, 108);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 125, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 12),
    (v_game_id, 2, 2, 8, null, 26),
    (v_game_id, 3, 4, 6, null, 40),
    (v_game_id, 4, 4, 6, null, 54),
    (v_game_id, 5, 4, 5, null, 63),
    (v_game_id, 6, 7, 0, null, 70),
    (v_game_id, 7, 10, null, null, 92),
    (v_game_id, 8, 10, null, null, 108),
    (v_game_id, 9, 2, 4, null, 114),
    (v_game_id, 10, 7, 3, 1, 125);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 180, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 59),
    (v_game_id, 3, 10, null, null, 78),
    (v_game_id, 4, 9, 0, null, 87),
    (v_game_id, 5, 0, 4, null, 91),
    (v_game_id, 6, 10, null, null, 110),
    (v_game_id, 7, 6, 3, null, 119),
    (v_game_id, 8, 10, null, null, 140),
    (v_game_id, 9, 10, null, null, 160),
    (v_game_id, 10, 1, 9, 10, 180);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 116, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 13),
    (v_game_id, 2, 3, 7, null, 33),
    (v_game_id, 3, 10, null, null, 53),
    (v_game_id, 4, 1, 9, null, 66),
    (v_game_id, 5, 3, 5, null, 74),
    (v_game_id, 6, 5, 3, null, 82),
    (v_game_id, 7, 0, 2, null, 84),
    (v_game_id, 8, 4, 0, null, 88),
    (v_game_id, 9, 4, 4, null, 96),
    (v_game_id, 10, 9, 1, 10, 116);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 170, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 6, 4, null, 30),
    (v_game_id, 3, 0, 10, null, 46),
    (v_game_id, 4, 6, 4, null, 60),
    (v_game_id, 5, 4, 3, null, 67),
    (v_game_id, 6, 9, 1, null, 77),
    (v_game_id, 7, 0, 10, null, 97),
    (v_game_id, 8, 10, null, null, 127),
    (v_game_id, 9, 10, null, null, 153),
    (v_game_id, 10, 10, 6, 1, 170);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 126, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 9, 1, null, 40),
    (v_game_id, 3, 10, null, null, 59),
    (v_game_id, 4, 4, 5, null, 68),
    (v_game_id, 5, 5, 4, null, 77),
    (v_game_id, 6, 9, 0, null, 86),
    (v_game_id, 7, 0, 4, null, 90),
    (v_game_id, 8, 10, null, null, 103),
    (v_game_id, 9, 0, 3, null, 106),
    (v_game_id, 10, 6, 4, 10, 126);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 93, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 5, null, 5),
    (v_game_id, 2, 9, 0, null, 14),
    (v_game_id, 3, 7, 3, null, 24),
    (v_game_id, 4, 0, 5, null, 29),
    (v_game_id, 5, 0, 5, null, 34),
    (v_game_id, 6, 9, 0, null, 43),
    (v_game_id, 7, 9, 1, null, 55),
    (v_game_id, 8, 2, 8, null, 66),
    (v_game_id, 9, 1, 6, null, 73),
    (v_game_id, 10, 1, 9, 10, 93);

  -- Zane Necesario
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Zane Necesario', 'right', 186, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 174, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 2, null, 8),
    (v_game_id, 2, 1, 9, null, 28),
    (v_game_id, 3, 10, null, null, 57),
    (v_game_id, 4, 10, null, null, 77),
    (v_game_id, 5, 9, 1, null, 95),
    (v_game_id, 6, 8, 2, null, 114),
    (v_game_id, 7, 9, 1, null, 131),
    (v_game_id, 8, 7, 3, null, 142),
    (v_game_id, 9, 1, 1, null, 144),
    (v_game_id, 10, 10, 10, 10, 174);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 120, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 0, null, 6),
    (v_game_id, 2, 6, 2, null, 14),
    (v_game_id, 3, 2, 6, null, 22),
    (v_game_id, 4, 4, 6, null, 40),
    (v_game_id, 5, 8, 1, null, 49),
    (v_game_id, 6, 0, 9, null, 58),
    (v_game_id, 7, 8, 2, null, 74),
    (v_game_id, 8, 6, 1, null, 81),
    (v_game_id, 9, 5, 5, null, 100),
    (v_game_id, 10, 9, 1, 10, 120);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 146, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 10),
    (v_game_id, 2, 0, 9, null, 19),
    (v_game_id, 3, 0, 4, null, 23),
    (v_game_id, 4, 10, null, null, 43),
    (v_game_id, 5, 7, 3, null, 59),
    (v_game_id, 6, 6, 4, null, 79),
    (v_game_id, 7, 10, null, null, 109),
    (v_game_id, 8, 10, null, null, 130),
    (v_game_id, 9, 10, null, null, 143),
    (v_game_id, 10, 1, 2, null, 146);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 158, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 6, null, 9),
    (v_game_id, 2, 3, 0, null, 12),
    (v_game_id, 3, 6, 4, null, 32),
    (v_game_id, 4, 10, null, null, 52),
    (v_game_id, 5, 4, 6, null, 70),
    (v_game_id, 6, 8, 2, null, 90),
    (v_game_id, 7, 10, null, null, 112),
    (v_game_id, 8, 10, null, null, 132),
    (v_game_id, 9, 2, 8, null, 149),
    (v_game_id, 10, 7, 2, null, 158);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 136, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 18),
    (v_game_id, 2, 8, 2, null, 38),
    (v_game_id, 3, 10, null, null, 56),
    (v_game_id, 4, 8, 0, null, 64),
    (v_game_id, 5, 7, 3, null, 82),
    (v_game_id, 6, 8, 2, null, 99),
    (v_game_id, 7, 7, 2, null, 108),
    (v_game_id, 8, 6, 2, null, 116),
    (v_game_id, 9, 10, null, null, 131),
    (v_game_id, 10, 3, 2, null, 136);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 81, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 15),
    (v_game_id, 2, 2, 3, null, 20),
    (v_game_id, 3, 5, 2, null, 27),
    (v_game_id, 4, 1, 4, null, 32),
    (v_game_id, 5, 6, 4, null, 42),
    (v_game_id, 6, 0, 4, null, 46),
    (v_game_id, 7, 1, 9, null, 62),
    (v_game_id, 8, 6, 3, null, 71),
    (v_game_id, 9, 0, 0, null, 71),
    (v_game_id, 10, 2, 8, 0, 81);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 125, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 17),
    (v_game_id, 2, 7, 0, null, 24),
    (v_game_id, 3, 1, 8, null, 33),
    (v_game_id, 4, 1, 2, null, 36),
    (v_game_id, 5, 8, 2, null, 49),
    (v_game_id, 6, 3, 4, null, 56),
    (v_game_id, 7, 7, 3, null, 76),
    (v_game_id, 8, 10, null, null, 96),
    (v_game_id, 9, 3, 7, null, 110),
    (v_game_id, 10, 4, 6, 5, 125);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 164, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 6, 4, null, 38),
    (v_game_id, 3, 8, 1, null, 47),
    (v_game_id, 4, 1, 2, null, 50),
    (v_game_id, 5, 10, null, null, 80),
    (v_game_id, 6, 10, null, null, 100),
    (v_game_id, 7, 10, null, null, 120),
    (v_game_id, 8, 0, 10, null, 140),
    (v_game_id, 9, 10, null, null, 157),
    (v_game_id, 10, 4, 3, null, 164);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 119, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 0, null, 6),
    (v_game_id, 2, 10, null, null, 26),
    (v_game_id, 3, 6, 4, null, 41),
    (v_game_id, 4, 5, 5, null, 58),
    (v_game_id, 5, 7, 1, null, 66),
    (v_game_id, 6, 9, 0, null, 75),
    (v_game_id, 7, 9, 1, null, 86),
    (v_game_id, 8, 1, 8, null, 95),
    (v_game_id, 9, 3, 5, null, 103),
    (v_game_id, 10, 10, 6, 0, 119);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 165, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 9, 1, null, 40),
    (v_game_id, 3, 10, null, null, 70),
    (v_game_id, 4, 10, null, null, 90),
    (v_game_id, 5, 10, null, null, 106),
    (v_game_id, 6, 0, 6, null, 112),
    (v_game_id, 7, 2, 8, null, 122),
    (v_game_id, 8, 0, 5, null, 127),
    (v_game_id, 9, 7, 3, null, 147),
    (v_game_id, 10, 10, 5, 3, 165);

  -- Aldrin Barbosa
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Aldrin Barbosa', 'right', 202, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 161, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 0, null, 5),
    (v_game_id, 2, 6, 4, null, 25),
    (v_game_id, 3, 10, null, null, 54),
    (v_game_id, 4, 10, null, null, 74),
    (v_game_id, 5, 9, 1, null, 94),
    (v_game_id, 6, 10, null, null, 112),
    (v_game_id, 7, 3, 5, null, 120),
    (v_game_id, 8, 10, null, null, 140),
    (v_game_id, 9, 1, 9, null, 152),
    (v_game_id, 10, 2, 7, null, 161);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 171, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 2, null, 15),
    (v_game_id, 2, 5, 5, null, 26),
    (v_game_id, 3, 1, 9, null, 46),
    (v_game_id, 4, 10, null, null, 65),
    (v_game_id, 5, 8, 1, null, 74),
    (v_game_id, 6, 10, null, null, 94),
    (v_game_id, 7, 7, 3, null, 114),
    (v_game_id, 8, 10, null, null, 134),
    (v_game_id, 9, 6, 4, null, 154),
    (v_game_id, 10, 10, 2, 5, 171);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 153, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 17),
    (v_game_id, 2, 7, 3, null, 37),
    (v_game_id, 3, 10, null, null, 61),
    (v_game_id, 4, 10, null, null, 81),
    (v_game_id, 5, 4, 6, null, 101),
    (v_game_id, 6, 10, null, null, 118),
    (v_game_id, 7, 5, 2, null, 125),
    (v_game_id, 8, 7, 1, null, 133),
    (v_game_id, 9, 10, null, null, 148),
    (v_game_id, 10, 2, 3, null, 153);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 150, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 0, null, 2),
    (v_game_id, 2, 1, 0, null, 3),
    (v_game_id, 3, 4, 6, null, 17),
    (v_game_id, 4, 4, 6, null, 37),
    (v_game_id, 5, 10, null, null, 57),
    (v_game_id, 6, 8, 2, null, 77),
    (v_game_id, 7, 10, null, null, 97),
    (v_game_id, 8, 4, 6, null, 117),
    (v_game_id, 9, 10, null, null, 137),
    (v_game_id, 10, 0, 10, 3, 150);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 126, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 21),
    (v_game_id, 2, 10, null, null, 38),
    (v_game_id, 3, 1, 6, null, 45),
    (v_game_id, 4, 2, 6, null, 53),
    (v_game_id, 5, 4, 4, null, 61),
    (v_game_id, 6, 4, 1, null, 66),
    (v_game_id, 7, 3, 7, null, 86),
    (v_game_id, 8, 10, null, null, 106),
    (v_game_id, 9, 5, 5, null, 121),
    (v_game_id, 10, 5, 0, null, 126);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 110, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 3, null, 4),
    (v_game_id, 2, 10, null, null, 24),
    (v_game_id, 3, 8, 2, null, 42),
    (v_game_id, 4, 8, 1, null, 51),
    (v_game_id, 5, 3, 4, null, 58),
    (v_game_id, 6, 5, 1, null, 64),
    (v_game_id, 7, 0, 3, null, 67),
    (v_game_id, 8, 10, null, null, 85),
    (v_game_id, 9, 5, 3, null, 93),
    (v_game_id, 10, 10, 0, 7, 110);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 155, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 12),
    (v_game_id, 2, 2, 3, null, 17),
    (v_game_id, 3, 10, null, null, 37),
    (v_game_id, 4, 7, 3, null, 56),
    (v_game_id, 5, 9, 1, null, 74),
    (v_game_id, 6, 8, 0, null, 82),
    (v_game_id, 7, 10, null, null, 104),
    (v_game_id, 8, 10, null, null, 124),
    (v_game_id, 9, 2, 8, null, 135),
    (v_game_id, 10, 1, 9, 10, 155);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 159, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 1, 9, null, 25),
    (v_game_id, 3, 6, 4, null, 45),
    (v_game_id, 4, 10, null, null, 64),
    (v_game_id, 5, 7, 2, null, 73),
    (v_game_id, 6, 10, null, null, 93),
    (v_game_id, 7, 9, 1, null, 113),
    (v_game_id, 8, 10, null, null, 132),
    (v_game_id, 9, 8, 1, null, 141),
    (v_game_id, 10, 10, 6, 2, 159);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 125, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 10),
    (v_game_id, 2, 0, 9, null, 19),
    (v_game_id, 3, 0, 10, null, 38),
    (v_game_id, 4, 9, 1, null, 57),
    (v_game_id, 5, 9, 0, null, 66),
    (v_game_id, 6, 6, 3, null, 75),
    (v_game_id, 7, 10, null, null, 95),
    (v_game_id, 8, 5, 5, null, 107),
    (v_game_id, 9, 2, 8, null, 119),
    (v_game_id, 10, 2, 4, null, 125);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 126, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 2, null, 6),
    (v_game_id, 2, 10, null, null, 21),
    (v_game_id, 3, 5, 0, null, 26),
    (v_game_id, 4, 3, 1, null, 30),
    (v_game_id, 5, 0, 5, null, 35),
    (v_game_id, 6, 1, 9, null, 55),
    (v_game_id, 7, 10, null, null, 73),
    (v_game_id, 8, 7, 1, null, 81),
    (v_game_id, 9, 10, null, null, 107),
    (v_game_id, 10, 10, 6, 3, 126);

  -- Boyet Esmilla
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Boyet Esmilla', 'right', 189, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 106, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 6, 2, null, 26),
    (v_game_id, 3, 8, 0, null, 34),
    (v_game_id, 4, 10, null, null, 50),
    (v_game_id, 5, 5, 1, null, 56),
    (v_game_id, 6, 3, 7, null, 70),
    (v_game_id, 7, 4, 5, null, 79),
    (v_game_id, 8, 10, null, null, 91),
    (v_game_id, 9, 1, 1, null, 93),
    (v_game_id, 10, 7, 3, 3, 106);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 131, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 3, 6, null, 28),
    (v_game_id, 3, 3, 1, null, 32),
    (v_game_id, 4, 3, 4, null, 39),
    (v_game_id, 5, 6, 4, null, 52),
    (v_game_id, 6, 3, 7, null, 65),
    (v_game_id, 7, 3, 7, null, 85),
    (v_game_id, 8, 10, null, null, 109),
    (v_game_id, 9, 10, null, null, 125),
    (v_game_id, 10, 4, 2, null, 131);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 115, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 0, null, 1),
    (v_game_id, 2, 4, 3, null, 8),
    (v_game_id, 3, 8, 2, null, 28),
    (v_game_id, 4, 10, null, null, 49),
    (v_game_id, 5, 10, null, null, 63),
    (v_game_id, 6, 1, 3, null, 67),
    (v_game_id, 7, 1, 9, null, 87),
    (v_game_id, 8, 10, null, null, 105),
    (v_game_id, 9, 8, 0, null, 113),
    (v_game_id, 10, 2, 0, null, 115);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 157, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 20),
    (v_game_id, 2, 10, null, null, 50),
    (v_game_id, 3, 10, null, null, 72),
    (v_game_id, 4, 10, null, null, 92),
    (v_game_id, 5, 2, 8, null, 102),
    (v_game_id, 6, 0, 10, null, 117),
    (v_game_id, 7, 5, 5, null, 132),
    (v_game_id, 8, 5, 3, null, 140),
    (v_game_id, 9, 7, 2, null, 149),
    (v_game_id, 10, 4, 4, null, 157);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 108, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 7, 1, null, 26),
    (v_game_id, 3, 3, 4, null, 33),
    (v_game_id, 4, 9, 0, null, 42),
    (v_game_id, 5, 2, 2, null, 46),
    (v_game_id, 6, 8, 2, null, 60),
    (v_game_id, 7, 4, 3, null, 67),
    (v_game_id, 8, 0, 2, null, 69),
    (v_game_id, 9, 10, null, null, 93),
    (v_game_id, 10, 10, 4, 1, 108);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 144, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 2, null, 20),
    (v_game_id, 2, 10, null, null, 34),
    (v_game_id, 3, 3, 1, null, 38),
    (v_game_id, 4, 1, 9, null, 57),
    (v_game_id, 5, 9, 1, null, 76),
    (v_game_id, 6, 9, 1, null, 90),
    (v_game_id, 7, 4, 6, null, 102),
    (v_game_id, 8, 2, 8, null, 113),
    (v_game_id, 9, 1, 4, null, 118),
    (v_game_id, 10, 10, 10, 6, 144);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 186, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 2, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 4, 6, null, 52),
    (v_game_id, 4, 2, 8, null, 70),
    (v_game_id, 5, 8, 2, null, 90),
    (v_game_id, 6, 10, null, null, 110),
    (v_game_id, 7, 7, 3, null, 130),
    (v_game_id, 8, 10, null, null, 148),
    (v_game_id, 9, 7, 1, null, 156),
    (v_game_id, 10, 10, 10, 10, 186);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 137, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 8, 0, null, 17),
    (v_game_id, 3, 8, 2, null, 35),
    (v_game_id, 4, 8, 2, null, 52),
    (v_game_id, 5, 7, 2, null, 61),
    (v_game_id, 6, 4, 6, null, 81),
    (v_game_id, 7, 10, null, null, 101),
    (v_game_id, 8, 5, 5, null, 119),
    (v_game_id, 9, 8, 2, null, 130),
    (v_game_id, 10, 1, 6, null, 137);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 167, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 3, 7, null, 34),
    (v_game_id, 3, 4, 6, null, 48),
    (v_game_id, 4, 4, 3, null, 55),
    (v_game_id, 5, 9, 1, null, 73),
    (v_game_id, 6, 8, 2, null, 93),
    (v_game_id, 7, 10, null, null, 113),
    (v_game_id, 8, 10, null, null, 133),
    (v_game_id, 9, 0, 10, null, 153),
    (v_game_id, 10, 10, 0, 4, 167);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 189, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 3, null, 7),
    (v_game_id, 2, 10, null, null, 27),
    (v_game_id, 3, 7, 3, null, 41),
    (v_game_id, 4, 4, 2, null, 47),
    (v_game_id, 5, 9, 1, null, 67),
    (v_game_id, 6, 10, null, null, 97),
    (v_game_id, 7, 10, null, null, 127),
    (v_game_id, 8, 10, null, null, 156),
    (v_game_id, 9, 10, null, null, 176),
    (v_game_id, 10, 9, 1, 3, 189);

  -- Cris Turner
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Cris Turner', 'right', 171, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 103, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 0, null, 3),
    (v_game_id, 2, 0, 4, null, 7),
    (v_game_id, 3, 6, 3, null, 16),
    (v_game_id, 4, 4, 6, null, 29),
    (v_game_id, 5, 3, 7, null, 49),
    (v_game_id, 6, 10, null, null, 67),
    (v_game_id, 7, 6, 2, null, 75),
    (v_game_id, 8, 4, 6, null, 92),
    (v_game_id, 9, 7, 0, null, 99),
    (v_game_id, 10, 3, 1, null, 103);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 132, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 16),
    (v_game_id, 2, 6, 4, null, 33),
    (v_game_id, 3, 7, 3, null, 52),
    (v_game_id, 4, 9, 0, null, 61),
    (v_game_id, 5, 7, 3, null, 80),
    (v_game_id, 6, 9, 1, null, 94),
    (v_game_id, 7, 4, 2, null, 100),
    (v_game_id, 8, 2, 8, null, 117),
    (v_game_id, 9, 7, 3, null, 128),
    (v_game_id, 10, 1, 3, null, 132);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 102, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 3, 5, null, 26),
    (v_game_id, 3, 0, 10, null, 43),
    (v_game_id, 4, 7, 3, null, 59),
    (v_game_id, 5, 6, 1, null, 66),
    (v_game_id, 6, 2, 0, null, 68),
    (v_game_id, 7, 2, 8, null, 81),
    (v_game_id, 8, 3, 7, null, 91),
    (v_game_id, 9, 0, 4, null, 95),
    (v_game_id, 10, 7, 0, null, 102);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 136, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 18),
    (v_game_id, 2, 8, 2, null, 38),
    (v_game_id, 3, 10, null, null, 53),
    (v_game_id, 4, 0, 5, null, 58),
    (v_game_id, 5, 7, 3, null, 77),
    (v_game_id, 6, 9, 1, null, 93),
    (v_game_id, 7, 6, 1, null, 100),
    (v_game_id, 8, 2, 3, null, 105),
    (v_game_id, 9, 8, 2, null, 120),
    (v_game_id, 10, 5, 5, 6, 136);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 137, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 16),
    (v_game_id, 2, 6, 4, null, 36),
    (v_game_id, 3, 10, null, null, 46),
    (v_game_id, 4, 0, 0, null, 46),
    (v_game_id, 5, 0, 1, null, 47),
    (v_game_id, 6, 10, null, null, 77),
    (v_game_id, 7, 10, null, null, 99),
    (v_game_id, 8, 10, null, null, 119),
    (v_game_id, 9, 2, 8, null, 131),
    (v_game_id, 10, 2, 4, null, 137);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 146, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 10),
    (v_game_id, 2, 0, 10, null, 30),
    (v_game_id, 3, 10, null, null, 49),
    (v_game_id, 4, 7, 2, null, 58),
    (v_game_id, 5, 7, 3, null, 78),
    (v_game_id, 6, 10, null, null, 102),
    (v_game_id, 7, 10, null, null, 120),
    (v_game_id, 8, 4, 4, null, 128),
    (v_game_id, 9, 7, 3, null, 138),
    (v_game_id, 10, 0, 8, null, 146);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 118, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 20),
    (v_game_id, 2, 10, null, null, 38),
    (v_game_id, 3, 1, 7, null, 46),
    (v_game_id, 4, 10, null, null, 59),
    (v_game_id, 5, 2, 1, null, 62),
    (v_game_id, 6, 10, null, null, 78),
    (v_game_id, 7, 3, 3, null, 84),
    (v_game_id, 8, 8, 2, null, 98),
    (v_game_id, 9, 4, 6, null, 112),
    (v_game_id, 10, 4, 2, null, 118);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 146, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 5, null, 8),
    (v_game_id, 2, 7, 2, null, 17),
    (v_game_id, 3, 2, 8, null, 37),
    (v_game_id, 4, 10, null, null, 57),
    (v_game_id, 5, 9, 1, null, 74),
    (v_game_id, 6, 7, 3, null, 88),
    (v_game_id, 7, 4, 6, null, 102),
    (v_game_id, 8, 4, 6, null, 119),
    (v_game_id, 9, 7, 0, null, 126),
    (v_game_id, 10, 2, 8, 10, 146);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 166, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 14),
    (v_game_id, 2, 4, 0, null, 18),
    (v_game_id, 3, 10, null, null, 48),
    (v_game_id, 4, 10, null, null, 76),
    (v_game_id, 5, 10, null, null, 96),
    (v_game_id, 6, 8, 2, null, 113),
    (v_game_id, 7, 7, 3, null, 132),
    (v_game_id, 8, 9, 0, null, 141),
    (v_game_id, 9, 0, 5, null, 146),
    (v_game_id, 10, 10, 9, 1, 166);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 127, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 0, null, 7),
    (v_game_id, 2, 9, 1, null, 19),
    (v_game_id, 3, 2, 8, null, 37),
    (v_game_id, 4, 8, 2, null, 52),
    (v_game_id, 5, 5, 1, null, 58),
    (v_game_id, 6, 10, null, null, 78),
    (v_game_id, 7, 6, 4, null, 92),
    (v_game_id, 8, 4, 6, null, 110),
    (v_game_id, 9, 8, 1, null, 119),
    (v_game_id, 10, 3, 5, null, 127);

  -- Dindo Madrid
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Dindo Madrid', 'right', 192, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 142, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 19),
    (v_game_id, 2, 9, 0, null, 28),
    (v_game_id, 3, 7, 3, null, 48),
    (v_game_id, 4, 10, null, null, 66),
    (v_game_id, 5, 6, 2, null, 74),
    (v_game_id, 6, 1, 2, null, 77),
    (v_game_id, 7, 10, null, null, 102),
    (v_game_id, 8, 10, null, null, 117),
    (v_game_id, 9, 5, 0, null, 122),
    (v_game_id, 10, 3, 7, 10, 142);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 165, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 15),
    (v_game_id, 2, 5, 5, null, 27),
    (v_game_id, 3, 2, 8, null, 47),
    (v_game_id, 4, 10, null, null, 73),
    (v_game_id, 5, 10, null, null, 90),
    (v_game_id, 6, 6, 1, null, 97),
    (v_game_id, 7, 9, 1, null, 116),
    (v_game_id, 8, 9, 1, null, 130),
    (v_game_id, 9, 4, 6, null, 149),
    (v_game_id, 10, 9, 1, 6, 165);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 166, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 13),
    (v_game_id, 2, 3, 7, null, 33),
    (v_game_id, 3, 10, null, null, 52),
    (v_game_id, 4, 9, 0, null, 61),
    (v_game_id, 5, 10, null, null, 90),
    (v_game_id, 6, 10, null, null, 110),
    (v_game_id, 7, 9, 1, null, 130),
    (v_game_id, 8, 10, null, null, 146),
    (v_game_id, 9, 2, 4, null, 152),
    (v_game_id, 10, 0, 10, 4, 166);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 113, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 5, null, 8),
    (v_game_id, 2, 1, 1, null, 10),
    (v_game_id, 3, 10, null, null, 30),
    (v_game_id, 4, 2, 8, null, 49),
    (v_game_id, 5, 9, 1, null, 59),
    (v_game_id, 6, 0, 8, null, 67),
    (v_game_id, 7, 10, null, null, 83),
    (v_game_id, 8, 5, 1, null, 89),
    (v_game_id, 9, 1, 9, null, 100),
    (v_game_id, 10, 1, 9, 3, 113);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 118, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 6, null, 7),
    (v_game_id, 2, 7, 3, null, 19),
    (v_game_id, 3, 2, 8, null, 39),
    (v_game_id, 4, 10, null, null, 65),
    (v_game_id, 5, 10, null, null, 82),
    (v_game_id, 6, 6, 1, null, 89),
    (v_game_id, 7, 2, 1, null, 92),
    (v_game_id, 8, 4, 1, null, 97),
    (v_game_id, 9, 4, 0, null, 101),
    (v_game_id, 10, 8, 2, 7, 118);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 135, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 2, null, 5),
    (v_game_id, 2, 5, 5, null, 18),
    (v_game_id, 3, 3, 7, null, 34),
    (v_game_id, 4, 6, 3, null, 43),
    (v_game_id, 5, 9, 0, null, 52),
    (v_game_id, 6, 1, 9, null, 68),
    (v_game_id, 7, 6, 3, null, 77),
    (v_game_id, 8, 7, 3, null, 95),
    (v_game_id, 9, 8, 2, null, 115),
    (v_game_id, 10, 10, 8, 2, 135);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 132, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 1, null, 3),
    (v_game_id, 2, 7, 3, null, 22),
    (v_game_id, 3, 9, 1, null, 35),
    (v_game_id, 4, 3, 7, null, 54),
    (v_game_id, 5, 9, 0, null, 63),
    (v_game_id, 6, 10, null, null, 83),
    (v_game_id, 7, 6, 4, null, 95),
    (v_game_id, 8, 2, 7, null, 104),
    (v_game_id, 9, 4, 5, null, 113),
    (v_game_id, 10, 10, 7, 2, 132);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 172, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 10, null, null, 34),
    (v_game_id, 3, 10, null, null, 54),
    (v_game_id, 4, 5, 5, null, 74),
    (v_game_id, 5, 10, null, null, 92),
    (v_game_id, 6, 8, 0, null, 100),
    (v_game_id, 7, 6, 4, null, 120),
    (v_game_id, 8, 10, null, null, 140),
    (v_game_id, 9, 9, 1, null, 156),
    (v_game_id, 10, 6, 4, 6, 172);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 132, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 14),
    (v_game_id, 2, 4, 6, null, 34),
    (v_game_id, 3, 10, null, null, 54),
    (v_game_id, 4, 10, null, null, 74),
    (v_game_id, 5, 0, 10, null, 91),
    (v_game_id, 6, 7, 0, null, 98),
    (v_game_id, 7, 1, 6, null, 105),
    (v_game_id, 8, 3, 7, null, 117),
    (v_game_id, 9, 2, 7, null, 126),
    (v_game_id, 10, 5, 1, null, 132);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 130, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 8, 0, null, 17),
    (v_game_id, 3, 1, 9, null, 36),
    (v_game_id, 4, 9, 1, null, 56),
    (v_game_id, 5, 10, null, null, 76),
    (v_game_id, 6, 6, 4, null, 92),
    (v_game_id, 7, 6, 1, null, 99),
    (v_game_id, 8, 1, 5, null, 105),
    (v_game_id, 9, 9, 1, null, 122),
    (v_game_id, 10, 7, 1, null, 130);

  -- Noelle Campos
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Noelle Campos', 'right', 170, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 8)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 174, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 9, null, 20),
    (v_game_id, 2, 10, null, null, 47),
    (v_game_id, 3, 10, null, null, 65),
    (v_game_id, 4, 7, 1, null, 73),
    (v_game_id, 5, 10, null, null, 90),
    (v_game_id, 6, 7, 0, null, 97),
    (v_game_id, 7, 10, null, null, 114),
    (v_game_id, 8, 4, 3, null, 121),
    (v_game_id, 9, 10, null, null, 151),
    (v_game_id, 10, 10, 10, 3, 174);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 232, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 30),
    (v_game_id, 2, 10, null, null, 60),
    (v_game_id, 3, 10, null, null, 90),
    (v_game_id, 4, 10, null, null, 114),
    (v_game_id, 5, 10, null, null, 134),
    (v_game_id, 6, 4, 6, null, 154),
    (v_game_id, 7, 10, null, null, 174),
    (v_game_id, 8, 0, 10, null, 194),
    (v_game_id, 9, 10, null, null, 214),
    (v_game_id, 10, 10, 0, 8, 232);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 160, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 8, 2, null, 33),
    (v_game_id, 3, 3, 7, null, 53),
    (v_game_id, 4, 10, null, null, 77),
    (v_game_id, 5, 10, null, null, 97),
    (v_game_id, 6, 4, 6, null, 113),
    (v_game_id, 7, 6, 4, null, 129),
    (v_game_id, 8, 6, 2, null, 137),
    (v_game_id, 9, 2, 1, null, 140),
    (v_game_id, 10, 6, 4, 10, 160);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 141, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 17),
    (v_game_id, 2, 7, 3, null, 28),
    (v_game_id, 3, 1, 9, null, 44),
    (v_game_id, 4, 6, 4, null, 64),
    (v_game_id, 5, 10, null, null, 84),
    (v_game_id, 6, 10, null, null, 94),
    (v_game_id, 7, 0, 0, null, 94),
    (v_game_id, 8, 1, 9, null, 105),
    (v_game_id, 9, 1, 9, null, 122),
    (v_game_id, 10, 7, 3, 9, 141);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 150, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 20),
    (v_game_id, 2, 10, null, null, 37),
    (v_game_id, 3, 3, 4, null, 44),
    (v_game_id, 4, 10, null, null, 64),
    (v_game_id, 5, 0, 10, null, 84),
    (v_game_id, 6, 10, null, null, 104),
    (v_game_id, 7, 8, 2, null, 114),
    (v_game_id, 8, 0, 5, null, 119),
    (v_game_id, 9, 2, 8, null, 130),
    (v_game_id, 10, 1, 9, 10, 150);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 109, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 16),
    (v_game_id, 2, 6, 4, null, 32),
    (v_game_id, 3, 6, 0, null, 38),
    (v_game_id, 4, 5, 0, null, 43),
    (v_game_id, 5, 0, 10, null, 55),
    (v_game_id, 6, 2, 1, null, 58),
    (v_game_id, 7, 2, 8, null, 76),
    (v_game_id, 8, 8, 2, null, 93),
    (v_game_id, 9, 7, 2, null, 102),
    (v_game_id, 10, 7, 0, null, 109);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 128, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 9, null, 19),
    (v_game_id, 2, 9, 1, null, 36),
    (v_game_id, 3, 7, 3, null, 46),
    (v_game_id, 4, 0, 4, null, 50),
    (v_game_id, 5, 0, 9, null, 59),
    (v_game_id, 6, 6, 4, null, 77),
    (v_game_id, 7, 8, 0, null, 85),
    (v_game_id, 8, 7, 1, null, 93),
    (v_game_id, 9, 1, 9, null, 108),
    (v_game_id, 10, 5, 5, 10, 128);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 130, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 5, 3, null, 26),
    (v_game_id, 3, 9, 1, null, 46),
    (v_game_id, 4, 10, null, null, 66),
    (v_game_id, 5, 4, 6, null, 76),
    (v_game_id, 6, 0, 2, null, 78),
    (v_game_id, 7, 3, 5, null, 86),
    (v_game_id, 8, 7, 0, null, 93),
    (v_game_id, 9, 10, null, null, 113),
    (v_game_id, 10, 4, 6, 7, 130);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 86, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 4, null, 5),
    (v_game_id, 2, 8, 2, null, 20),
    (v_game_id, 3, 5, 1, null, 26),
    (v_game_id, 4, 5, 5, null, 36),
    (v_game_id, 5, 0, 0, null, 36),
    (v_game_id, 6, 7, 3, null, 48),
    (v_game_id, 7, 2, 3, null, 53),
    (v_game_id, 8, 8, 2, null, 69),
    (v_game_id, 9, 6, 4, null, 81),
    (v_game_id, 10, 2, 3, null, 86);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 123, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 0, 10, null, 31),
    (v_game_id, 3, 1, 3, null, 35),
    (v_game_id, 4, 2, 8, null, 46),
    (v_game_id, 5, 1, 4, null, 51),
    (v_game_id, 6, 10, null, null, 73),
    (v_game_id, 7, 10, null, null, 91),
    (v_game_id, 8, 2, 6, null, 99),
    (v_game_id, 9, 5, 1, null, 105),
    (v_game_id, 10, 6, 4, 8, 123);

  -- Eman Nepomuceno
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Eman Nepomuceno', 'right', 169, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 141, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 0, 10, null, 40),
    (v_game_id, 3, 10, null, null, 59),
    (v_game_id, 4, 9, 0, null, 68),
    (v_game_id, 5, 10, null, null, 91),
    (v_game_id, 6, 10, null, null, 108),
    (v_game_id, 7, 3, 4, null, 115),
    (v_game_id, 8, 4, 5, null, 124),
    (v_game_id, 9, 5, 4, null, 133),
    (v_game_id, 10, 1, 7, null, 141);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 107, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 10),
    (v_game_id, 2, 0, 0, null, 10),
    (v_game_id, 3, 10, null, null, 28),
    (v_game_id, 4, 5, 3, null, 36),
    (v_game_id, 5, 6, 4, null, 49),
    (v_game_id, 6, 3, 1, null, 53),
    (v_game_id, 7, 10, null, null, 73),
    (v_game_id, 8, 3, 7, null, 85),
    (v_game_id, 9, 2, 8, null, 97),
    (v_game_id, 10, 2, 8, 0, 107);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 123, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 9, null, 9),
    (v_game_id, 2, 10, null, null, 23),
    (v_game_id, 3, 0, 4, null, 27),
    (v_game_id, 4, 9, 0, null, 36),
    (v_game_id, 5, 5, 5, null, 54),
    (v_game_id, 6, 8, 2, null, 72),
    (v_game_id, 7, 8, 2, null, 88),
    (v_game_id, 8, 6, 3, null, 97),
    (v_game_id, 9, 10, null, null, 115),
    (v_game_id, 10, 8, 0, null, 123);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 147, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 8, 0, null, 8),
    (v_game_id, 2, 10, null, null, 28),
    (v_game_id, 3, 3, 7, null, 48),
    (v_game_id, 4, 10, null, null, 69),
    (v_game_id, 5, 10, null, null, 88),
    (v_game_id, 6, 1, 8, null, 97),
    (v_game_id, 7, 8, 2, null, 117),
    (v_game_id, 8, 10, null, null, 135),
    (v_game_id, 9, 8, 0, null, 143),
    (v_game_id, 10, 4, 0, null, 147);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 131, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 7, null, 7),
    (v_game_id, 2, 10, null, null, 26),
    (v_game_id, 3, 0, 9, null, 35),
    (v_game_id, 4, 10, null, null, 55),
    (v_game_id, 5, 8, 2, null, 70),
    (v_game_id, 6, 5, 3, null, 78),
    (v_game_id, 7, 7, 2, null, 87),
    (v_game_id, 8, 2, 8, null, 107),
    (v_game_id, 9, 10, null, null, 124),
    (v_game_id, 10, 0, 7, null, 131);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 170, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 19),
    (v_game_id, 2, 9, 0, null, 28),
    (v_game_id, 3, 9, 0, null, 37),
    (v_game_id, 4, 2, 8, null, 53),
    (v_game_id, 5, 6, 4, null, 73),
    (v_game_id, 6, 10, null, null, 97),
    (v_game_id, 7, 10, null, null, 117),
    (v_game_id, 8, 4, 6, null, 137),
    (v_game_id, 9, 10, null, null, 157),
    (v_game_id, 10, 8, 2, 3, 170);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 143, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 0, null, 6),
    (v_game_id, 2, 10, null, null, 33),
    (v_game_id, 3, 10, null, null, 53),
    (v_game_id, 4, 7, 3, null, 71),
    (v_game_id, 5, 8, 1, null, 80),
    (v_game_id, 6, 10, null, null, 95),
    (v_game_id, 7, 1, 4, null, 100),
    (v_game_id, 8, 2, 1, null, 103),
    (v_game_id, 9, 10, null, null, 123),
    (v_game_id, 10, 3, 7, 10, 143);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 108, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 5, 5, null, 30),
    (v_game_id, 3, 0, 9, null, 39),
    (v_game_id, 4, 4, 6, null, 52),
    (v_game_id, 5, 3, 7, null, 70),
    (v_game_id, 6, 8, 0, null, 78),
    (v_game_id, 7, 8, 1, null, 87),
    (v_game_id, 8, 0, 4, null, 91),
    (v_game_id, 9, 9, 0, null, 100),
    (v_game_id, 10, 8, 0, null, 108);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 99, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 12),
    (v_game_id, 2, 2, 8, null, 23),
    (v_game_id, 3, 1, 2, null, 26),
    (v_game_id, 4, 3, 2, null, 31),
    (v_game_id, 5, 9, 0, null, 40),
    (v_game_id, 6, 5, 2, null, 47),
    (v_game_id, 7, 5, 5, null, 67),
    (v_game_id, 8, 10, null, null, 84),
    (v_game_id, 9, 1, 6, null, 91),
    (v_game_id, 10, 3, 5, null, 99);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 118, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 9, null, 15),
    (v_game_id, 2, 5, 5, null, 31),
    (v_game_id, 3, 6, 3, null, 40),
    (v_game_id, 4, 5, 5, null, 52),
    (v_game_id, 5, 2, 8, null, 65),
    (v_game_id, 6, 3, 0, null, 68),
    (v_game_id, 7, 7, 3, null, 80),
    (v_game_id, 8, 2, 7, null, 89),
    (v_game_id, 9, 9, 0, null, 98),
    (v_game_id, 10, 1, 9, 10, 118);

  -- Fito De Guzman
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Fito De Guzman', 'right', 195, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 111, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 10, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 4, 6, null, 51),
    (v_game_id, 4, 1, 5, null, 57),
    (v_game_id, 5, 8, 2, null, 76),
    (v_game_id, 6, 9, 0, null, 85),
    (v_game_id, 7, 0, 2, null, 87),
    (v_game_id, 8, 0, 8, null, 95),
    (v_game_id, 9, 7, 3, null, 107),
    (v_game_id, 10, 2, 2, null, 111);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 123, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 9, null, 18),
    (v_game_id, 2, 8, 1, null, 27),
    (v_game_id, 3, 2, 8, null, 45),
    (v_game_id, 4, 8, 2, null, 61),
    (v_game_id, 5, 6, 1, null, 68),
    (v_game_id, 6, 3, 7, null, 80),
    (v_game_id, 7, 2, 6, null, 88),
    (v_game_id, 8, 10, null, null, 108),
    (v_game_id, 9, 1, 9, null, 120),
    (v_game_id, 10, 2, 1, null, 123);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 128, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 3, null, 7),
    (v_game_id, 2, 1, 9, null, 22),
    (v_game_id, 3, 5, 4, null, 31),
    (v_game_id, 4, 7, 3, null, 51),
    (v_game_id, 5, 10, null, null, 71),
    (v_game_id, 6, 9, 1, null, 88),
    (v_game_id, 7, 7, 1, null, 96),
    (v_game_id, 8, 1, 9, null, 116),
    (v_game_id, 9, 10, null, null, 127),
    (v_game_id, 10, 1, 0, null, 128);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 83, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 1, null, 5),
    (v_game_id, 2, 6, 3, null, 14),
    (v_game_id, 3, 4, 3, null, 21),
    (v_game_id, 4, 7, 3, null, 31),
    (v_game_id, 5, 0, 9, null, 40),
    (v_game_id, 6, 2, 3, null, 45),
    (v_game_id, 7, 9, 0, null, 54),
    (v_game_id, 8, 1, 1, null, 56),
    (v_game_id, 9, 8, 2, null, 72),
    (v_game_id, 10, 6, 4, 1, 83);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 120, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 3, null, 8),
    (v_game_id, 2, 7, 3, null, 20),
    (v_game_id, 3, 2, 8, null, 33),
    (v_game_id, 4, 3, 7, null, 51),
    (v_game_id, 5, 8, 1, null, 60),
    (v_game_id, 6, 4, 5, null, 69),
    (v_game_id, 7, 2, 7, null, 78),
    (v_game_id, 8, 10, null, null, 94),
    (v_game_id, 9, 4, 2, null, 100),
    (v_game_id, 10, 10, 0, 10, 120);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 81, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 4, null, 12),
    (v_game_id, 2, 2, 6, null, 20),
    (v_game_id, 3, 9, 1, null, 30),
    (v_game_id, 4, 0, 0, null, 30),
    (v_game_id, 5, 2, 3, null, 35),
    (v_game_id, 6, 0, 1, null, 36),
    (v_game_id, 7, 1, 2, null, 39),
    (v_game_id, 8, 9, 0, null, 48),
    (v_game_id, 9, 9, 1, null, 68),
    (v_game_id, 10, 10, 3, 0, 81);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 116, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 5, null, 9),
    (v_game_id, 2, 9, 1, null, 29),
    (v_game_id, 3, 10, null, null, 48),
    (v_game_id, 4, 1, 8, null, 57),
    (v_game_id, 5, 0, 10, null, 67),
    (v_game_id, 6, 0, 5, null, 72),
    (v_game_id, 7, 1, 6, null, 79),
    (v_game_id, 8, 4, 5, null, 88),
    (v_game_id, 9, 10, null, null, 107),
    (v_game_id, 10, 8, 1, null, 116);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 151, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 29),
    (v_game_id, 2, 10, null, null, 49),
    (v_game_id, 3, 9, 1, null, 69),
    (v_game_id, 4, 10, null, null, 90),
    (v_game_id, 5, 10, null, null, 101),
    (v_game_id, 6, 1, 0, null, 102),
    (v_game_id, 7, 10, null, null, 122),
    (v_game_id, 8, 1, 9, null, 135),
    (v_game_id, 9, 3, 7, null, 147),
    (v_game_id, 10, 2, 2, null, 151);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 154, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 1, null, 4),
    (v_game_id, 2, 7, 3, null, 17),
    (v_game_id, 3, 3, 7, null, 37),
    (v_game_id, 4, 10, null, null, 64),
    (v_game_id, 5, 10, null, null, 84),
    (v_game_id, 6, 7, 3, null, 102),
    (v_game_id, 7, 8, 2, null, 112),
    (v_game_id, 8, 0, 10, null, 123),
    (v_game_id, 9, 1, 9, null, 141),
    (v_game_id, 10, 8, 2, 3, 154);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 104, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 3, null, 5),
    (v_game_id, 2, 4, 0, null, 9),
    (v_game_id, 3, 8, 2, null, 19),
    (v_game_id, 4, 0, 9, null, 28),
    (v_game_id, 5, 5, 5, null, 40),
    (v_game_id, 6, 2, 8, null, 59),
    (v_game_id, 7, 9, 0, null, 68),
    (v_game_id, 8, 1, 9, null, 85),
    (v_game_id, 9, 7, 3, null, 98),
    (v_game_id, 10, 3, 3, null, 104);

  -- Gary Sia
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Gary Sia', 'right', 194, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 133, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 11),
    (v_game_id, 2, 1, 4, null, 16),
    (v_game_id, 3, 10, null, null, 32),
    (v_game_id, 4, 5, 1, null, 38),
    (v_game_id, 5, 2, 8, null, 57),
    (v_game_id, 6, 9, 1, null, 73),
    (v_game_id, 7, 6, 4, null, 85),
    (v_game_id, 8, 2, 8, null, 105),
    (v_game_id, 9, 10, null, null, 124),
    (v_game_id, 10, 9, 0, null, 133);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 153, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 2, null, 8),
    (v_game_id, 2, 5, 5, null, 27),
    (v_game_id, 3, 9, 0, null, 36),
    (v_game_id, 4, 10, null, null, 66),
    (v_game_id, 5, 10, null, null, 87),
    (v_game_id, 6, 10, null, null, 102),
    (v_game_id, 7, 1, 4, null, 107),
    (v_game_id, 8, 3, 5, null, 115),
    (v_game_id, 9, 7, 3, null, 135),
    (v_game_id, 10, 10, 8, 0, 153);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 164, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 17),
    (v_game_id, 2, 7, 0, null, 24),
    (v_game_id, 3, 10, null, null, 37),
    (v_game_id, 4, 0, 3, null, 40),
    (v_game_id, 5, 6, 2, null, 48),
    (v_game_id, 6, 10, null, null, 78),
    (v_game_id, 7, 10, null, null, 108),
    (v_game_id, 8, 10, null, null, 136),
    (v_game_id, 9, 10, null, null, 155),
    (v_game_id, 10, 8, 1, null, 164);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 113, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 9, 0, null, 28),
    (v_game_id, 3, 6, 0, null, 34),
    (v_game_id, 4, 0, 0, null, 34),
    (v_game_id, 5, 3, 0, null, 37),
    (v_game_id, 6, 10, null, null, 63),
    (v_game_id, 7, 10, null, null, 80),
    (v_game_id, 8, 6, 1, null, 87),
    (v_game_id, 9, 6, 4, null, 98),
    (v_game_id, 10, 1, 9, 5, 113);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 106, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 11),
    (v_game_id, 2, 1, 9, null, 29),
    (v_game_id, 3, 8, 1, null, 38),
    (v_game_id, 4, 7, 0, null, 45),
    (v_game_id, 5, 8, 2, null, 65),
    (v_game_id, 6, 10, null, null, 81),
    (v_game_id, 7, 0, 6, null, 87),
    (v_game_id, 8, 3, 1, null, 91),
    (v_game_id, 9, 1, 4, null, 96),
    (v_game_id, 10, 10, 0, 0, 106);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 148, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 0, null, 1),
    (v_game_id, 2, 4, 3, null, 8),
    (v_game_id, 3, 10, null, null, 26),
    (v_game_id, 4, 4, 4, null, 34),
    (v_game_id, 5, 6, 1, null, 41),
    (v_game_id, 6, 10, null, null, 70),
    (v_game_id, 7, 10, null, null, 89),
    (v_game_id, 8, 9, 0, null, 98),
    (v_game_id, 9, 7, 3, null, 118),
    (v_game_id, 10, 10, 10, 10, 148);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 130, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 6, null, 17),
    (v_game_id, 2, 7, 3, null, 34),
    (v_game_id, 3, 7, 0, null, 41),
    (v_game_id, 4, 10, null, null, 55),
    (v_game_id, 5, 4, 0, null, 59),
    (v_game_id, 6, 6, 4, null, 76),
    (v_game_id, 7, 7, 0, null, 83),
    (v_game_id, 8, 10, null, null, 104),
    (v_game_id, 9, 10, null, null, 122),
    (v_game_id, 10, 1, 7, null, 130);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 140, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 1, 9, null, 40),
    (v_game_id, 3, 10, null, null, 56),
    (v_game_id, 4, 6, 0, null, 62),
    (v_game_id, 5, 6, 4, null, 75),
    (v_game_id, 6, 3, 0, null, 78),
    (v_game_id, 7, 10, null, null, 95),
    (v_game_id, 8, 4, 3, null, 102),
    (v_game_id, 9, 0, 10, null, 121),
    (v_game_id, 10, 9, 1, 9, 140);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 167, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 7, 3, null, 40),
    (v_game_id, 3, 10, null, null, 60),
    (v_game_id, 4, 7, 3, null, 78),
    (v_game_id, 5, 8, 0, null, 86),
    (v_game_id, 6, 7, 3, null, 102),
    (v_game_id, 7, 6, 4, null, 122),
    (v_game_id, 8, 10, null, null, 142),
    (v_game_id, 9, 6, 4, null, 156),
    (v_game_id, 10, 4, 6, 1, 167);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 106, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 2, null, 6),
    (v_game_id, 2, 5, 5, null, 18),
    (v_game_id, 3, 2, 8, null, 37),
    (v_game_id, 4, 9, 0, null, 46),
    (v_game_id, 5, 3, 7, null, 63),
    (v_game_id, 6, 7, 3, null, 77),
    (v_game_id, 7, 4, 3, null, 84),
    (v_game_id, 8, 0, 8, null, 92),
    (v_game_id, 9, 5, 0, null, 97),
    (v_game_id, 10, 6, 3, null, 106);

  -- Kassandra Yuson
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Kassandra Yuson', 'right', 197, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 8)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 92, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 2, null, 3),
    (v_game_id, 2, 6, 2, null, 11),
    (v_game_id, 3, 5, 5, null, 23),
    (v_game_id, 4, 2, 2, null, 27),
    (v_game_id, 5, 9, 0, null, 36),
    (v_game_id, 6, 6, 0, null, 42),
    (v_game_id, 7, 7, 0, null, 49),
    (v_game_id, 8, 1, 6, null, 56),
    (v_game_id, 9, 4, 6, null, 75),
    (v_game_id, 10, 9, 1, 7, 92);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 151, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 5, 5, null, 35),
    (v_game_id, 3, 5, 3, null, 43),
    (v_game_id, 4, 7, 3, null, 56),
    (v_game_id, 5, 3, 5, null, 64),
    (v_game_id, 6, 10, null, null, 84),
    (v_game_id, 7, 3, 7, null, 103),
    (v_game_id, 8, 9, 1, null, 116),
    (v_game_id, 9, 3, 7, null, 132),
    (v_game_id, 10, 6, 4, 9, 151);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 104, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 4, null, 8),
    (v_game_id, 2, 7, 3, null, 28),
    (v_game_id, 3, 10, null, null, 43),
    (v_game_id, 4, 2, 3, null, 48),
    (v_game_id, 5, 8, 0, null, 56),
    (v_game_id, 6, 10, null, null, 69),
    (v_game_id, 7, 0, 3, null, 72),
    (v_game_id, 8, 8, 2, null, 82),
    (v_game_id, 9, 0, 2, null, 84),
    (v_game_id, 10, 5, 5, 10, 104);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 96, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 0, null, 5),
    (v_game_id, 2, 10, null, null, 18),
    (v_game_id, 3, 3, 0, null, 21),
    (v_game_id, 4, 1, 9, null, 38),
    (v_game_id, 5, 7, 1, null, 46),
    (v_game_id, 6, 0, 3, null, 49),
    (v_game_id, 7, 0, 6, null, 55),
    (v_game_id, 8, 8, 2, null, 73),
    (v_game_id, 9, 8, 2, null, 85),
    (v_game_id, 10, 2, 8, 1, 96);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 160, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 7, null, 15),
    (v_game_id, 2, 5, 5, null, 34),
    (v_game_id, 3, 9, 1, null, 51),
    (v_game_id, 4, 7, 0, null, 58),
    (v_game_id, 5, 9, 1, null, 78),
    (v_game_id, 6, 10, null, null, 94),
    (v_game_id, 7, 6, 0, null, 100),
    (v_game_id, 8, 10, null, null, 120),
    (v_game_id, 9, 2, 8, null, 140),
    (v_game_id, 10, 10, 5, 5, 160);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 128, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 13),
    (v_game_id, 2, 1, 2, null, 16),
    (v_game_id, 3, 3, 3, null, 22),
    (v_game_id, 4, 7, 3, null, 42),
    (v_game_id, 5, 10, null, null, 62),
    (v_game_id, 6, 0, 10, null, 82),
    (v_game_id, 7, 10, null, null, 98),
    (v_game_id, 8, 2, 4, null, 104),
    (v_game_id, 9, 10, null, null, 121),
    (v_game_id, 10, 4, 3, null, 128);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 126, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 5, null, 7),
    (v_game_id, 2, 6, 0, null, 13),
    (v_game_id, 3, 3, 7, null, 28),
    (v_game_id, 4, 5, 0, null, 33),
    (v_game_id, 5, 10, null, null, 52),
    (v_game_id, 6, 9, 0, null, 61),
    (v_game_id, 7, 9, 0, null, 70),
    (v_game_id, 8, 8, 0, null, 78),
    (v_game_id, 9, 0, 10, null, 98),
    (v_game_id, 10, 10, 10, 8, 126);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 141, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 22),
    (v_game_id, 2, 10, null, null, 39),
    (v_game_id, 3, 2, 5, null, 46),
    (v_game_id, 4, 7, 3, null, 66),
    (v_game_id, 5, 10, null, null, 84),
    (v_game_id, 6, 6, 2, null, 92),
    (v_game_id, 7, 4, 5, null, 101),
    (v_game_id, 8, 4, 6, null, 113),
    (v_game_id, 9, 2, 8, null, 132),
    (v_game_id, 10, 9, 0, null, 141);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 122, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 4, 3, null, 7),
    (v_game_id, 2, 2, 8, null, 27),
    (v_game_id, 3, 10, null, null, 42),
    (v_game_id, 4, 4, 1, null, 47),
    (v_game_id, 5, 8, 0, null, 55),
    (v_game_id, 6, 10, null, null, 74),
    (v_game_id, 7, 2, 7, null, 83),
    (v_game_id, 8, 6, 4, null, 98),
    (v_game_id, 9, 5, 2, null, 105),
    (v_game_id, 10, 3, 7, 7, 122);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 95, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 5, null, 10),
    (v_game_id, 2, 0, 2, null, 12),
    (v_game_id, 3, 5, 1, null, 18),
    (v_game_id, 4, 4, 1, null, 23),
    (v_game_id, 5, 6, 4, null, 40),
    (v_game_id, 6, 7, 1, null, 48),
    (v_game_id, 7, 2, 3, null, 53),
    (v_game_id, 8, 5, 1, null, 59),
    (v_game_id, 9, 3, 7, null, 75),
    (v_game_id, 10, 6, 4, 10, 95);

  -- Henry Alqueza
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Henry Alqueza', 'right', 181, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 164, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 20),
    (v_game_id, 2, 10, null, null, 40),
    (v_game_id, 3, 7, 3, null, 60),
    (v_game_id, 4, 10, null, null, 79),
    (v_game_id, 5, 9, 0, null, 88),
    (v_game_id, 6, 1, 9, null, 102),
    (v_game_id, 7, 4, 4, null, 110),
    (v_game_id, 8, 3, 7, null, 126),
    (v_game_id, 9, 6, 2, null, 134),
    (v_game_id, 10, 10, 10, 10, 164);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 102, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 1, 7, null, 26),
    (v_game_id, 3, 10, null, null, 44),
    (v_game_id, 4, 1, 7, null, 52),
    (v_game_id, 5, 3, 3, null, 58),
    (v_game_id, 6, 7, 3, null, 68),
    (v_game_id, 7, 0, 6, null, 74),
    (v_game_id, 8, 6, 1, null, 81),
    (v_game_id, 9, 1, 9, null, 93),
    (v_game_id, 10, 2, 7, null, 102);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 125, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 6, 2, null, 8),
    (v_game_id, 2, 4, 4, null, 16),
    (v_game_id, 3, 6, 2, null, 24),
    (v_game_id, 4, 6, 4, null, 44),
    (v_game_id, 5, 10, null, null, 65),
    (v_game_id, 6, 10, null, null, 82),
    (v_game_id, 7, 1, 6, null, 89),
    (v_game_id, 8, 7, 3, null, 107),
    (v_game_id, 9, 8, 1, null, 116),
    (v_game_id, 10, 9, 0, null, 125);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 113, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 1, 6, null, 7),
    (v_game_id, 2, 7, 3, null, 22),
    (v_game_id, 3, 5, 1, null, 28),
    (v_game_id, 4, 10, null, null, 54),
    (v_game_id, 5, 10, null, null, 72),
    (v_game_id, 6, 6, 2, null, 80),
    (v_game_id, 7, 2, 2, null, 84),
    (v_game_id, 8, 6, 4, null, 97),
    (v_game_id, 9, 3, 7, null, 108),
    (v_game_id, 10, 1, 4, null, 113);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 144, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 3, null, 16),
    (v_game_id, 2, 6, 2, null, 24),
    (v_game_id, 3, 9, 1, null, 35),
    (v_game_id, 4, 1, 5, null, 41),
    (v_game_id, 5, 5, 4, null, 50),
    (v_game_id, 6, 8, 2, null, 70),
    (v_game_id, 7, 10, null, null, 90),
    (v_game_id, 8, 8, 2, null, 104),
    (v_game_id, 9, 4, 6, null, 124),
    (v_game_id, 10, 10, 6, 4, 144);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 121, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 12),
    (v_game_id, 2, 2, 0, null, 14),
    (v_game_id, 3, 10, null, null, 34),
    (v_game_id, 4, 3, 7, null, 46),
    (v_game_id, 5, 2, 3, null, 51),
    (v_game_id, 6, 0, 9, null, 60),
    (v_game_id, 7, 5, 5, null, 76),
    (v_game_id, 8, 6, 0, null, 82),
    (v_game_id, 9, 1, 9, null, 102),
    (v_game_id, 10, 10, 9, 0, 121);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 125, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 3, 1, null, 4),
    (v_game_id, 2, 3, 1, null, 8),
    (v_game_id, 3, 10, null, null, 28),
    (v_game_id, 4, 5, 5, null, 48),
    (v_game_id, 5, 10, null, null, 68),
    (v_game_id, 6, 4, 6, null, 81),
    (v_game_id, 7, 3, 7, null, 93),
    (v_game_id, 8, 2, 1, null, 96),
    (v_game_id, 9, 9, 0, null, 105),
    (v_game_id, 10, 10, 6, 4, 125);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 142, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 8, null, 20),
    (v_game_id, 2, 10, null, null, 39),
    (v_game_id, 3, 7, 2, null, 48),
    (v_game_id, 4, 8, 2, null, 62),
    (v_game_id, 5, 4, 5, null, 71),
    (v_game_id, 6, 9, 1, null, 88),
    (v_game_id, 7, 7, 3, null, 104),
    (v_game_id, 8, 6, 4, null, 115),
    (v_game_id, 9, 1, 7, null, 123),
    (v_game_id, 10, 2, 8, 9, 142);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 120, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 1, null, 1),
    (v_game_id, 2, 2, 8, null, 20),
    (v_game_id, 3, 9, 1, null, 38),
    (v_game_id, 4, 8, 2, null, 54),
    (v_game_id, 5, 6, 0, null, 60),
    (v_game_id, 6, 10, null, null, 75),
    (v_game_id, 7, 4, 1, null, 80),
    (v_game_id, 8, 2, 5, null, 87),
    (v_game_id, 9, 2, 2, null, 91),
    (v_game_id, 10, 10, 10, 9, 120);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 103, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 2, null, 2),
    (v_game_id, 2, 3, 6, null, 11),
    (v_game_id, 3, 10, null, null, 27),
    (v_game_id, 4, 3, 3, null, 33),
    (v_game_id, 5, 10, null, null, 51),
    (v_game_id, 6, 3, 5, null, 59),
    (v_game_id, 7, 8, 2, null, 77),
    (v_game_id, 8, 8, 1, null, 86),
    (v_game_id, 9, 9, 1, null, 98),
    (v_game_id, 10, 2, 3, null, 103);

  -- Iggy Lichauco
  insert into public.players (full_name, handedness, home_average, created_by)
  values ('Iggy Lichauco', 'right', 181, v_admin_id)
  returning id into v_player_id;
  insert into public.event_players (event_id, player_id, handicap)
  values (v_event_id, v_player_id, 0)
  returning id into v_event_player;
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 1, 138, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 5, 1, null, 6),
    (v_game_id, 2, 4, 6, null, 25),
    (v_game_id, 3, 9, 1, null, 45),
    (v_game_id, 4, 10, null, null, 65),
    (v_game_id, 5, 1, 9, null, 82),
    (v_game_id, 6, 7, 2, null, 91),
    (v_game_id, 7, 3, 7, null, 108),
    (v_game_id, 8, 7, 3, null, 118),
    (v_game_id, 9, 0, 2, null, 120),
    (v_game_id, 10, 4, 6, 8, 138);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 2, 120, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 0, null, 9),
    (v_game_id, 2, 0, 8, null, 17),
    (v_game_id, 3, 7, 3, null, 30),
    (v_game_id, 4, 3, 6, null, 39),
    (v_game_id, 5, 8, 0, null, 47),
    (v_game_id, 6, 1, 7, null, 55),
    (v_game_id, 7, 7, 3, null, 66),
    (v_game_id, 8, 1, 9, null, 85),
    (v_game_id, 9, 9, 1, null, 105),
    (v_game_id, 10, 10, 2, 3, 120);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 3, 145, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 18),
    (v_game_id, 2, 0, 8, null, 26),
    (v_game_id, 3, 5, 5, null, 44),
    (v_game_id, 4, 8, 2, null, 63),
    (v_game_id, 5, 9, 0, null, 72),
    (v_game_id, 6, 3, 7, null, 91),
    (v_game_id, 7, 9, 1, null, 101),
    (v_game_id, 8, 0, 8, null, 109),
    (v_game_id, 9, 2, 8, null, 129),
    (v_game_id, 10, 10, 4, 2, 145);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 4, 185, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 5, 5, null, 38),
    (v_game_id, 3, 8, 2, null, 58),
    (v_game_id, 4, 10, null, null, 88),
    (v_game_id, 5, 10, null, null, 118),
    (v_game_id, 6, 10, null, null, 145),
    (v_game_id, 7, 10, null, null, 165),
    (v_game_id, 8, 7, 3, null, 176),
    (v_game_id, 9, 1, 5, null, 182),
    (v_game_id, 10, 3, 0, null, 185);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 5, 165, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 9, 1, null, 11),
    (v_game_id, 2, 1, 9, null, 25),
    (v_game_id, 3, 4, 6, null, 45),
    (v_game_id, 4, 10, null, null, 64),
    (v_game_id, 5, 2, 7, null, 73),
    (v_game_id, 6, 1, 9, null, 93),
    (v_game_id, 7, 10, null, null, 113),
    (v_game_id, 8, 8, 2, null, 133),
    (v_game_id, 9, 10, null, null, 154),
    (v_game_id, 10, 10, 1, 0, 165);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 6, 177, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 19),
    (v_game_id, 2, 9, 0, null, 28),
    (v_game_id, 3, 10, null, null, 48),
    (v_game_id, 4, 7, 3, null, 67),
    (v_game_id, 5, 9, 1, null, 87),
    (v_game_id, 6, 10, null, null, 107),
    (v_game_id, 7, 8, 2, null, 126),
    (v_game_id, 8, 9, 1, null, 142),
    (v_game_id, 9, 6, 4, null, 160),
    (v_game_id, 10, 8, 2, 7, 177);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 7, 119, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 7, 2, null, 9),
    (v_game_id, 2, 6, 4, null, 23),
    (v_game_id, 3, 4, 6, null, 38),
    (v_game_id, 4, 5, 5, null, 57),
    (v_game_id, 5, 9, 1, null, 74),
    (v_game_id, 6, 7, 2, null, 83),
    (v_game_id, 7, 4, 6, null, 99),
    (v_game_id, 8, 6, 3, null, 108),
    (v_game_id, 9, 4, 0, null, 112),
    (v_game_id, 10, 6, 1, null, 119);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 8, 107, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 2, 7, null, 9),
    (v_game_id, 2, 7, 3, null, 26),
    (v_game_id, 3, 7, 1, null, 34),
    (v_game_id, 4, 8, 1, null, 43),
    (v_game_id, 5, 7, 1, null, 51),
    (v_game_id, 6, 6, 4, null, 63),
    (v_game_id, 7, 2, 8, null, 82),
    (v_game_id, 8, 9, 0, null, 91),
    (v_game_id, 9, 9, 0, null, 100),
    (v_game_id, 10, 5, 2, null, 107);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 9, 140, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 0, 0, null, 0),
    (v_game_id, 2, 10, null, null, 20),
    (v_game_id, 3, 5, 5, null, 37),
    (v_game_id, 4, 7, 0, null, 44),
    (v_game_id, 5, 10, null, null, 61),
    (v_game_id, 6, 4, 3, null, 68),
    (v_game_id, 7, 6, 1, null, 75),
    (v_game_id, 8, 10, null, null, 103),
    (v_game_id, 9, 10, null, null, 123),
    (v_game_id, 10, 8, 2, 7, 140);
  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)
  values (v_session_id, v_event_player, 10, 117, true) returning id into v_game_id;
  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values
    (v_game_id, 1, 10, null, null, 20),
    (v_game_id, 2, 7, 3, null, 34),
    (v_game_id, 3, 4, 6, null, 50),
    (v_game_id, 4, 6, 1, null, 57),
    (v_game_id, 5, 7, 0, null, 64),
    (v_game_id, 6, 6, 4, null, 77),
    (v_game_id, 7, 3, 7, null, 87),
    (v_game_id, 8, 0, 10, null, 97),
    (v_game_id, 9, 0, 2, null, 99),
    (v_game_id, 10, 10, 5, 3, 117);

  raise notice 'Created event with public slug: %', v_slug;
end
$$;

-- After running, look in the Supabase logs for the slug, or run:
--   select name, public_slug, status from public.events where name = 'DATBA Invitational Open Championship 2026';