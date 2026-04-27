import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { listEvents } from '@/lib/data/events';
import { computeEventStatus } from '@/lib/event-status';
import { useAuth } from '@/lib/auth';
import type { EventStatus, EventType } from '@/types/db';
import * as React from 'react';

const STATUS_VARIANT: Record<EventStatus, 'secondary' | 'success' | 'outline'> = {
  upcoming: 'outline',
  active: 'success',
  completed: 'secondary',
};

export function EventsDashboard() {
  const [typeFilter, setTypeFilter] = React.useState<EventType | 'all'>('all');
  const [statusFilter, setStatusFilter] = React.useState<EventStatus | 'all'>('all');
  const { data, isLoading } = useQuery({ queryKey: ['events'], queryFn: listEvents });

  const { user, isSuperadmin, managedLeagueIds } = useAuth();
  const events = (data ?? []).filter((e) => {
    // Limit dashboard to events the current user can manage. Superadmin sees
    // all; an organizer sees events in their leagues plus tournaments they
    // personally created.
    if (!isSuperadmin) {
      const inManagedLeague = e.league_id ? managedLeagueIds.has(e.league_id) : false;
      const isOwn = user ? e.created_by === user.id : false;
      if (!inManagedLeague && !isOwn) return false;
    }
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (statusFilter !== 'all' && computeEventStatus(e) !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground">
            Leagues and tournaments you organize.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/events/new">
            <Plus className="h-4 w-4" /> New event
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as EventType | 'all')}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="league">Leagues</TabsTrigger>
            <TabsTrigger value="tournament">Tournaments</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as EventStatus | 'all')}
        >
          <TabsList>
            <TabsTrigger value="all">Any status</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="font-medium">No events match those filters.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first league or tournament.
            </p>
            <Button asChild>
              <Link to="/admin/events/new">
                <Plus className="h-4 w-4" /> Create event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const derived = computeEventStatus(e);
            return (
            <Link key={e.id} to={`/admin/events/${e.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{e.name}</CardTitle>
                    <Badge variant={STATUS_VARIANT[derived]}>{derived}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {e.type}
                    </Badge>
                    <span>{format(new Date(e.start_date), 'MMM d, yyyy')}</span>
                  </div>
                  {e.center_name && <div>{e.center_name}</div>}
                  <div className="text-xs">
                    Public link: <code className="text-foreground">/e/{e.public_slug}</code>
                  </div>
                </CardContent>
              </Card>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
