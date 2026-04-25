export type EventType = 'league' | 'tournament';
export type EventStatus = 'upcoming' | 'active' | 'completed';
export type Handedness = 'left' | 'right' | 'ambi';

export interface EventRow {
  id: string;
  name: string;
  type: EventType;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  status: EventStatus;
  public_slug: string;
  center_name: string | null;
  total_games: number;
  hdcp_base: number;
  hdcp_factor: number;
  hdcp_max: number;
  hdcp_min: number;
  league_id: string | null;
  season_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssociationRow {
  id: string;
  name: string;
  acronym: string | null;
  image_url: string | null;
  description: string | null;
  public_slug: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface LeagueRow {
  id: string;
  name: string;
  acronym: string | null;
  parent_league_id: string | null; // legacy; unused in UI from v7
  association_id: string | null;
  center_name: string | null;
  day_of_week: DayOfWeek | null;
  start_time_local: string | null; // "HH:MM:SS"
  timezone: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  public_slug: string;
  hdcp_base: number;
  hdcp_factor: number;
  hdcp_max: number;
  hdcp_min: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type MembershipStatus = 'regular' | 'guest';

export type SeasonStatus = 'upcoming' | 'active' | 'completed';

export interface SeasonRow {
  id: string;
  league_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: SeasonStatus;
  created_at: string;
  updated_at: string;
}

export interface LeagueMembershipRow {
  id: string;
  league_id: string;
  player_id: string;
  status: MembershipStatus;
  season_label: string;
  season_id: string | null;
  joined_at: string;
}

export type PotGameType = 'singles' | 'doubles';

export interface PotGameRow {
  id: string;
  session_id: string;
  type: PotGameType;
  name: string;
  game_number: number;
  factor: number;
  hdcp_min: number;
  hdcp_max: number;
  created_at: string;
}

export interface PotGameEntryRow {
  id: string;
  pot_game_id: string;
  event_player_id: string;
  partner_event_player_id: string | null;
  created_at: string;
}

export interface SessionLaneAssignmentRow {
  id: string;
  session_id: string;
  event_player_id: string;
  lane_number: number | null;
  updated_at: string;
}

export interface PlayerRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  handedness: Handedness | null;
  home_average: number | null;
  affiliation: string | null;
  public_slug: string;
  created_by: string;
  created_at: string;
}

export interface EventPlayerRow {
  id: string;
  event_id: string;
  player_id: string;
  handicap: number;
  lane_number: number | null;
  entry_date: string;
}

export interface SessionRow {
  id: string;
  event_id: string;
  session_number: number;
  session_date: string;
  created_at: string;
}

export interface GameRow {
  id: string;
  session_id: string;
  event_player_id: string;
  game_number: number;
  total_score: number | null;
  is_complete: boolean;
  updated_at: string;
}

export interface FrameRow {
  id: string;
  game_id: string;
  frame_number: number;
  roll_1: number | null;
  roll_2: number | null;
  roll_3: number | null;
  frame_score: number | null;
  updated_at: string;
}

export interface ScoreEditRow {
  id: string;
  game_id: string;
  frame_id: string | null;
  edited_by: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}
