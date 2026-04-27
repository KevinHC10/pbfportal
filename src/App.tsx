import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppShell, PublicShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { EventsDashboard } from '@/pages/admin/EventsDashboard';
import { EventEditorPage } from '@/pages/admin/EventEditorPage';
import { EventDetailPage } from '@/pages/admin/EventDetailPage';
import { PlayersPage } from '@/pages/admin/PlayersPage';
import { LeaguesDashboard } from '@/pages/admin/LeaguesDashboard';
import { LeagueEditorPage } from '@/pages/admin/LeagueEditorPage';
import { LeagueDetailPage } from '@/pages/admin/LeagueDetailPage';
import { AssociationsDashboard } from '@/pages/admin/AssociationsDashboard';
import { AssociationEditorPage } from '@/pages/admin/AssociationEditorPage';
import { AssociationDetailPage } from '@/pages/admin/AssociationDetailPage';
import { AccessPage } from '@/pages/admin/AccessPage';
import { PublicEventPage } from '@/pages/public/PublicEventPage';
import { PublicPlayerPage } from '@/pages/public/PublicPlayerPage';
import { PublicPlayerProfilePage } from '@/pages/public/PublicPlayerProfilePage';
import { PublicLeaguePage } from '@/pages/public/PublicLeaguePage';
import { PublicAssociationPage } from '@/pages/public/PublicAssociationPage';
import { LandingPage } from '@/pages/public/LandingPage';

// Sessions were removed in v8. Old bookmarks pointing at .../sessions/:id
// redirect back to the event page now.
function RedirectToEvent() {
  const { eventId, slug } = useParams();
  if (eventId) return <Navigate to={`/admin/events/${eventId}`} replace />;
  if (slug) return <Navigate to={`/e/${slug}`} replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route index element={<LandingPage />} />
        <Route path="/leagues/:slug" element={<PublicLeaguePage />} />
        <Route path="/associations/:slug" element={<PublicAssociationPage />} />
        <Route path="/players/:slug" element={<PublicPlayerProfilePage />} />
        <Route path="/e/:slug" element={<PublicEventPage />} />
        <Route path="/e/:slug/players/:playerId" element={<PublicPlayerPage />} />
        <Route path="/e/:slug/sessions/:sessionId" element={<RedirectToEvent />} />
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
          element={<RedirectToEvent />}
        />
        <Route path="/admin/leagues" element={<LeaguesDashboard />} />
        <Route path="/admin/leagues/new" element={<LeagueEditorPage />} />
        <Route path="/admin/leagues/:leagueId" element={<LeagueDetailPage />} />
        <Route path="/admin/leagues/:leagueId/edit" element={<LeagueEditorPage />} />
        <Route path="/admin/associations" element={<AssociationsDashboard />} />
        <Route path="/admin/associations/new" element={<AssociationEditorPage />} />
        <Route path="/admin/associations/:associationId" element={<AssociationDetailPage />} />
        <Route
          path="/admin/associations/:associationId/edit"
          element={<AssociationEditorPage />}
        />
        <Route path="/admin/players" element={<PlayersPage />} />
        <Route path="/admin/access" element={<AccessPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
