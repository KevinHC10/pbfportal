import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ExternalLink,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  deleteAssociation,
  getAssociation,
  listLeaguesByAssociation,
} from '@/lib/data/associations';
import { formatScheduleLine } from '@/lib/schedule';
import { errorMessage } from '@/lib/utils';

export function AssociationDetailPage() {
  const { associationId } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: association, isLoading } = useQuery({
    queryKey: ['association', associationId],
    queryFn: () => getAssociation(associationId!),
    enabled: Boolean(associationId),
  });
  const { data: leagues = [] } = useQuery({
    queryKey: ['association-leagues', associationId],
    queryFn: () => listLeaguesByAssociation(associationId!),
    enabled: Boolean(associationId),
  });

  const remove = useMutation({
    mutationFn: deleteAssociation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['associations'] });
      toast.success('Association deleted');
      navigate('/admin/associations');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (isLoading || !association) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/associations/${association.public_slug}`;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/associations">
          <ChevronLeft className="h-4 w-4" /> All associations
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {association.image_url && (
            <img
              src={association.image_url}
              alt=""
              className="h-12 w-12 rounded border bg-card object-contain"
            />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{association.name}</h1>
              {association.acronym && <Badge variant="outline">{association.acronym}</Badge>}
            </div>
            {association.description && (
              <p className="text-sm text-muted-foreground mt-1 max-w-prose whitespace-pre-wrap">
                {association.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Public profile
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/admin/associations/${association.id}/edit`}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  `Delete "${association.name}"? Affiliated leagues will keep their rows but lose the link.`
                )
              ) {
                remove.mutate(association.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Affiliated leagues ({leagues.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leagues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No leagues are affiliated yet. Set the Association field on a league to
              link it here.
            </p>
          ) : (
            <div className="space-y-2">
              {leagues.map((l) => (
                <Link
                  key={l.id}
                  to={`/admin/leagues/${l.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                >
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
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
