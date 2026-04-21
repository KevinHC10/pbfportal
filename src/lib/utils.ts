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
