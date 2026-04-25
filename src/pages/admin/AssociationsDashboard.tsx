import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { listAssociations } from '@/lib/data/associations';

export function AssociationsDashboard() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['associations'],
    queryFn: listAssociations,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Associations</h1>
          <p className="text-sm text-muted-foreground">
            Umbrella organizations that leagues can affiliate with.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/associations/new">
            <Plus className="h-4 w-4" /> New association
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="font-medium">No associations yet.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create one to group multiple leagues under a shared brand.
            </p>
            <Button asChild>
              <Link to="/admin/associations/new">
                <Plus className="h-4 w-4" /> Create association
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((a) => (
            <Link key={a.id} to={`/admin/associations/${a.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {a.image_url && (
                        <img
                          src={a.image_url}
                          alt=""
                          className="h-8 w-8 rounded border bg-card object-contain"
                        />
                      )}
                      <CardTitle className="text-base">{a.name}</CardTitle>
                    </div>
                    {a.acronym && <Badge variant="outline">{a.acronym}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  {a.description && (
                    <p className="line-clamp-2">{a.description}</p>
                  )}
                  <div className="text-xs">
                    Public link:{' '}
                    <code className="text-foreground">/associations/{a.public_slug}</code>
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
