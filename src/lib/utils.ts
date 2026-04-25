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
