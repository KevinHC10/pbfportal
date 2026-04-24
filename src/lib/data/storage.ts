import { supabase } from '@/lib/supabase';

const BUCKET = 'league-assets';
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export class UploadError extends Error {}

export interface UploadResult {
  publicUrl: string;
  path: string;
}

/**
 * Upload an image to the league-assets bucket under the given folder.
 * Returns the public URL suitable for storing in a `logo_url` / `banner_url`
 * column. Filenames are timestamped so uploading the same filename twice
 * doesn't collide.
 */
export async function uploadLeagueImage(
  folder: string,
  kind: 'logo' | 'banner',
  file: File
): Promise<UploadResult> {
  if (file.size > MAX_BYTES) {
    throw new UploadError(`File too large. Max ${MAX_BYTES / 1024 / 1024} MB.`);
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new UploadError('Unsupported image type. Use PNG, JPG, WebP, GIF, or SVG.');
  }
  const ext = extensionFor(file);
  const filename = `${kind}-${Date.now()}.${ext}`;
  const path = `${folder}/${filename}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    cacheControl: '3600',
    contentType: file.type,
  });
  if (error) throw new UploadError(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

function extensionFor(file: File): string {
  const guess = file.name.split('.').pop();
  if (guess && guess.length <= 5) return guess.toLowerCase();
  switch (file.type) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}
