import { supabase } from '@/lib/supabase';
import type { LeagueAdminRow, UserProfileRow, UserRole } from '@/types/db';

/**
 * Per-league admin access, plus the global role (superadmin/organizer).
 *
 * These reads + writes go through RLS, which is parameterized off the
 * helper SQL functions is_superadmin() and can_manage_league(). Anything
 * the policies block returns empty/null without throwing.
 */

export async function fetchMyProfile(): Promise<UserProfileRow | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return (data as UserProfileRow | null) ?? null;
}

export async function fetchMyLeagueAdminships(): Promise<LeagueAdminRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('league_admins')
    .select('*')
    .eq('user_id', auth.user.id);
  if (error) throw error;
  return (data ?? []) as LeagueAdminRow[];
}

export interface LeagueAdminWithProfile extends LeagueAdminRow {
  profile: (UserProfileRow & { email: string | null }) | null;
}

/**
 * The admins of one league, joined with their profile + email.
 * Visible to: superadmins, league admins themselves, the user being admin'd.
 */
export async function listLeagueAdmins(
  leagueId: string
): Promise<LeagueAdminWithProfile[]> {
  const { data, error } = await supabase
    .from('league_admins')
    .select('*, profile:user_profiles(*)')
    .eq('league_id', leagueId)
    .order('granted_at', { ascending: true });
  if (error) throw error;
  // The auth.users table isn't directly readable by clients; we surface the
  // email by joining via the (RLS-bound) user_profiles table only. If the
  // current viewer can't see the row their profile is null.
  return (data ?? []).map((row) => ({
    ...(row as LeagueAdminRow),
    profile: row.profile
      ? { ...(row.profile as UserProfileRow), email: null }
      : null,
  }));
}

/**
 * Grant league-admin access to an existing user, looked up by email via the
 * SECURITY DEFINER RPC `find_user_id_by_email`. Throws clearly if no user
 * with that email has signed up yet. RLS gates the actual insert so only
 * superadmins / existing league admins can call this.
 */
export async function grantLeagueAdmin(
  leagueId: string,
  email: string
): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  const { data: targetId, error: rpcErr } = await supabase.rpc(
    'find_user_id_by_email',
    { _email: trimmed }
  );
  if (rpcErr) throw rpcErr;
  if (!targetId) {
    throw new Error(
      `No organizer with email "${trimmed}" has signed up yet. Ask them to register first at /login.`
    );
  }
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from('league_admins').insert({
    league_id: leagueId,
    user_id: targetId as string,
    granted_by: auth.user?.id ?? null,
  });
  if (error) throw error;
}

export async function revokeLeagueAdmin(
  leagueId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('league_admins')
    .delete()
    .eq('league_id', leagueId)
    .eq('user_id', userId);
  if (error) throw error;
}

/**
 * Superadmin-only: list all profiles + their league grants.
 */
export async function listAllProfiles(): Promise<UserProfileRow[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as UserProfileRow[];
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function updateMyName(fullName: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('user_profiles')
    .update({ full_name: fullName.trim() || null })
    .eq('user_id', auth.user.id);
  if (error) throw error;
}
