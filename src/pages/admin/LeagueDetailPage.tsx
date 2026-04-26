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
  removeMembership,
  updateMembership,
} from '@/lib/data/leagues';
import { getAssociation } from '@/lib/data/associations';
import {
  createSeason,
  deleteSeason,
  listSeasons,
  updateSeason,
} from '@/lib/data/seasons';
import { listEventsByLeague } from '@/lib/data/events';
import { listPlayers } from '@/lib/data/players';
import { fetchSeasonAttendance } from '@/lib/data/attendance';
import { formatScheduleLine } from '@/lib/schedule';
import { computeEventStatus } from '@/lib/event-status';
import { errorMessage } from '@/lib/utils';
import { AttendanceGrid } from '@/components/league/AttendanceGrid';
import type { MembershipStatus, SeasonRow, SeasonStatus } from '@/types/db';

const addMemberSchema = z.object({
  player_id: z.string().min(1),
  status: z.enum(['regular', 'guest']),
  season_id: z.string().min(1, 'Pick a season'),
});
type AddMemberForm = z.infer<typeof addMemberSchema>;

const seasonSchema = z.object({
  name: z.string().min(1).max(80),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  status: z.enum(['upcoming', 'active', 'completed']),
});
type SeasonForm = z.infer<typeof seasonSchema>;

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
  const { data: seasons = [] } = useQuery({
    queryKey: ['league-seasons', leagueId],
    queryFn: () => listSeasons(leagueId!),
    enabled: Boolean(leagueId),
  });
  const { data: association } = useQuery({
    queryKey: ['association', league?.association_id],
    queryFn: () => getAssociation(league!.association_id!),
    enabled: Boolean(league?.association_id),
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
    onError: (e) => toast.error(errorMessage(e)),
  });

  const patch = useMutation({
    mutationFn: ({
      id,
      patch: p,
    }: {
      id: string;
      patch: Partial<{ status: MembershipStatus; season_id: string | null }>;
    }) => updateMembership(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['league-memberships', leagueId] }),
  });

  // -------- season mutations --------
  const createSeasonMut = useMutation({
    mutationFn: createSeason,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['league-seasons', leagueId] });
      toast.success('Season created');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const patchSeason = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<SeasonRow> }) =>
      updateSeason(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['league-seasons', leagueId] }),
  });

  const removeSeason = useMutation({
    mutationFn: deleteSeason,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['league-seasons', leagueId] });
      qc.invalidateQueries({ queryKey: ['league-memberships', leagueId] });
      toast.success('Season removed');
    },
    onError: (e) => toast.error(errorMessage(e)),
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
  const activeSeason = seasons.find((s) => s.status === 'active') ?? seasons[0] ?? null;

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
            {activeSeason && (
              <Badge variant="success">Current: {activeSeason.name}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {league.center_name ? `${league.center_name} · ` : ''}
            {formatScheduleLine(league.day_of_week, league.start_time_local, league.timezone)}
          </p>
          {association && (
            <p className="text-sm text-muted-foreground mt-1">
              Affiliated with{' '}
              <Link
                to={`/admin/associations/${association.id}`}
                className="underline hover:text-foreground"
              >
                {association.name}
                {association.acronym ? ` (${association.acronym})` : ''}
              </Link>
            </p>
          )}
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
          <TabsTrigger value="seasons">Seasons</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader className="flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">
                Members ({memberships.length})
              </CardTitle>
              <AddMemberDialog
                availablePlayers={availablePlayers}
                seasons={seasons}
                defaultSeasonId={activeSeason?.id ?? ''}
                onAdd={async (values) => {
                  try {
                    await addMembership({
                      league_id: league.id,
                      player_id: values.player_id,
                      status: values.status,
                      season_id: values.season_id || null,
                    });
                    qc.invalidateQueries({ queryKey: ['league-memberships', league.id] });
                    toast.success('Member added');
                  } catch (e) {
                    toast.error(errorMessage(e));
                  }
                }}
              />
            </CardHeader>
            <CardContent>
              {seasons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Create a season first in the Seasons tab, then add members.
                </p>
              ) : memberships.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                      <TableHead className="w-44">Season</TableHead>
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
                          <Select
                            value={m.season_id ?? ''}
                            onValueChange={(v) =>
                              patch.mutate({
                                id: m.id,
                                patch: { season_id: v || null },
                              })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              {seasons.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                  {s.status === 'active' ? ' (active)' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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

        <TabsContent value="seasons">
          <Card>
            <CardHeader className="flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">Seasons ({seasons.length})</CardTitle>
              <CreateSeasonDialog
                onCreate={(v) =>
                  createSeasonMut.mutate({
                    league_id: league.id,
                    name: v.name,
                    start_date: v.start_date ? v.start_date : null,
                    end_date: v.end_date ? v.end_date : null,
                    status: v.status,
                  })
                }
              />
            </CardHeader>
            <CardContent>
              {seasons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No seasons yet. Create one to group members and events.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-36">Start</TableHead>
                      <TableHead className="w-36">End</TableHead>
                      <TableHead className="w-36">Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seasons.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Input
                            defaultValue={s.name}
                            className="h-8"
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              if (v && v !== s.name)
                                patchSeason.mutate({ id: s.id, patch: { name: v } });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            defaultValue={s.start_date ?? ''}
                            className="h-8"
                            onBlur={(e) => {
                              const v = e.target.value || null;
                              if (v !== s.start_date)
                                patchSeason.mutate({ id: s.id, patch: { start_date: v } });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            defaultValue={s.end_date ?? ''}
                            className="h-8"
                            onBlur={(e) => {
                              const v = e.target.value || null;
                              if (v !== s.end_date)
                                patchSeason.mutate({ id: s.id, patch: { end_date: v } });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={s.status}
                            onValueChange={(v) =>
                              patchSeason.mutate({
                                id: s.id,
                                patch: { status: v as SeasonStatus },
                              })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upcoming">Upcoming</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete season "${s.name}"? Members and events in this season will keep their rows but lose the season link.`
                                )
                              ) {
                                removeSeason.mutate(s.id);
                              }
                            }}
                            aria-label={`Delete ${s.name}`}
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
                  {events.map((e) => {
                    const s = seasons.find((x) => x.id === e.season_id);
                    const derived = computeEventStatus(e);
                    return (
                      <Link
                        key={e.id}
                        to={`/admin/events/${e.id}`}
                        className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                      >
                        <div>
                          <div className="font-medium">{e.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {e.type} · {e.start_date}
                            {e.start_time ? ` ${e.start_time.slice(0, 5)}` : ''}
                            {s ? ` · ${s.name}` : ''}
                          </div>
                        </div>
                        <Badge
                          variant={
                            derived === 'active'
                              ? 'success'
                              : derived === 'upcoming'
                                ? 'outline'
                                : 'secondary'
                          }
                          className="capitalize"
                        >
                          {derived}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTab leagueId={league.id} seasons={seasons} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AttendanceTab({
  leagueId,
  seasons,
}: {
  leagueId: string;
  seasons: SeasonRow[];
}) {
  const active = seasons.find((s) => s.status === 'active') ?? seasons[0] ?? null;
  const [seasonId, setSeasonId] = React.useState<string>(active?.id ?? '');
  React.useEffect(() => {
    if (!seasonId && active) setSeasonId(active.id);
  }, [active, seasonId]);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', leagueId, seasonId || 'none'],
    queryFn: () => fetchSeasonAttendance(leagueId, seasonId || null),
    enabled: Boolean(leagueId),
  });

  if (seasons.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Create a season first to track attendance.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between flex-wrap gap-2">
        <div>
          <CardTitle className="text-lg">Attendance</CardTitle>
          <p className="text-xs text-muted-foreground">
            Who showed up and bowled each week. Counts only events where the bowler
            was on the roster with Playing checked.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Season</span>
          <Select value={seasonId} onValueChange={setSeasonId}>
            <SelectTrigger className="h-8 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                  {s.status === 'active' ? ' (active)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-40" />
        ) : (
          <AttendanceGrid data={data} />
        )}
      </CardContent>
    </Card>
  );
}

function AddMemberDialog({
  availablePlayers,
  seasons,
  defaultSeasonId,
  onAdd,
}: {
  availablePlayers: Array<{ id: string; full_name: string }>;
  seasons: SeasonRow[];
  defaultSeasonId: string;
  onAdd: (v: AddMemberForm) => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { status: 'regular', season_id: defaultSeasonId },
  });

  React.useEffect(() => {
    if (open) {
      reset({ status: 'regular', season_id: defaultSeasonId, player_id: '' });
    }
  }, [open, defaultSeasonId, reset]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={availablePlayers.length === 0 || seasons.length === 0}
          title={
            seasons.length === 0
              ? 'Create a season first'
              : availablePlayers.length === 0
                ? 'All known players are already members'
                : undefined
          }
        >
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
              <Label>Season</Label>
              <Select
                value={watch('season_id') ?? ''}
                onValueChange={(v) => setValue('season_id', v, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                      {s.status === 'active' ? ' (active)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.season_id && (
                <p className="text-sm text-destructive">{errors.season_id.message}</p>
              )}
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

function CreateSeasonDialog({
  onCreate,
}: {
  onCreate: (v: SeasonForm) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SeasonForm>({
    resolver: zodResolver(seasonSchema),
    defaultValues: { status: 'upcoming' },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New season
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New season</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((v) => {
            onCreate(v);
            reset();
            setOpen(false);
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="season_name">Name</Label>
            <Input id="season_name" {...register('name')} placeholder="2026 S1" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="season_start">Start</Label>
              <Input id="season_start" type="date" {...register('start_date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="season_end">End</Label>
              <Input id="season_end" type="date" {...register('end_date')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={watch('status') ?? 'upcoming'}
              onValueChange={(v) =>
                setValue('status', v as SeasonStatus, { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
