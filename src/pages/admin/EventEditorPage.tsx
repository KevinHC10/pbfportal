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
import { createEvent, getEvent, updateEvent } from '@/lib/data/events';

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  type: z.enum(['league', 'tournament']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().or(z.literal('')),
  status: z.enum(['upcoming', 'active', 'completed']),
  center_name: z.string().optional().or(z.literal('')),
  total_games: z.coerce.number().int().min(1).max(20),
});
type FormValues = z.infer<typeof schema>;

export function EventEditorPage() {
  const params = useParams();
  const eventId = params.eventId;
  const isEdit = Boolean(eventId);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId!),
    enabled: isEdit,
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
      type: 'league',
      status: 'upcoming',
      total_games: 3,
    },
  });

  // hydrate form when editing
  if (isEdit && existing && !watch('name')) {
    reset({
      name: existing.name,
      type: existing.type,
      start_date: existing.start_date,
      end_date: existing.end_date ?? '',
      status: existing.status,
      center_name: existing.center_name ?? '',
      total_games: existing.total_games,
    });
  }

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      type: values.type,
      start_date: values.start_date,
      end_date: values.end_date ? values.end_date : null,
      status: values.status,
      center_name: values.center_name ? values.center_name : null,
      total_games: values.total_games,
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
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} placeholder="Tuesday Night Classic" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(v) =>
                      setValue('status', v as FormValues['status'], { shouldDirty: true })
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start date</Label>
                  <Input id="start_date" type="date" {...register('start_date')} />
                  {errors.start_date && (
                    <p className="text-sm text-destructive">{errors.start_date.message}</p>
                  )}
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
