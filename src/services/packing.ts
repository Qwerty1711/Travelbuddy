import { supabase } from '../lib/supabase';
import type { PackingItem } from '../types';

export async function getPackingItems(tripId: string) {
  const { data, error } = await supabase
    .from('packing_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('category', { ascending: true });

  if (error) throw error;
  return data as PackingItem[];
}

export async function createPackingItem(item: Omit<PackingItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('packing_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data as PackingItem;
}

export async function updatePackingItem(itemId: string, updates: Partial<PackingItem>) {
  const { data, error } = await supabase
    .from('packing_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as PackingItem;
}

export async function deletePackingItem(itemId: string) {
  const { error } = await supabase
    .from('packing_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function bulkCreatePackingItems(items: Omit<PackingItem, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('packing_items')
    .insert(items)
    .select();

  if (error) throw error;
  return data as PackingItem[];
}
