import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
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
import {
  createLeague,
  getLeague,
  listLeagues,
  updateLeague,
} from '@/lib/data/leagues';
import { DAY_NAMES } from '@/lib/schedule';
import { DEFAULT_HANDICAP_FORMULA, computeHandicap } from '@/lib/handicap';

const schema = z.object({
  name: z.string().min(2).max(120),
  acronym: z.string().max(30).optional().or(z.literal('')),
  parent_league_id: z.string().optional().or(z.literal('')),
  center_name: z.string().max(120).optional().or(z.literal('')),
  day_of_week: z.string().optional().or(z.literal('')), // store as string, coerce on submit
  start_time_local: z.string().optional().or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  logo_url: z.string().url('Must be a URL').optional().or(z.literal('')),
  banner_url: z.string().url('Must be a URL').optional().or(z.literal('')),
  hdcp_base: z.coerce.number().int().min(100).max(300),
  hdcp_factor: z.coerce.number().min(0).max(2),
  hdcp_max: z.coerce.number().int().min(0).max(300),
  hdcp_min: z.coerce.number().int().min(0).max(300),
});
type FormValues = z.infer<typeof schema>;

const TIMEZONES = ['Asia/Manila', 'Asia/Singapore', 'Asia/Tokyo', 'UTC'];

export function LeagueEditorPage() {
  const { leagueId } = useParams();
  const isEdit = Boolean(leagueId);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => getLeague(leagueId!),
    enabled: isEdit,
  });

  const { data: allLeagues = [] } = useQuery({
    queryKey: ['leagues'],
    queryFn: listLeagues,
  });

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
      timezone: 'Asia/Manila',
      hdcp_base: DEFAULT_HANDICAP_FORMULA.base,
      hdcp_factor: DEFAULT_HANDICAP_FORMULA.factor,
      hdcp_max: DEFAULT_HANDICAP_FORMULA.max,
      hdcp_min: DEFAULT_HANDICAP_FORMULA.min,
    },
  });

  if (isEdit && existing && !watch('name')) {
    reset({
      name: existing.name,
      acronym: existing.acronym ?? '',
      parent_league_id: existing.parent_league_id ?? '',
      center_name: existing.center_name ?? '',
      day_of_week: existing.day_of_week != null ? String(existing.day_of_week) : '',
      start_time_local: existing.start_time_local ?? '',
      timezone: existing.timezone ?? 'Asia/Manila',
      description: existing.description ?? '',
      logo_url: existing.logo_url ?? '',
      banner_url: existing.banner_url ?? '',
      hdcp_base: existing.hdcp_base,
      hdcp_factor: Number(existing.hdcp_factor),
      hdcp_max: existing.hdcp_max,
      hdcp_min: existing.hdcp_min,
    });
  }

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      acronym: values.acronym ? values.acronym : null,
      parent_league_id: values.parent_league_id ? values.parent_league_id : null,
      center_name: values.center_name ? values.center_name : null,
      day_of_week:
        values.day_of_week !== '' && values.day_of_week != null
          ? (Number(values.day_of_week) as 0 | 1 | 2 | 3 | 4 | 5 | 6)
          : null,
      start_time_local: values.start_time_local ? values.start_time_local : null,
      timezone: values.timezone ? values.timezone : null,
      description: values.description ? values.description : null,
      logo_url: values.logo_url ? values.logo_url : null,
      banner_url: values.banner_url ? values.banner_url : null,
      hdcp_base: values.hdcp_base,
      hdcp_factor: values.hdcp_factor,
      hdcp_max: values.hdcp_max,
      hdcp_min: values.hdcp_min,
    };
    try {
      if (isEdit && leagueId) {
        await updateLeague(leagueId, payload);
        toast.success('League updated');
        qc.invalidateQueries({ queryKey: ['leagues'] });
        qc.invalidateQueries({ queryKey: ['league', leagueId] });
        navigate(`/admin/leagues/${leagueId}`);
      } else {
        const created = await createLeague(payload);
        toast.success('League created');
        qc.invalidateQueries({ queryKey: ['leagues'] });
        navigate(`/admin/leagues/${created.id}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save league');
    }
  };

  const createMutation = useMutation({ mutationFn: onSubmit });

  const previewHdcp = computeHandicap(
    {
      base: Number(watch('hdcp_base') ?? 0),
      factor: Number(watch('hdcp_factor') ?? 0),
      min: Number(watch('hdcp_min') ?? 0),
      max: Number(watch('hdcp_max') ?? 0),
    },
    160
  );

  const parentCandidates = allLeagues.filter((l) => l.id !== leagueId);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to={isEdit ? `/admin/leagues/${leagueId}` : '/admin/leagues'}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit league' : 'Create league'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEdit && isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form
              onSubmit={handleSubmit((v) => createMutation.mutateAsync(v))}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Manila Tenpin Bowlers Association – Remate"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acronym">Acronym</Label>
                  <Input id="acronym" {...register('acronym')} placeholder="MTBA-Remate" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Parent league (optional)</Label>
                <Select
                  value={watch('parent_league_id') ?? ''}
                  onValueChange={(v) =>
                    setValue('parent_league_id', v === 'none' ? '' : v, { shouldDirty: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {parentCandidates.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="center_name">Bowling center</Label>
                  <Input
                    id="center_name"
                    {...register('center_name')}
                    placeholder="Playdium Bowling Center"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div className="space-y-2 col-span-2">
                    <Label>Meets on</Label>
                    <Select
                      value={watch('day_of_week') ?? ''}
                      onValueChange={(v) =>
                        setValue('day_of_week', v === 'none' ? '' : v, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {(Object.entries(DAY_NAMES) as Array<[string, string]>).map(
                          ([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time_local">Time</Label>
                    <Input
                      id="start_time_local"
                      type="time"
                      {...register('start_time_local')}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={watch('timezone') ?? 'Asia/Manila'}
                  onValueChange={(v) => setValue('timezone', v, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('description')}
                  placeholder="Short league summary shown on the public profile."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    {...register('logo_url')}
                    placeholder="https://…/logo.png"
                  />
                  {errors.logo_url && (
                    <p className="text-sm text-destructive">{errors.logo_url.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner_url">Banner URL</Label>
                  <Input
                    id="banner_url"
                    {...register('banner_url')}
                    placeholder="https://…/banner.jpg"
                  />
                  {errors.banner_url && (
                    <p className="text-sm text-destructive">{errors.banner_url.message}</p>
                  )}
                </div>
              </div>

              <div className="rounded-md border p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">Default handicap formula</h3>
                  <p className="text-xs text-muted-foreground">
                    Events under this league inherit these defaults. You can still override
                    per event.
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
                  <strong className="text-foreground">HDCP {previewHdcp}</strong>
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create league'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
