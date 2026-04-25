import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createEvent, getEvent, updateEvent } from '@/lib/data/events';
import { listLeagues } from '@/lib/data/leagues';
import { listSeasons } from '@/lib/data/seasons';
import { computeHandicap, DEFAULT_HANDICAP_FORMULA } from '@/lib/handicap';

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  type: z.enum(['league', 'tournament']),
  start_date: z.string().min(1, 'Start date is required'),
  start_time: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  center_name: z.string().optional().or(z.literal('')),
  total_games: z.coerce.number().int().min(1).max(20),
  hdcp_base: z.coerce.number().int().min(100).max(300),
  hdcp_factor: z.coerce.number().min(0).max(2),
  hdcp_max: z.coerce.number().int().min(0).max(300),
  hdcp_min: z.coerce.number().int().min(0).max(300),
  league_id: z.string().optional().or(z.literal('')),
  season_id: z.string().optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function EventEditorPage() {
  const params = useParams();
  const eventId = params.eventId;
  const isEdit = Boolean(eventId);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const presetLeagueId = searchParams.get('league_id') ?? '';

  const { data: existing, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId!),
    enabled: isEdit,
  });

  const { data: leagues = [] } = useQuery({ queryKey: ['leagues'], queryFn: listLeagues });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'league',
      total_games: 3,
      league_id: presetLeagueId,
      season_id: '',
      start_time: '',
      hdcp_base: DEFAULT_HANDICAP_FORMULA.base,
      hdcp_factor: DEFAULT_HANDICAP_FORMULA.factor,
      hdcp_max: DEFAULT_HANDICAP_FORMULA.max,
      hdcp_min: DEFAULT_HANDICAP_FORMULA.min,
    },
  });

  if (isEdit && existing && !watch('name')) {
    reset({
      name: existing.name,
      type: existing.type,
      start_date: existing.start_date,
      start_time: existing.start_time ? existing.start_time.slice(0, 5) : '',
      end_date: existing.end_date ?? '',
      center_name: existing.center_name ?? '',
      total_games: existing.total_games,
      hdcp_base: existing.hdcp_base,
      hdcp_factor: Number(existing.hdcp_factor),
      hdcp_max: existing.hdcp_max,
      hdcp_min: existing.hdcp_min,
      league_id: existing.league_id ?? '',
      season_id: existing.season_id ?? '',
    });
  }

  const selectedLeagueIdForSeasons = watch('league_id') ?? '';
  const { data: seasonsForLeague = [] } = useQuery({
    queryKey: ['league-seasons', selectedLeagueIdForSeasons],
    queryFn: () => listSeasons(selectedLeagueIdForSeasons),
    enabled: Boolean(selectedLeagueIdForSeasons),
  });

  const selectedLeagueId = watch('league_id');
  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId);

  // When the user picks a league on a NEW event, inherit its defaults.
  const didApplyInheritance = React.useRef(false);
  React.useEffect(() => {
    if (isEdit) return;
    if (!selectedLeague) return;
    if (didApplyInheritance.current) return;
    didApplyInheritance.current = true;
    setValue('hdcp_base', selectedLeague.hdcp_base, { shouldDirty: true });
    setValue('hdcp_factor', Number(selectedLeague.hdcp_factor), { shouldDirty: true });
    setValue('hdcp_max', selectedLeague.hdcp_max, { shouldDirty: true });
    setValue('hdcp_min', selectedLeague.hdcp_min, { shouldDirty: true });
    if (selectedLeague.center_name) {
      setValue('center_name', selectedLeague.center_name, { shouldDirty: true });
    }
  }, [selectedLeague, isEdit, setValue]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      type: values.type,
      start_date: values.start_date,
      start_time: values.start_time ? values.start_time : null,
      end_date: values.end_date ? values.end_date : null,
      // Status is derived from date+time at display time. We default to 'upcoming'
      // as a column-level fallback for older clients / direct DB reads.
      status: 'upcoming' as const,
      center_name: values.center_name ? values.center_name : null,
      total_games: values.total_games,
      hdcp_base: values.hdcp_base,
      hdcp_factor: values.hdcp_factor,
      hdcp_max: values.hdcp_max,
      hdcp_min: values.hdcp_min,
      league_id: values.league_id ? values.league_id : null,
      season_id: values.season_id ? values.season_id : null,
    };
    try {
      if (isEdit && eventId) {
        await updateEvent(eventId, payload);
        toast.success('Event updated');
        qc.invalidateQueries({ queryKey: ['events'] });
        qc.invalidateQueries({ queryKey: ['event', eventId] });
        navigate(`/admin/events/${eventId}`);
      } else {
        const created = await createEvent(payload);
        toast.success('Event created');
        qc.invalidateQueries({ queryKey: ['events'] });
        navigate(`/admin/events/${created.id}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save event');
    }
  };

  const createMutation = useMutation({ mutationFn: onSubmit });
  const type = watch('type');
  const hdcpPreview = computeHandicap(
    {
      base: Number(watch('hdcp_base') ?? 0),
      factor: Number(watch('hdcp_factor') ?? 0),
      min: Number(watch('hdcp_min') ?? 0),
      max: Number(watch('hdcp_max') ?? 0),
    },
    160
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to={isEdit ? `/admin/events/${eventId}` : '/admin'}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit event' : 'Create event'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEdit && isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form
              onSubmit={handleSubmit((v) => createMutation.mutateAsync(v))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>League (optional)</Label>
                <Select
                  value={watch('league_id') ?? ''}
                  onValueChange={(v) =>
                    setValue('league_id', v === 'none' ? '' : v, { shouldDirty: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Standalone event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Standalone event</SelectItem>
                    {leagues.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                        {l.acronym ? ` (${l.acronym})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isEdit && selectedLeague && (
                  <p className="text-xs text-muted-foreground">
                    Inherited {selectedLeague.name}'s handicap formula and center. You can
                    still override below.
                  </p>
                )}
              </div>

              {selectedLeagueIdForSeasons && (
                <div className="space-y-2">
                  <Label>Season (optional)</Label>
                  <Select
                    value={watch('season_id') ?? ''}
                    onValueChange={(v) =>
                      setValue('season_id', v === 'none' ? '' : v, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No season</SelectItem>
                      {seasonsForLeague.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                          {s.status === 'active' ? ' (active)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {seasonsForLeague.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      This league has no seasons yet. Create one from the league detail
                      page.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} placeholder="Week 3 – Feb 14" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(v) =>
                    setValue('type', v as 'league' | 'tournament', { shouldDirty: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="league">League</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Status is derived automatically from the date + start time:{' '}
                  <strong>upcoming</strong> before the start moment,{' '}
                  <strong>active</strong> during, <strong>completed</strong> after.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start date</Label>
                  <Input id="start_date" type="date" {...register('start_date')} />
                  {errors.start_date && (
                    <p className="text-sm text-destructive">{errors.start_date.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start time</Label>
                  <Input id="start_time" type="time" {...register('start_time')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End date (optional)</Label>
                  <Input id="end_date" type="date" {...register('end_date')} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="center_name">Bowling center</Label>
                  <Input
                    id="center_name"
                    {...register('center_name')}
                    placeholder="Strike Lanes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_games">Games per session</Label>
                  <Input
                    id="total_games"
                    type="number"
                    min={1}
                    max={20}
                    {...register('total_games')}
                  />
                  {errors.total_games && (
                    <p className="text-sm text-destructive">{errors.total_games.message}</p>
                  )}
                </div>
              </div>

              <div className="rounded-md border p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">Handicap formula</h3>
                  <p className="text-xs text-muted-foreground">
                    {type === 'league' ? (
                      <>
                        Used by the <strong>Recompute handicaps</strong> action on the
                        roster page: <code>floor((base − home avg) × factor)</code>, clamped
                        to [min, max].
                      </>
                    ) : (
                      <>
                        For tournaments, handicap is set manually per bowler on the roster
                        page. The formula below is optional; use it if you want to apply it
                        from the roster page too.
                      </>
                    )}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label htmlFor="hdcp_base">Base</Label>
                    <Input id="hdcp_base" type="number" {...register('hdcp_base')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="hdcp_factor">Factor</Label>
                    <Input
                      id="hdcp_factor"
                      type="number"
                      step={0.01}
                      {...register('hdcp_factor')}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="hdcp_min">Min</Label>
                    <Input id="hdcp_min" type="number" {...register('hdcp_min')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="hdcp_max">Max</Label>
                    <Input id="hdcp_max" type="number" {...register('hdcp_max')} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Preview: a bowler averaging <strong>160</strong> →{' '}
                  <strong className="text-foreground">HDCP {hdcpPreview}</strong>
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
