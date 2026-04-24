import * as React from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { uploadLeagueImage, UploadError } from '@/lib/data/storage';

interface Props {
  /** Folder under the bucket (usually the league id). */
  folder: string;
  kind: 'logo' | 'banner';
  value: string | null;
  onChange: (url: string | null) => void;
  /** Tailwind classes for the preview container. */
  previewClassName?: string;
  label?: string;
}

/**
 * File picker that uploads to Supabase Storage and reports back the public URL.
 * Also lets the admin paste a URL directly as an escape hatch.
 */
export function ImageUpload({
  folder,
  kind,
  value,
  onChange,
  previewClassName,
  label,
}: Props) {
  const [uploading, setUploading] = React.useState(false);
  const [urlMode, setUrlMode] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const res = await uploadLeagueImage(folder, kind, file);
      onChange(res.publicUrl);
      toast.success('Image uploaded');
    } catch (e) {
      toast.error(e instanceof UploadError ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label ?? (kind === 'logo' ? 'Logo' : 'Banner')}</span>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:underline"
          onClick={() => setUrlMode((v) => !v)}
        >
          {urlMode ? 'Upload file' : 'Paste URL instead'}
        </button>
      </div>

      {value ? (
        <div className={cn('relative rounded-md border bg-muted/30 overflow-hidden', previewClassName)}>
          <img
            src={value}
            alt={`${kind} preview`}
            className={cn(
              'w-full h-full',
              kind === 'logo' ? 'object-contain p-2' : 'object-cover'
            )}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 rounded-full bg-background/80 p-1 hover:bg-background"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm',
            previewClassName
          )}
        >
          {kind === 'logo' ? 'Square logo' : 'Wide banner'}
        </div>
      )}

      {urlMode ? (
        <Input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="https://…"
        />
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.currentTarget.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <ImagePlus className="h-4 w-4" />
            {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
          </Button>
        </>
      )}
    </div>
  );
}
