import { supabase } from '../lib/supabase';
import type { PackingItem, GeneratePackingListRequest, AIPackingListResponse } from '../types';

const EDGE_FUNCTION_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

/**
 * Fetch all packing items for a trip, grouped by category
 */
export async function getPackingItems(tripId: string) {
  const { data, error } = await supabase
    .from('packing_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('category', { ascending: true });

  if (error) throw error;
  return data as PackingItem[];
}

/**
 * Create a single packing item
 */
export async function createPackingItem(item: Omit<PackingItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('packing_items')
    .insert(item as any)
    .select()
    .single();

  if (error) throw error;
  return data as PackingItem;
}

/**
 * Update a packing item (e.g., mark as packed)
 */
export async function updatePackingItem(itemId: string, updates: Partial<PackingItem>) {
  const safeUpdates: any = {};
  if ('item_name' in updates) safeUpdates.item_name = updates.item_name;
  if ('quantity' in updates) safeUpdates.quantity = updates.quantity;
  if ('note' in updates) safeUpdates.note = updates.note;
  if ('packed' in updates) safeUpdates.packed = updates.packed;
  if ('category' in updates) safeUpdates.category = updates.category;

  const { data, error } = await (supabase.from('packing_items') as any)
    .update(safeUpdates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as PackingItem;
}

/**
 * Delete a packing item
 */
export async function deletePackingItem(itemId: string) {
  const { error } = await supabase
    .from('packing_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

/**
 * Bulk create multiple packing items at once
 * Useful when importing AI-generated packing lists
 */
export async function bulkCreatePackingItems(items: Omit<PackingItem, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('packing_items')
    .insert(items as any)
    .select();

  if (error) throw error;
  return data as PackingItem[];
}

/**
 * Generate packing list using the AI Edge Function
 * 
 * @param request - GeneratePackingListRequest with trip context
 * @returns AI-generated packing list organized by category
 * 
 * @example
 * const response = await generatePackingListWithAI({
 *   destination: "Bali",
 *   startDate: "2024-12-20",
 *   endDate: "2024-12-27",
 *   tripType: "vacation",
 *   vibe: "relaxed",
 *   numTravelers: 2,
 *   hasChildren: false,
 *   hasElders: false,
 *   climate: "tropical"
 * });
 * 
 * // response.categories contains items organized by category
 * // Each item has: name, quantity, priority ("essential" | "important" | "optional"), and optional note
 */
export async function generatePackingListWithAI(
  request: GeneratePackingListRequest
): Promise<AIPackingListResponse> {
  const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/generatePackingList`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate packing list');
  }

  return await response.json();
}

/**
 * Helper function: Convert AI response to database format and save
 * Converts AIPackingListResponse items to PackingItem records
 * 
 * @param tripId - Trip ID to associate items with
 * @param aiResponse - Response from generatePackingListWithAI
 * @returns Array of created PackingItem records
 */
export async function saveAIPackingList(
  tripId: string,
  aiResponse: AIPackingListResponse
): Promise<PackingItem[]> {
  const items: Omit<PackingItem, 'id' | 'created_at' | 'updated_at'>[] = [];

  // Convert each category and item to database format
  Object.entries(aiResponse.categories).forEach(([category, categoryItems]) => {
    categoryItems.forEach((aiItem) => {
      items.push({
        trip_id: tripId,
        category,
        item_name: aiItem.name,
        quantity: aiItem.quantity,
        note: aiItem.note || `Priority: ${aiItem.priority}`,
        packed: false,
      });
    });
  });

  return bulkCreatePackingItems(items);
}
