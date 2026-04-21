export type EventType = 'league' | 'tournament';
export type EventStatus = 'upcoming' | 'active' | 'completed';
export type Handedness = 'left' | 'right' | 'ambi';

export interface EventRow {
  id: string;
  name: string;
  type: EventType;
  start_date: string;
  end_date: string | null;
  status: EventStatus;
  public_slug: string;
  center_name: string | null;
  total_games: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  handedness: Handedness | null;
  home_average: number | null;
  created_by: string;
  created_at: string;
}

export interface EventPlayerRow {
  id: string;
  event_id: string;
  player_id: string;
  handicap: number;
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
