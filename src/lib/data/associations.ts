import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import type { AssociationRow, LeagueRow } from '@/types/db';

export interface AssociationInput {
  name: string;
  acronym?: string | null;
  image_url?: string | null;
  description?: string | null;
}

export async function listAssociations(): Promise<AssociationRow[]> {
  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as AssociationRow[];
}

export async function getAssociation(id: string): Promise<AssociationRow | null> {
  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as AssociationRow | null;
}

export async function getAssociationBySlug(slug: string): Promise<AssociationRow | null> {
  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .eq('public_slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as AssociationRow | null;
}

export async function createAssociation(input: AssociationInput): Promise<AssociationRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('associations')
    .insert({ ...input, public_slug: generateSlug(), created_by: auth.user.id })
    .select()
    .single();
  if (error) throw error;
  return data as AssociationRow;
}

export async function updateAssociation(
  id: string,
  patch: Partial<AssociationInput>
): Promise<AssociationRow> {
  const { data, error } = await supabase
    .from('associations')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as AssociationRow;
}

export async function deleteAssociation(id: string): Promise<void> {
  const { error } = await supabase.from('associations').delete().eq('id', id);
  if (error) throw error;
}

export async function listLeaguesByAssociation(associationId: string): Promise<LeagueRow[]> {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('association_id', associationId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as LeagueRow[];
}
