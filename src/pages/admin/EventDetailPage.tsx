import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  ChevronLeft,
  Copy,
  ExternalLink,
  Pencil,
  Plus,
  Sigma,
  Trash2,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { getLeague } from '@/lib/data/leagues';
import {
  addPlayerToEvent,
  bulkUpdateHandicaps,
  createPlayer,
  listEventPlayers,
  removePlayerFromEvent,
  updateEventPlayer,
  updatePlayer,
} from '@/lib/data/players';
import {
  copyRosterFromEvent,
  fetchLeagueMembershipMap,
  fetchSuggestiblePlayers,
  findPreviousEventInSeason,
  type SuggestiblePlayer,
} from '@/lib/data/roster';
import {
  ensureGamesForEvent,
  listFramesForGames,
  listGames,
} from '@/lib/data/sessions';
import { listEventLaneAssignments } from '@/lib/data/lanes';
import { computeHandicap } from '@/lib/handicap';
import { computeEventStatus } from '@/lib/event-status';
import { errorMessage } from '@/lib/utils';
import { SessionLeaderboard } from '@/components/leaderboard/SessionLeaderboard';
import { GameEditModal } from '@/components/scoresheet/GameEditModal';
import { QuickScoresCard } from '@/components/scoresheet/QuickScoresCard';
import { LaneAssignmentsDialog } from '@/components/session/LaneAssignmentsDialog';
import { PotGamesSection } from '@/components/pots/PotGamesSection';
import { useEventRealtime } from '@/hooks/useEventRealtime';
import type { Handedness, MembershipStatus } from '@/types/db';

const newPlayerSchema = z.object({
  full_name: z.string().min(2).max(120),
  affiliation: z.string().max(80).optional().or(z.literal('')),
  handedness: z.enum(['left', 'right', 'ambi']).optional(),
  home_average: z.coerce.number().min(0).max(300).optional().or(z.literal('')),
});
type NewPlayerForm = z.infer<typeof newPlayerSchema>;

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
  const { data: league } = useQuery({
    queryKey: ['league', event?.league_id],
    queryFn: () => getLeague(event!.league_id!),
    enabled: Boolean(event?.league_id),
  });
  const defaultAffiliation = league?.acronym ?? league?.name ?? '';

  // Roster carry-over: find the previous event in the same league + season
  const { data: previousEvent } = useQuery({
    queryKey: ['previous-event', event?.league_id, event?.season_id, event?.id],
    queryFn: () => findPreviousEventInSeason(event!),
    enabled: Boolean(event && event.league_id),
  });

  // Membership map for R/G badges on the leaderboard
  const { data: membershipByPlayerId } = useQuery({
    queryKey: ['membership-map', event?.league_id, event?.season_id],
    queryFn: () =>
      fetchLeagueMembershipMap(event!.league_id!, event!.season_id ?? null),
    enabled: Boolean(event?.league_id),
  });

  // Game / frame data for the leaderboard + edit modal
  const gamesQuery = useQuery({
    queryKey: ['event-games', eventId, event?.total_games, eventPlayers.length],
    enabled: Boolean(eventId && event && eventPlayers.length > 0),
    queryFn: async () =>
      ensureGamesForEvent(
        eventId!,
        eventPlayers.filter((ep) => ep.is_playing).map((ep) => ep.id),
        event!.total_games,
        event!.start_date
      ),
  });
  const games = gamesQuery.data ?? [];
  const framesQuery = useQuery({
    queryKey: ['event-frames', eventId, games.map((g) => g.id).join(',')],
    enabled: games.length > 0,
    queryFn: () => listFramesForGames(games.map((g) => g.id)),
  });
  const frames = framesQuery.data ?? [];

  const { data: laneAssignments = [] } = useQuery({
    queryKey: ['event-lanes', eventId],
    queryFn: () => listEventLaneAssignments(eventId!),
    enabled: Boolean(eventId),
  });

  // Suggestible players for the add-member dialog
  const { data: suggestible = [] } = useQuery({
    queryKey: ['suggestible-players'],
    queryFn: fetchSuggestiblePlayers,
  });

  useEventRealtime(eventId);

  // ----- mutations -----

  const remove = useMutation({
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
      patch: { handicap?: number; lane_number?: number | null; is_playing?: boolean };
    }) => updateEventPlayer(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-players', eventId] }),
  });

  const patchPlayer = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { affiliation?: string | null } }) =>
      updatePlayer(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-players', eventId] });
      qc.invalidateQueries({ queryKey: ['suggestible-players'] });
    },
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

  const copyRoster = useMutation({
    mutationFn: async () => {
      if (!event || !previousEvent) throw new Error('No previous event');
      return copyRosterFromEvent(previousEvent.id, event.id);
    },
    onSuccess: (added) => {
      qc.invalidateQueries({ queryKey: ['event-players', eventId] });
      toast.success(
        added === 0
          ? 'Already up to date'
          : `Copied ${added} bowler${added === 1 ? '' : 's'} from ${previousEvent?.name}`
      );
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const [editingEpId, setEditingEpId] = React.useState<string | null>(null);
  const editingEp = editingEpId ? eventPlayers.find((ep) => ep.id === editingEpId) ?? null : null;

  if (eventLoading || !event) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/e/${event.public_slug}`;
  const derivedStatus = computeEventStatus(event);

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
              {derivedStatus}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {event.center_name ? `${event.center_name} · ` : ''}
            {format(new Date(event.start_date), 'MMM d, yyyy')}
            {event.start_time ? ` ${event.start_time.slice(0, 5)}` : ''}
            {event.end_date ? ` → ${format(new Date(event.end_date), 'MMM d, yyyy')}` : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="pots">Pots</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <Card>
            <CardHeader className="flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">Players ({eventPlayers.length})</CardTitle>
              <div className="flex gap-2 flex-wrap">
                {previousEvent && eventPlayers.length === 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyRoster.mutate()}
                    disabled={copyRoster.isPending}
                    title={`Copy roster from ${previousEvent.name}`}
                  >
                    <Copy className="h-4 w-4" /> Copy from {previousEvent.name}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => recompute.mutate()}
                  disabled={eventPlayers.length === 0 || recompute.isPending}
                  title="Apply the handicap formula to every bowler using their home average"
                >
                  <Sigma className="h-4 w-4" /> Recompute handicaps
                </Button>
                <AddPlayerDialog
                  leagueId={event.league_id ?? null}
                  defaultAffiliation={defaultAffiliation}
                  suggestible={suggestible}
                  alreadyOnRosterPlayerIds={eventPlayers.map((ep) => ep.player_id)}
                  membershipByPlayerId={membershipByPlayerId}
                  onAddExisting={(playerId, handicap) =>
                    addPlayerToEvent(event.id, playerId, handicap)
                      .then(() =>
                        qc.invalidateQueries({ queryKey: ['event-players', event.id] })
                      )
                      .then(() => toast.success('Player added'))
                      .catch((e) => toast.error(errorMessage(e)))
                  }
                  onCreated={(player) => {
                    addPlayerToEvent(event.id, player.id, 0)
                      .then(() => {
                        qc.invalidateQueries({ queryKey: ['event-players', event.id] });
                        qc.invalidateQueries({ queryKey: ['suggestible-players'] });
                      })
                      .then(() => toast.success('Player added'))
                      .catch((e) => toast.error(errorMessage(e)));
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
                      <TableHead className="w-20">Playing</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Affiliation</TableHead>
                      <TableHead className="w-20">Member</TableHead>
                      <TableHead className="w-28">Home avg</TableHead>
                      <TableHead className="w-28">HDCP</TableHead>
                      <TableHead className="w-24">Lane</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventPlayers.map((ep) => {
                      const m = membershipByPlayerId?.get(ep.player_id);
                      return (
                        <TableRow key={ep.id} className={!ep.is_playing ? 'opacity-50' : ''}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={ep.is_playing}
                              onChange={(e) =>
                                patchEventPlayer.mutate({
                                  id: ep.id,
                                  patch: { is_playing: e.target.checked },
                                })
                              }
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{ep.player.full_name}</TableCell>
                          <TableCell>
                            <Input
                              key={`aff-${ep.player_id}-${ep.player.affiliation ?? ''}`}
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
                          <TableCell>
                            {m === 'regular' ? (
                              <Badge variant="success">R</Badge>
                            ) : m === 'guest' ? (
                              <Badge variant="secondary">G</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {ep.player.home_average ?? '—'}
                          </TableCell>
                          <TableCell>
                            <Input
                              key={`hdcp-${ep.id}-${ep.handicap}`}
                              type="number"
                              min={0}
                              max={300}
                              defaultValue={ep.handicap}
                              className="h-8 w-24"
                              onBlur={(e) => {
                                const v = Number(e.target.value);
                                if (v !== ep.handicap)
                                  patchEventPlayer.mutate({
                                    id: ep.id,
                                    patch: { handicap: v },
                                  });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              key={`lane-${ep.id}-${ep.lane_number ?? 'x'}`}
                              type="number"
                              min={0}
                              max={999}
                              defaultValue={ep.lane_number ?? ''}
                              className="h-8 w-20"
                              onBlur={(e) => {
                                const raw = e.target.value;
                                const v = raw === '' ? null : Number(raw);
                                if (v !== ep.lane_number)
                                  patchEventPlayer.mutate({
                                    id: ep.id,
                                    patch: { lane_number: v },
                                  });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => remove.mutate(ep.id)}
                              aria-label={`Remove ${ep.player.full_name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Sorted by lane so you can move down the bowling center one pair at
                a time. Click a column toggle to enter scores fast.
              </p>
              {eventPlayers.length > 0 && (
                <LaneAssignmentsDialog
                  eventId={event.id}
                  eventPlayers={eventPlayers.filter((ep) => ep.is_playing)}
                  assignments={laneAssignments}
                />
              )}
            </div>
            {eventPlayers.filter((ep) => ep.is_playing).length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Add players to the roster (and check Playing) before entering scores.
                </CardContent>
              </Card>
            ) : gamesQuery.isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <QuickScoresCard
                event={event}
                eventPlayers={eventPlayers.filter((ep) => ep.is_playing)}
                games={games}
                laneAssignments={laneAssignments}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="standings">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Sorted by score. Click any row to open the per-frame editor.
            </p>
            {eventPlayers.filter((ep) => ep.is_playing).length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No standings yet — add players and enter scores.
                </CardContent>
              </Card>
            ) : (
              <SessionLeaderboard
                event={event}
                eventPlayers={eventPlayers.filter((ep) => ep.is_playing)}
                allEventGames={games}
                sessionGames={games}
                laneAssignments={laneAssignments}
                membershipByPlayerId={membershipByPlayerId}
                onRowClick={(id) => setEditingEpId(id)}
                publicSlug={event.public_slug}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="pots">
          {eventPlayers.filter((ep) => ep.is_playing).length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Add players to the roster before setting up pot games.
              </CardContent>
            </Card>
          ) : (
            <PotGamesSection
              event={event}
              eventPlayers={eventPlayers.filter((ep) => ep.is_playing)}
              allEventGames={games}
              sessionGames={games}
              adminMode
            />
          )}
        </TabsContent>
      </Tabs>

      <GameEditModal
        open={Boolean(editingEp)}
        onOpenChange={(o) => {
          if (!o) setEditingEpId(null);
        }}
        event={event}
        eventPlayer={editingEp}
        games={games}
        frames={frames}
      />
    </div>
  );

  // unused but kept for future analytics
  void listGames;
}

// ----- Add player dialog with affiliation auto-suggest -----

function AddPlayerDialog({
  leagueId,
  defaultAffiliation,
  suggestible,
  alreadyOnRosterPlayerIds,
  membershipByPlayerId,
  onAddExisting,
  onCreated,
}: {
  leagueId: string | null;
  defaultAffiliation?: string;
  suggestible: SuggestiblePlayer[];
  alreadyOnRosterPlayerIds: string[];
  membershipByPlayerId?: Map<string, MembershipStatus>;
  onAddExisting: (playerId: string, handicap: number) => void | Promise<unknown>;
  onCreated: (p: { id: string }) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'existing' | 'new'>('existing');
  const [search, setSearch] = React.useState('');
  const [handicap, setHandicap] = React.useState(0);

  const onRosterSet = new Set(alreadyOnRosterPlayerIds);
  const candidates = suggestible
    .filter((sp) => !onRosterSet.has(sp.player.id))
    .filter((sp) =>
      search.trim() === ''
        ? true
        : sp.player.full_name.toLowerCase().includes(search.toLowerCase())
    )
    // Members of the current league rise to the top
    .sort((a, b) => {
      const aMember = leagueId ? a.memberships.some((m) => m.league_id === leagueId) : false;
      const bMember = leagueId ? b.memberships.some((m) => m.league_id === leagueId) : false;
      if (aMember && !bMember) return -1;
      if (!aMember && bMember) return 1;
      return a.player.full_name.localeCompare(b.player.full_name);
    });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewPlayerForm>({
    resolver: zodResolver(newPlayerSchema),
    defaultValues: { affiliation: defaultAffiliation ?? '' },
  });

  // When the league changes after the dialog has been mounted, keep the
  // default in sync (otherwise switching events would leave the old default).
  React.useEffect(() => {
    reset({ affiliation: defaultAffiliation ?? '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAffiliation]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setSearch('');
          setMode('existing');
          setHandicap(0);
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add player
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>Add player</DialogTitle>
          <DialogDescription>
            Pick someone you've already added before, or create a new player record.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'existing' | 'new')}>
          <TabsList>
            <TabsTrigger value="existing">Existing player</TabsTrigger>
            <TabsTrigger value="new">New player</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-3 pt-3">
            <Input
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="space-y-2">
              <Label>Handicap to apply</Label>
              <Input
                type="number"
                min={0}
                max={300}
                value={handicap}
                onChange={(e) => setHandicap(Number(e.target.value))}
              />
            </div>
            <div className="max-h-[40vh] overflow-y-auto rounded-md border">
              {candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  {suggestible.length === 0
                    ? 'No players in your address book yet — switch to "New player" to create one.'
                    : 'No matches.'}
                </p>
              ) : (
                <ul className="divide-y">
                  {candidates.map((sp) => {
                    const isLeagueMember = leagueId
                      ? sp.memberships.some((m) => m.league_id === leagueId)
                      : false;
                    const otherLeagues = sp.memberships
                      .filter((m) => m.league_id !== leagueId)
                      .map((m) => m.league.acronym ?? m.league.name);
                    const m = membershipByPlayerId?.get(sp.player.id);
                    return (
                      <li
                        key={sp.player.id}
                        className="flex items-center justify-between p-3 hover:bg-accent/40"
                      >
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {sp.player.full_name}
                            {m === 'regular' && <Badge variant="success">R</Badge>}
                            {m === 'guest' && <Badge variant="secondary">G</Badge>}
                            {isLeagueMember && !m && (
                              <Badge variant="outline">Member</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sp.player.affiliation && (
                              <span>{sp.player.affiliation}</span>
                            )}
                            {otherLeagues.length > 0 && (
                              <span>
                                {sp.player.affiliation ? ' · ' : ''}
                                Also in: {otherLeagues.join(', ')}
                              </span>
                            )}
                            {sp.player.home_average != null && (
                              <span>
                                {sp.player.affiliation || otherLeagues.length > 0 ? ' · ' : ''}
                                avg {sp.player.home_average}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            void onAddExisting(sp.player.id, handicap);
                            setOpen(false);
                          }}
                        >
                          Add
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-3 pt-3">
            <form
              onSubmit={handleSubmit(async (values) => {
                try {
                  const p = await createPlayer({
                    full_name: values.full_name,
                    affiliation: values.affiliation ? values.affiliation : null,
                    handedness: (values.handedness ?? null) as Handedness | null,
                    home_average:
                      values.home_average === '' ? null : values.home_average ?? null,
                  });
                  reset();
                  setOpen(false);
                  onCreated(p);
                } catch (e) {
                  toast.error(errorMessage(e));
                }
              })}
              className="space-y-4"
            >
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
                      setValue('handedness', v as NewPlayerForm['handedness'], {
                        shouldDirty: true,
                      })
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
                  Create + add
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
