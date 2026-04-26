import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  ChevronLeft,
  Pencil,
  Plus,
  Trash2,
  ExternalLink,
  UserPlus,
  Calendar,
  Sigma,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { getEvent } from '@/lib/data/events';
import {
  addPlayerToEvent,
  bulkUpdateHandicaps,
  createPlayer,
  listEventPlayers,
  listPlayers,
  removePlayerFromEvent,
  updateEventPlayer,
  updatePlayer,
} from '@/lib/data/players';
import { createSession, listSessions } from '@/lib/data/sessions';
import { computeHandicap } from '@/lib/handicap';
import { computeEventStatus } from '@/lib/event-status';
import { errorMessage } from '@/lib/utils';

const playerSchema = z.object({
  full_name: z.string().min(2, 'Name is required').max(120),
  affiliation: z.string().max(80).optional().or(z.literal('')),
  handedness: z.enum(['left', 'right', 'ambi']).optional(),
  home_average: z.coerce.number().min(0).max(300).optional().or(z.literal('')),
});
type PlayerForm = z.infer<typeof playerSchema>;

const sessionSchema = z.object({
  session_date: z.string().min(1, 'Session date is required'),
});
type SessionForm = z.infer<typeof sessionSchema>;

export function EventDetailPage() {
  const { eventId } = useParams();
  const qc = useQueryClient();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId!),
    enabled: Boolean(eventId),
  });
  const { data: eventPlayers = [] } = useQuery({
    queryKey: ['event-players', eventId],
    queryFn: () => listEventPlayers(eventId!),
    enabled: Boolean(eventId),
  });
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', eventId],
    queryFn: () => listSessions(eventId!),
    enabled: Boolean(eventId),
  });
  const { data: allPlayers = [] } = useQuery({
    queryKey: ['players'],
    queryFn: listPlayers,
  });

  const addExisting = useMutation({
    mutationFn: async ({ playerId, handicap }: { playerId: string; handicap: number }) =>
      addPlayerToEvent(eventId!, playerId, handicap),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-players', eventId] });
      toast.success('Player added');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const removePlayer = useMutation({
    mutationFn: removePlayerFromEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-players', eventId] });
      toast.success('Player removed');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const patchEventPlayer = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { handicap?: number; lane_number?: number | null };
    }) => updateEventPlayer(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-players', eventId] }),
  });

  const patchPlayer = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { affiliation?: string | null };
    }) => updatePlayer(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-players', eventId] });
      qc.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const createSessionMut = useMutation({
    mutationFn: ({ date }: { date: string }) =>
      createSession(eventId!, sessions.length + 1, date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions', eventId] });
      toast.success('Session created');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const recompute = useMutation({
    mutationFn: async () => {
      if (!event) throw new Error('No event');
      const formula = {
        base: event.hdcp_base,
        factor: Number(event.hdcp_factor),
        min: event.hdcp_min,
        max: event.hdcp_max,
      };
      const updates = eventPlayers
        .filter((ep) => ep.player.home_average != null && ep.player.home_average > 0)
        .map((ep) => ({
          id: ep.id,
          handicap: computeHandicap(formula, ep.player.home_average),
        }));
      await bulkUpdateHandicaps(updates);
      return updates.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['event-players', eventId] });
      toast.success(`Recomputed handicaps for ${count} bowler${count === 1 ? '' : 's'}`);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const unregisteredPlayers = allPlayers.filter(
    (p) => !eventPlayers.some((ep) => ep.player_id === p.id)
  );

  if (eventLoading || !event) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/e/${event.public_slug}`;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin">
          <ChevronLeft className="h-4 w-4" /> All events
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <Badge variant="outline" className="capitalize">
              {event.type}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {computeEventStatus(event)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {event.center_name ? `${event.center_name} · ` : ''}
            {format(new Date(event.start_date), 'MMM d, yyyy')}
            {event.end_date ? ` → ${format(new Date(event.end_date), 'MMM d, yyyy')}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Public link
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/admin/events/${event.id}/edit`}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="roster">
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <Card>
            <CardHeader className="flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">Players ({eventPlayers.length})</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => recompute.mutate()}
                  disabled={eventPlayers.length === 0 || recompute.isPending}
                  title="Apply the handicap formula (base, factor, min, max) to every bowler using their home average"
                >
                  <Sigma className="h-4 w-4" /> Recompute handicaps
                </Button>
                <AddExistingPlayerDialog
                  players={unregisteredPlayers}
                  onAdd={(playerId, handicap) => addExisting.mutate({ playerId, handicap })}
                />
                <CreatePlayerDialog
                  onCreated={(p) => {
                    addExisting.mutate({ playerId: p.id, handicap: 0 });
                    qc.invalidateQueries({ queryKey: ['players'] });
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              {eventPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No players yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Affiliation</TableHead>
                      <TableHead className="w-28">Home avg</TableHead>
                      <TableHead className="w-28">HDCP</TableHead>
                      <TableHead className="w-24">Lane</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventPlayers.map((ep) => (
                      <TableRow key={ep.id}>
                        <TableCell className="font-medium">{ep.player.full_name}</TableCell>
                        <TableCell>
                          <Input
                            defaultValue={ep.player.affiliation ?? ''}
                            className="h-8"
                            placeholder="(none)"
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              const prev = ep.player.affiliation ?? '';
                              if (v !== prev) {
                                patchPlayer.mutate({
                                  id: ep.player_id,
                                  patch: { affiliation: v === '' ? null : v },
                                });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {ep.player.home_average ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={300}
                            defaultValue={ep.handicap}
                            className="h-8 w-24"
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (v !== ep.handicap) {
                                patchEventPlayer.mutate({
                                  id: ep.id,
                                  patch: { handicap: v },
                                });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={999}
                            defaultValue={ep.lane_number ?? ''}
                            className="h-8 w-20"
                            onBlur={(e) => {
                              const raw = e.target.value;
                              const v = raw === '' ? null : Number(raw);
                              if (v !== ep.lane_number) {
                                patchEventPlayer.mutate({
                                  id: ep.id,
                                  patch: { lane_number: v },
                                });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removePlayer.mutate(ep.id)}
                            aria-label={`Remove ${ep.player.full_name}`}
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

        <TabsContent value="sessions">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-lg">Sessions ({sessions.length})</CardTitle>
              <CreateSessionDialog
                onCreate={(date) => createSessionMut.mutate({ date })}
                defaultDate={format(new Date(), 'yyyy-MM-dd')}
                disabled={eventPlayers.length === 0}
              />
            </CardHeader>
            <CardContent>
              {eventPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add players to the roster before creating a session.
                </p>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions yet.</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <Link
                      key={s.id}
                      to={`/admin/events/${event.id}/sessions/${s.id}`}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Session {s.session_number}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(s.session_date), 'EEE, MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">Enter scores →</span>
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

function CreatePlayerDialog({ onCreated }: { onCreated: (p: { id: string }) => void }) {
  const [open, setOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<PlayerForm>({ resolver: zodResolver(playerSchema) });

  const submit = async (values: PlayerForm) => {
    try {
      const p = await createPlayer({
        full_name: values.full_name,
        affiliation: values.affiliation ? values.affiliation : null,
        handedness: values.handedness ?? null,
        home_average: values.home_average === '' ? null : values.home_average ?? null,
      });
      toast.success('Player created');
      reset();
      setOpen(false);
      onCreated(p);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New player
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create player</DialogTitle>
          <DialogDescription>Adds the player to the current event too.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="affiliation">Affiliation</Label>
            <Input
              id="affiliation"
              {...register('affiliation')}
              placeholder="PBA / DATBI / independent…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Handedness</Label>
              <Select
                value={watch('handedness') ?? ''}
                onValueChange={(v) =>
                  setValue('handedness', v as PlayerForm['handedness'], { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="(optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="ambi">Ambi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="home_average">Home average</Label>
              <Input
                id="home_average"
                type="number"
                min={0}
                max={300}
                step={1}
                {...register('home_average')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddExistingPlayerDialog({
  players,
  onAdd,
}: {
  players: Array<{ id: string; full_name: string }>;
  onAdd: (playerId: string, handicap: number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [playerId, setPlayerId] = React.useState<string>('');
  const [handicap, setHandicap] = React.useState<number>(0);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={players.length === 0}>
          <UserPlus className="h-4 w-4" /> Add existing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an existing player</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Player</Label>
            <Select value={playerId} onValueChange={setPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a player" />
              </SelectTrigger>
              <SelectContent>
                {players.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Handicap</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={handicap}
              onChange={(e) => setHandicap(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!playerId}
            onClick={() => {
              onAdd(playerId, handicap);
              setOpen(false);
              setPlayerId('');
              setHandicap(0);
            }}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateSessionDialog({
  onCreate,
  defaultDate,
  disabled,
}: {
  onCreate: (date: string) => void;
  defaultDate: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { session_date: defaultDate },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <Plus className="h-4 w-4" /> New session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New session</DialogTitle>
          <DialogDescription>
            Creates a session and initializes games for every player.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((v) => {
            onCreate(v.session_date);
            setOpen(false);
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="session_date">Date</Label>
            <Input id="session_date" type="date" {...register('session_date')} />
            {errors.session_date && (
              <p className="text-sm text-destructive">{errors.session_date.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Create session</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
