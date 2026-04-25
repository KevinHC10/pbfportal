import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, PublicShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { EventsDashboard } from '@/pages/admin/EventsDashboard';
import { EventEditorPage } from '@/pages/admin/EventEditorPage';
import { EventDetailPage } from '@/pages/admin/EventDetailPage';
import { SessionScorePage } from '@/pages/admin/SessionScorePage';
import { PlayersPage } from '@/pages/admin/PlayersPage';
import { LeaguesDashboard } from '@/pages/admin/LeaguesDashboard';
import { LeagueEditorPage } from '@/pages/admin/LeagueEditorPage';
import { LeagueDetailPage } from '@/pages/admin/LeagueDetailPage';
import { PublicEventPage } from '@/pages/public/PublicEventPage';
import { PublicPlayerPage } from '@/pages/public/PublicPlayerPage';
import { PublicPlayerProfilePage } from '@/pages/public/PublicPlayerProfilePage';
import { PublicSessionPage } from '@/pages/public/PublicSessionPage';
import { PublicLeaguePage } from '@/pages/public/PublicLeaguePage';
import { LandingPage } from '@/pages/public/LandingPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route index element={<LandingPage />} />
        <Route path="/leagues/:slug" element={<PublicLeaguePage />} />
        <Route path="/players/:slug" element={<PublicPlayerProfilePage />} />
        <Route path="/e/:slug" element={<PublicEventPage />} />
        <Route path="/e/:slug/players/:playerId" element={<PublicPlayerPage />} />
        <Route path="/e/:slug/sessions/:sessionId" element={<PublicSessionPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<EventsDashboard />} />
        <Route path="/admin/events/new" element={<EventEditorPage />} />
        <Route path="/admin/events/:eventId" element={<EventDetailPage />} />
        <Route path="/admin/events/:eventId/edit" element={<EventEditorPage />} />
        <Route
          path="/admin/events/:eventId/sessions/:sessionId"
          element={<SessionScorePage />}
        />
        <Route path="/admin/leagues" element={<LeaguesDashboard />} />
        <Route path="/admin/leagues/new" element={<LeagueEditorPage />} />
        <Route path="/admin/leagues/:leagueId" element={<LeagueDetailPage />} />
        <Route path="/admin/leagues/:leagueId/edit" element={<LeagueEditorPage />} />
        <Route path="/admin/players" element={<PlayersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
