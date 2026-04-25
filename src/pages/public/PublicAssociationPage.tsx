import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchPublicAssociation,
  fetchPublicAssociationLeagues,
} from '@/lib/data/public';
import { formatScheduleLine } from '@/lib/schedule';

export function PublicAssociationPage() {
  const { slug } = useParams();
  const { data: association, isLoading } = useQuery({
    queryKey: ['public-association', slug],
    queryFn: () => fetchPublicAssociation(slug!),
    enabled: Boolean(slug),
  });
  const { data: leagues = [] } = useQuery({
    queryKey: ['public-association-leagues', association?.id],
    queryFn: () => fetchPublicAssociationLeagues(association!.id),
    enabled: Boolean(association?.id),
  });

  if (isLoading) return <Skeleton className="h-60" />;
  if (!association) {
    return (
      <Card>
        <CardContent className="py-14 text-center">
          <p className="font-medium">Association not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start gap-4">
        {association.image_url ? (
          <img
            src={association.image_url}
            alt={`${association.name} image`}
            className="h-16 w-16 rounded-md border bg-card object-contain"
          />
        ) : (
          <div className="h-16 w-16 rounded-md border bg-muted/30 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{association.name}</h1>
            {association.acronym && (
              <Badge variant="outline">{association.acronym}</Badge>
            )}
          </div>
        </div>
      </header>

      {association.description && (
        <Card>
          <CardContent className="py-4 text-sm whitespace-pre-wrap">
            {association.description}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Affiliated leagues ({leagues.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leagues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leagues yet.</p>
          ) : (
            <div className="space-y-2">
              {leagues.map((l) => (
                <Link
                  key={l.id}
                  to={`/leagues/${l.public_slug}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {l.logo_url ? (
                      <img
                        src={l.logo_url}
                        alt=""
                        className="h-8 w-8 rounded border bg-card object-contain"
                      />
                    ) : null}
                    <div>
                      <div className="font-medium">
                        {l.name}
                        {l.acronym && (
                          <Badge variant="outline" className="ml-2">
                            {l.acronym}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {l.center_name ?? ''}{' '}
                        {formatScheduleLine(l.day_of_week, l.start_time_local, l.timezone)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
