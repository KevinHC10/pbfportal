import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(length = 10): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const arr = new Uint8Array(length);
  globalThis.crypto.getRandomValues(arr);
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

/**
 * Turn a display name into a readable slug with a short random suffix so it
 * stays unique across players of the same name.
 */
export function generateNamedSlug(name: string, suffixLength = 6): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'player';
  return `${base}-${generateSlug(suffixLength)}`;
}

/**
 * Pull a useful message out of any thrown value. Supabase's PostgrestError
 * isn't a native Error, so the common `e instanceof Error ? e.message : 'Failed'`
 * pattern hides the real cause. This handles Error, PostgrestError-shaped
 * objects, and bare strings, falling back to JSON for unknown shapes.
 */
export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message) return o.message;
    if (typeof o.error_description === 'string') return o.error_description;
    if (typeof o.details === 'string') return o.details;
    try {
      return JSON.stringify(e);
    } catch {
      return 'Unknown error';
    }
  }
  return 'Unknown error';
}
