import * as React from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { fetchMyLeagueAdminships, fetchMyProfile } from './data/access';
import type { UserProfileRow } from '@/types/db';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** The current user's profile row. null until loaded / when signed out. */
  profile: UserProfileRow | null;
  /** Set of league_ids the current user is an admin of. */
  managedLeagueIds: Set<string>;
  /** Quick checks. */
  isSuperadmin: boolean;
  canManageLeague: (leagueId: string | null | undefined) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Force re-pull the profile + grants (e.g., after a self-grant). */
  refreshAccess: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<UserProfileRow | null>(null);
  const [managedLeagueIds, setManagedLeagueIds] = React.useState<Set<string>>(
    new Set()
  );

  const refreshAccess = React.useCallback(async () => {
    try {
      const [p, grants] = await Promise.all([
        fetchMyProfile(),
        fetchMyLeagueAdminships(),
      ]);
      setProfile(p);
      setManagedLeagueIds(new Set(grants.map((g) => g.league_id)));
    } catch {
      // Likely the v11 migration hasn't run yet. Silently fall back to
      // the un-roled state so the app still works.
      setProfile(null);
      setManagedLeagueIds(new Set());
    }
  }, []);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (session?.user) {
      void refreshAccess();
    } else {
      setProfile(null);
      setManagedLeagueIds(new Set());
    }
  }, [session?.user, refreshAccess]);

  const isSuperadmin = profile?.role === 'superadmin';

  const canManageLeague = React.useCallback(
    (leagueId: string | null | undefined): boolean => {
      if (!leagueId) return false;
      if (isSuperadmin) return true;
      return managedLeagueIds.has(leagueId);
    },
    [isSuperadmin, managedLeagueIds]
  );

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    loading,
    profile,
    managedLeagueIds,
    isSuperadmin,
    canManageLeague,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    signUp: async (email, password) => {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error?.message ?? null };
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refreshAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
