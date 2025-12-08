import { supabase } from '../lib/supabase';
import type { Note } from '../types';

export async function getNotes(tripId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_number', { ascending: true });

  if (error) throw error;
  return data as Note[];
}

export async function getNoteByDay(tripId: string, dayNumber: number) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('trip_id', tripId)
    .eq('day_number', dayNumber)
    .maybeSingle();

  if (error) throw error;
  return data as Note | null;
}

export async function upsertNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('notes')
    .upsert(note, {
      onConflict: 'trip_id,day_number',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}

export async function updateNoteAISummary(tripId: string, dayNumber: number, aiSummary: string) {
  const { data, error } = await supabase
    .from('notes')
    .update({ ai_summary: aiSummary })
    .eq('trip_id', tripId)
    .eq('day_number', dayNumber)
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}
