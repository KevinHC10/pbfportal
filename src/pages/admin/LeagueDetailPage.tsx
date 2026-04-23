import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Pencil,
  Plus,
  Trash2,
  ExternalLink,
  UserPlus,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  addMembership,
  getLeague,
  listMemberships,
  listSubLeagues,
  removeMembership,
  updateMembership,
} from '@/lib/data/leagues';
import { listEventsByLeague } from '@/lib/data/events';
import { listPlayers } from '@/lib/data/players';
import { formatScheduleLine } from '@/lib/schedule';
import type { MembershipStatus } from '@/types/db';

const addMemberSchema = z.object({
  player_id: z.string().min(1),
  status: z.enum(['regular', 'guest']),
  season_label: z.string().max(40).optional().or(z.literal('')),
});
type AddMemberForm = z.infer<typeof addMemberSchema>;

export function LeagueDetailPage() {
  const { leagueId } = useParams();
  const qc = useQueryClient();

  const { data: league, isLoading } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => getLeague(leagueId!),
    enabled: Boolean(leagueId),
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['league-memberships', leagueId],
    queryFn: () => listMemberships(leagueId!),
    enabled: Boolean(leagueId),
  });

  const { data: subLeagues = [] } = useQuery({
    queryKey: ['sub-leagues', leagueId],
    queryFn: () => listSubLeagues(leagueId!),
    enabled: Boolean(leagueId),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['league-events', leagueId],
    queryFn: () => listEventsByLeague(leagueId!),
    enabled: Boolean(leagueId),
  });

  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: listPlayers });

  const remove = useMutation({
    mutationFn: removeMembership,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['league-memberships', leagueId] });
      toast.success('Member removed');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed'),
  });

  const patch = useMutation({
    mutationFn: ({
      id,
      patch: p,
    }: {
      id: string;
      patch: Partial<{ status: MembershipStatus; season_label: string }>;
    }) => updateMembership(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['league-memberships', leagueId] }),
  });

  if (isLoading || !league) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/leagues/${league.public_slug}`;
  const availablePlayers = players.filter(
    (p) => !memberships.some((m) => m.player_id === p.id)
  );

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/leagues">
          <ChevronLeft className="h-4 w-4" /> All leagues
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{league.name}</h1>
            {league.acronym && <Badge variant="outline">{league.acronym}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {league.center_name ? `${league.center_name} · ` : ''}
            {formatScheduleLine(league.day_of_week, league.start_time_local, league.timezone)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Public profile
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/admin/leagues/${league.id}/edit`}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="sub-leagues">Sub-leagues</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader className="flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">
                Members ({memberships.length})
              </CardTitle>
              <AddMemberDialog
                availablePlayers={availablePlayers}
                onAdd={async (values) => {
                  try {
                    await addMembership({
                      league_id: league.id,
                      player_id: values.player_id,
                      status: values.status,
                      season_label: values.season_label ?? '',
                    });
                    qc.invalidateQueries({ queryKey: ['league-memberships', league.id] });
                    toast.success('Member added');
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Failed');
                  }
                }}
              />
            </CardHeader>
            <CardContent>
              {memberships.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                      <TableHead className="w-32">Season</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberships.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.player.full_name}</TableCell>
                        <TableCell>
                          <Select
                            value={m.status}
                            onValueChange={(v) =>
                              patch.mutate({
                                id: m.id,
                                patch: { status: v as MembershipStatus },
                              })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">Regular</SelectItem>
                              <SelectItem value="guest">Guest</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            defaultValue={m.season_label}
                            placeholder="2026 S1"
                            className="h-8"
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              if (v !== m.season_label) {
                                patch.mutate({
                                  id: m.id,
                                  patch: { season_label: v },
                                });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => remove.mutate(m.id)}
                            aria-label={`Remove ${m.player.full_name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader className="flex-row items-center justify-between flex-wrap">
              <CardTitle className="text-lg">Events ({events.length})</CardTitle>
              <Button asChild size="sm">
                <Link to={`/admin/events/new?league_id=${league.id}`}>
                  <Plus className="h-4 w-4" /> New event
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events under this league.</p>
              ) : (
                <div className="space-y-2">
                  {events.map((e) => (
                    <Link
                      key={e.id}
                      to={`/admin/events/${e.id}`}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                    >
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {e.type} · {e.start_date}
                        </div>
                      </div>
                      <Badge variant="secondary">{e.status}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sub-leagues">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sub-leagues ({subLeagues.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {subLeagues.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sub-leagues yet. Create a new league and set this one as its parent.
                </p>
              ) : (
                <div className="space-y-2">
                  {subLeagues.map((sl) => (
                    <Link
                      key={sl.id}
                      to={`/admin/leagues/${sl.id}`}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                    >
                      <div>
                        <div className="font-medium">{sl.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {sl.acronym ?? ''}{' '}
                          {formatScheduleLine(
                            sl.day_of_week,
                            sl.start_time_local,
                            sl.timezone
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddMemberDialog({
  availablePlayers,
  onAdd,
}: {
  availablePlayers: Array<{ id: string; full_name: string }>;
  onAdd: (v: AddMemberForm) => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { status: 'regular' },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={availablePlayers.length === 0}>
          <UserPlus className="h-4 w-4" /> Add member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            await onAdd(v);
            reset();
            setOpen(false);
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Player</Label>
            <Select
              value={watch('player_id') ?? ''}
              onValueChange={(v) => setValue('player_id', v, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a player" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.player_id && (
              <p className="text-sm text-destructive">{errors.player_id.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch('status') ?? 'regular'}
                onValueChange={(v) =>
                  setValue('status', v as MembershipStatus, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="season_label">Season (optional)</Label>
              <Input
                id="season_label"
                {...register('season_label')}
                placeholder="2026 S1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
