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
import { ImageUpload } from '@/components/ui/image-upload';
import {
  createAssociation,
  getAssociation,
  updateAssociation,
} from '@/lib/data/associations';
import { errorMessage } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2).max(120),
  acronym: z.string().max(30).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  image_url: z.string().url('Must be a URL').optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function AssociationEditorPage() {
  const { associationId } = useParams();
  const isEdit = Boolean(associationId);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ['association', associationId],
    queryFn: () => getAssociation(associationId!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (isEdit && existing && !watch('name')) {
    reset({
      name: existing.name,
      acronym: existing.acronym ?? '',
      description: existing.description ?? '',
      image_url: existing.image_url ?? '',
    });
  }

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      acronym: values.acronym ? values.acronym : null,
      description: values.description ? values.description : null,
      image_url: values.image_url ? values.image_url : null,
    };
    try {
      if (isEdit && associationId) {
        await updateAssociation(associationId, payload);
        toast.success('Association updated');
        qc.invalidateQueries({ queryKey: ['associations'] });
        qc.invalidateQueries({ queryKey: ['association', associationId] });
        navigate(`/admin/associations/${associationId}`);
      } else {
        const created = await createAssociation(payload);
        toast.success('Association created');
        qc.invalidateQueries({ queryKey: ['associations'] });
        navigate(`/admin/associations/${created.id}`);
      }
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const submit = useMutation({ mutationFn: onSubmit });

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to={isEdit ? `/admin/associations/${associationId}` : '/admin/associations'}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit association' : 'Create association'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEdit && isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form
              onSubmit={handleSubmit((v) => submit.mutateAsync(v))}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Manila Tenpin Bowlers Association"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acronym">Acronym</Label>
                  <Input id="acronym" {...register('acronym')} placeholder="MTBA" />
                </div>
              </div>

              <ImageUpload
                folder={associationId ? `associations/${associationId}` : 'associations/drafts'}
                kind="logo"
                label="Image"
                value={watch('image_url') || null}
                onChange={(v) => setValue('image_url', v ?? '', { shouldDirty: true })}
                previewClassName="aspect-square max-w-[160px]"
              />
              {errors.image_url && (
                <p className="text-sm text-destructive">{errors.image_url.message}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('description')}
                  placeholder="Short summary shown on the public association page."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
