import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Users, User, Wand2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import {
  buildDoublesPot,
  buildSinglesPot,
  suggestDoublesPairs,
  type PotFormula,
  type SinglesPotRow,
} from '@/lib/pot';
import {
  createPotGame,
  deletePotGame,
  listPotGameEntries,
  listPotGames,
  replacePotGameEntries,
  updatePotGame,
} from '@/lib/data/pots';
import type {
  EventPlayerRow,
  EventRow,
  GameRow,
  PlayerRow,
  PotGameEntryRow,
  PotGameRow,
  PotGameType,
  SessionRow,
} from '@/types/db';

interface Props {
  event: EventRow;
  session: SessionRow;
  eventPlayers: Array<EventPlayerRow & { player: PlayerRow }>;
  allEventGames: GameRow[];
  sessionGames: GameRow[];
  /** Admin mode enables all editing controls. Public mode is read-only. */
  adminMode: boolean;
}

export function PotGamesSection({
  event,
  session,
  eventPlayers,
  allEventGames,
  sessionGames,
  adminMode,
}: Props) {
  const qc = useQueryClient();

  const { data: pots = [] } = useQuery({
    queryKey: ['pot-games', session.id],
    queryFn: () => listPotGames(session.id),
  });

  const create = useMutation({
    mutationFn: createPotGame,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pot-games', session.id] });
      toast.success('Pot game created');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed'),
  });

  if (pots.length === 0 && !adminMode) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-lg">Pot games</CardTitle>
        {adminMode && (
          <CreatePotDialog
            totalGames={event.total_games}
            onCreate={(input) =>
              create.mutate({
                session_id: session.id,
                ...input,
              })
            }
          />
        )}
      </CardHeader>
      <CardContent>
        {pots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {adminMode
              ? 'No pot games yet. Create a singles or doubles pot to overlay a side competition on this session.'
              : 'No pot games this session.'}
          </p>
        ) : (
          <div className="space-y-6">
            {pots.map((pot) => (
              <PotGameView
                key={pot.id}
                pot={pot}
                eventPlayers={eventPlayers}
                allEventGames={allEventGames}
                sessionGames={sessionGames}
                adminMode={adminMode}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- single pot view ----------

function PotGameView({
  pot,
  eventPlayers,
  allEventGames,
  sessionGames,
  adminMode,
}: {
  pot: PotGameRow;
  eventPlayers: Array<EventPlayerRow & { player: PlayerRow }>;
  allEventGames: GameRow[];
  sessionGames: GameRow[];
  adminMode: boolean;
}) {
  const qc = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ['pot-entries', pot.id],
    queryFn: () => listPotGameEntries(pot.id),
  });

  const remove = useMutation({
    mutationFn: deletePotGame,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pot-games', pot.session_id] });
      toast.success('Pot removed');
    },
  });

  const formula: PotFormula = {
    factor: Number(pot.factor),
    min: pot.hdcp_min,
    max: pot.hdcp_max,
  };

  // running averages per event player
  const epAverages = React.useMemo(() => {
    const m = new Map<string, number | null>();
    for (const ep of eventPlayers) {
      const scores = allEventGames
        .filter((g) => g.event_player_id === ep.id)
        .map((g) => g.total_score)
        .filter((v): v is number => typeof v === 'number' && v > 0);
      const avg =
        scores.length > 0
          ? scores.reduce((s, v) => s + v, 0) / scores.length
          : ep.player.home_average ?? null;
      m.set(ep.id, avg);
    }
    return m;
  }, [eventPlayers, allEventGames]);

  // the game score for this pot's game_number per event player
  const epScratch = React.useMemo(() => {
    const m = new Map<string, number | null>();
    for (const ep of eventPlayers) {
      const g = sessionGames.find(
        (g) => g.event_player_id === ep.id && g.game_number === pot.game_number
      );
      m.set(ep.id, g?.total_score ?? null);
    }
    return m;
  }, [eventPlayers, sessionGames, pot.game_number]);

  const playerById = React.useMemo(
    () => new Map(eventPlayers.map((ep) => [ep.id, ep])),
    [eventPlayers]
  );

  const enrichedEntries = entries.map((e) => {
    const ep = playerById.get(e.event_player_id);
    return {
      ...e,
      name: ep?.player.full_name ?? '?',
      average: epAverages.get(e.event_player_id) ?? null,
      scratchScore: epScratch.get(e.event_player_id) ?? null,
    };
  });

  const singles = buildSinglesPot({
    entries: enrichedEntries.map((e) => ({
      eventPlayerId: e.event_player_id,
      name: e.name,
      average: e.average,
      scratchScore: e.scratchScore,
    })),
    formula,
  });

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base">{pot.name}</h3>
            <Badge variant={pot.type === 'doubles' ? 'secondary' : 'outline'}>
              {pot.type === 'doubles' ? (
                <>
                  <Users className="h-3 w-3 mr-1" /> Doubles
                </>
              ) : (
                <>
                  <User className="h-3 w-3 mr-1" /> Singles
                </>
              )}
            </Badge>
            <Badge variant="outline">Game {pot.game_number}</Badge>
            <Badge variant="outline">factor {pot.factor}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Top averager earns HDCP 0; everyone else{' '}
            <code>floor((top − avg) × {pot.factor})</code> clamped to [{pot.hdcp_min},{' '}
            {pot.hdcp_max}].
          </p>
        </div>
        {adminMode && (
          <div className="flex gap-2">
            <ManageEntrantsDialog
              pot={pot}
              eventPlayers={eventPlayers}
              currentEntries={entries}
              averages={epAverages}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => remove.mutate(pot.id)}
              aria-label={`Delete pot ${pot.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {adminMode ? 'No entrants yet — click Manage entrants.' : 'No entrants yet.'}
        </p>
      ) : pot.type === 'singles' ? (
        <SinglesTable rows={singles} />
      ) : (
        <DoublesTable
          singles={singles}
          pairs={entries.flatMap((e) => {
            if (!e.partner_event_player_id) return [];
            // Dedupe bidirectional pairs: only keep the lexicographically smaller half
            if (e.event_player_id < e.partner_event_player_id) {
              return [{ a: e.event_player_id, b: e.partner_event_player_id }];
            }
            return [];
          })}
        />
      )}
    </div>
  );
}

function SinglesTable({ rows }: { rows: SinglesPotRow[] }) {
  const sorted = [...rows].sort(
    (a, b) => (b.finalScore ?? -1) - (a.finalScore ?? -1)
  );
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">Avg</TableHead>
          <TableHead className="text-right">Pot HDCP</TableHead>
          <TableHead className="text-right">Scratch</TableHead>
          <TableHead className="text-right">Final</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((r, i) => (
          <TableRow key={r.eventPlayerId}>
            <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {r.average !== null ? r.average.toFixed(1) : '—'}
            </TableCell>
            <TableCell className="text-right tabular-nums">{r.potHandicap}</TableCell>
            <TableCell className="text-right tabular-nums">
              {r.scratchScore ?? '—'}
            </TableCell>
            <TableCell className="text-right tabular-nums font-semibold">
              {r.finalScore ?? '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DoublesTable({
  singles,
  pairs,
}: {
  singles: SinglesPotRow[];
  pairs: Array<{ a: string; b: string }>;
}) {
  const rows = buildDoublesPot({ singles, pairs });
  const sorted = [...rows].sort((x, y) => (y.teamFinal ?? -1) - (x.teamFinal ?? -1));
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Entrants need to be paired. Open Manage entrants and use Auto-pair.
      </p>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Team HDCP</TableHead>
          <TableHead className="text-right">Team Scratch</TableHead>
          <TableHead className="text-right">Team Final</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((r, i) => (
          <TableRow key={r.pairKey}>
            <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
            <TableCell>
              <div className="font-medium">
                {r.a.name} <span className="text-muted-foreground">+</span> {r.b.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {r.a.potHandicap} HDCP · {r.b.potHandicap} HDCP
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">{r.teamHandicap}</TableCell>
            <TableCell className="text-right tabular-nums">
              {r.teamScratch ?? '—'}
            </TableCell>
            <TableCell className="text-right tabular-nums font-semibold">
              {r.teamFinal ?? '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ---------- create dialog ----------

function CreatePotDialog({
  totalGames,
  onCreate,
}: {
  totalGames: number;
  onCreate: (input: {
    type: PotGameType;
    name: string;
    game_number: number;
    factor: number;
    hdcp_min: number;
    hdcp_max: number;
  }) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<PotGameType>('singles');
  const [name, setName] = React.useState('');
  const [gameNumber, setGameNumber] = React.useState(1);
  const [factor, setFactor] = React.useState(1);
  const [min, setMin] = React.useState(0);
  const [max, setMax] = React.useState(100);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New pot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New pot game</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as PotGameType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singles">Singles</SelectItem>
                  <SelectItem value="doubles">Doubles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pot_name">Name</Label>
              <Input
                id="pot_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Weekly singles pot"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <Label>Game #</Label>
              <Input
                type="number"
                min={1}
                max={totalGames}
                value={gameNumber}
                onChange={(e) => setGameNumber(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Factor</Label>
              <Input
                type="number"
                step={0.01}
                min={0}
                max={2}
                value={factor}
                onChange={(e) => setFactor(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Min</Label>
              <Input
                type="number"
                min={0}
                max={300}
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Max</Label>
              <Input
                type="number"
                min={0}
                max={300}
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              onCreate({
                type,
                name: name.trim(),
                game_number: gameNumber,
                factor,
                hdcp_min: min,
                hdcp_max: max,
              });
              setOpen(false);
              setName('');
              setGameNumber(1);
              setFactor(1);
              setMin(0);
              setMax(100);
              setType('singles');
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- manage entrants (pick who's in + pair doubles) ----------

function ManageEntrantsDialog({
  pot,
  eventPlayers,
  currentEntries,
  averages,
}: {
  pot: PotGameRow;
  eventPlayers: Array<EventPlayerRow & { player: PlayerRow }>;
  currentEntries: PotGameEntryRow[];
  averages: Map<string, number | null>;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [pairs, setPairs] = React.useState<Map<string, string>>(new Map());

  React.useEffect(() => {
    if (open) {
      setSelected(new Set(currentEntries.map((e) => e.event_player_id)));
      const m = new Map<string, string>();
      for (const e of currentEntries) {
        if (e.partner_event_player_id) m.set(e.event_player_id, e.partner_event_player_id);
      }
      setPairs(m);
    }
  }, [open, currentEntries]);

  const save = useMutation({
    mutationFn: async () => {
      const entries: Array<{
        event_player_id: string;
        partner_event_player_id: string | null;
      }> = Array.from(selected).map((epId) => ({
        event_player_id: epId,
        partner_event_player_id: pot.type === 'doubles' ? pairs.get(epId) ?? null : null,
      }));
      await replacePotGameEntries(pot.id, entries);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pot-entries', pot.id] });
      toast.success('Entrants updated');
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed'),
  });

  const saveSettings = useMutation({
    mutationFn: async (patch: Partial<PotGameRow>) => updatePotGame(pot.id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pot-games', pot.session_id] }),
  });

  const rows = eventPlayers.map((ep) => ({
    ep,
    selected: selected.has(ep.id),
    partner: pairs.get(ep.id) ?? null,
    avg: averages.get(ep.id) ?? null,
  }));

  function togglePlayer(epId: string) {
    const next = new Set(selected);
    if (next.has(epId)) {
      next.delete(epId);
      const pnext = new Map(pairs);
      const partner = pnext.get(epId);
      pnext.delete(epId);
      if (partner) pnext.delete(partner);
      setPairs(pnext);
    } else {
      next.add(epId);
    }
    setSelected(next);
  }

  function autoPair() {
    const entrants = Array.from(selected).map((id) => {
      const avg = averages.get(id) ?? 0;
      return { eventPlayerId: id, average: avg };
    });
    const suggested = suggestDoublesPairs(entrants);
    const m = new Map<string, string>();
    for (const p of suggested) {
      m.set(p.a, p.b);
      m.set(p.b, p.a);
    }
    setPairs(m);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Manage entrants
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>{pot.name} · entrants</DialogTitle>
        </DialogHeader>

        {pot.type === 'doubles' && (
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={autoPair}
              disabled={selected.size < 2}
            >
              <Wand2 className="h-4 w-4" /> Auto-pair (high + low avg)
            </Button>
          </div>
        )}

        <div className="max-h-[50vh] overflow-y-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">In</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Avg</TableHead>
                {pot.type === 'doubles' && <TableHead>Partner</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.ep.id}
                  className={cn(!r.selected && 'opacity-60')}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={r.selected}
                      onChange={() => togglePlayer(r.ep.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{r.ep.player.full_name}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {r.avg !== null ? r.avg.toFixed(1) : '—'}
                  </TableCell>
                  {pot.type === 'doubles' && (
                    <TableCell>
                      <Select
                        value={r.partner ?? ''}
                        onValueChange={(v) => {
                          const partnerId = v === 'none' ? null : v;
                          const next = new Map(pairs);
                          const prevPartner = next.get(r.ep.id);
                          if (prevPartner) next.delete(prevPartner);
                          if (partnerId) {
                            const previousOfNew = next.get(partnerId);
                            if (previousOfNew) next.delete(previousOfNew);
                            next.set(r.ep.id, partnerId);
                            next.set(partnerId, r.ep.id);
                          } else {
                            next.delete(r.ep.id);
                          }
                          setPairs(next);
                        }}
                        disabled={!r.selected}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {eventPlayers
                            .filter(
                              (ep) =>
                                ep.id !== r.ep.id && selected.has(ep.id)
                            )
                            .map((ep) => (
                              <SelectItem key={ep.id} value={ep.id}>
                                {ep.player.full_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-md border p-3 grid gap-3 sm:grid-cols-4 text-xs">
          <div className="space-y-1">
            <Label>Factor</Label>
            <Input
              type="number"
              step={0.01}
              min={0}
              max={2}
              defaultValue={Number(pot.factor)}
              onBlur={(e) => {
                const v = Number(e.target.value);
                if (v !== Number(pot.factor)) saveSettings.mutate({ factor: v });
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>Min</Label>
            <Input
              type="number"
              min={0}
              max={300}
              defaultValue={pot.hdcp_min}
              onBlur={(e) => {
                const v = Number(e.target.value);
                if (v !== pot.hdcp_min) saveSettings.mutate({ hdcp_min: v });
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>Max</Label>
            <Input
              type="number"
              min={0}
              max={300}
              defaultValue={pot.hdcp_max}
              onBlur={(e) => {
                const v = Number(e.target.value);
                if (v !== pot.hdcp_max) saveSettings.mutate({ hdcp_max: v });
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>Game #</Label>
            <Input
              type="number"
              min={1}
              max={20}
              defaultValue={pot.game_number}
              onBlur={(e) => {
                const v = Number(e.target.value);
                if (v !== pot.game_number) saveSettings.mutate({ game_number: v });
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Save entrants
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
