import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { listLeagues } from '@/lib/data/leagues';
import { formatScheduleLine } from '@/lib/schedule';
import { useAuth } from '@/lib/auth';

export function LeaguesDashboard() {
  const { isSuperadmin, managedLeagueIds } = useAuth();
  const { data: all = [], isLoading } = useQuery({
    queryKey: ['leagues'],
    queryFn: listLeagues,
  });
  const data = isSuperadmin ? all : all.filter((l) => managedLeagueIds.has(l.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leagues</h1>
          <p className="text-sm text-muted-foreground">
            Associations and sub-leagues you organize.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/leagues/new">
            <Plus className="h-4 w-4" /> New league
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="font-medium">No leagues yet.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create an association to manage its events, rosters, and pot games.
            </p>
            <Button asChild>
              <Link to="/admin/leagues/new">
                <Plus className="h-4 w-4" /> Create league
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((l) => (
            <Link key={l.id} to={`/admin/leagues/${l.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{l.name}</CardTitle>
                    {l.acronym && <Badge variant="outline">{l.acronym}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  {l.center_name && <div>{l.center_name}</div>}
                  {l.day_of_week != null && (
                    <div>{formatScheduleLine(l.day_of_week, l.start_time_local, l.timezone)}</div>
                  )}
                  <div className="text-xs">
                    Public link: <code className="text-foreground">/leagues/{l.public_slug}</code>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
