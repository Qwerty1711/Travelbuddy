import { supabase } from '../lib/supabase';
import type { Trip, TripDay, Activity } from '../types';

export async function getTrips() {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Trip[];
}

export async function getTripById(tripId: string) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .maybeSingle();

  if (error) throw error;
  return data as Trip | null;
}

export async function getTripByPublicId(publicId: string) {
  const { data: share, error: shareError } = await supabase
    .from('trip_shares')
    .select('trip_id')
    .eq('public_id', publicId)
    .maybeSingle();

  if (shareError) throw shareError;
  if (!share) return null;

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', share.trip_id)
    .maybeSingle();

  if (tripError) throw tripError;
  return trip as Trip | null;
}

export async function createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('trips')
    .insert(trip)
    .select()
    .single();

  if (error) {
    console.error('Error creating trip', error);
    throw error;
  }

  return data as Trip;
}

export async function updateTrip(tripId: string, updates: Partial<Trip>) {
  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
    .select()
    .single();

  if (error) throw error;
  return data as Trip;
}

export async function deleteTrip(tripId: string) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);

  if (error) throw error;
}

export async function getTripDays(tripId: string) {
  const { data, error } = await supabase
    .from('trip_days')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_number', { ascending: true });

  if (error) throw error;
  return data as TripDay[];
}

export async function createTripDay(tripDay: Omit<TripDay, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('trip_days')
    .insert(tripDay)
    .select()
    .single();

  if (error) throw error;
  return data as TripDay;
}

export async function updateTripDay(dayId: string, updates: Partial<TripDay>) {
  const { data, error } = await supabase
    .from('trip_days')
    .update(updates)
    .eq('id', dayId)
    .select()
    .single();

  if (error) throw error;
  return data as TripDay;
}

export async function deleteTripDay(dayId: string) {
  const { error } = await supabase
    .from('trip_days')
    .delete()
    .eq('id', dayId);

  if (error) throw error;
}

export async function getActivitiesByDayId(dayId: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('trip_day_id', dayId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data as Activity[];
}

export async function createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single();

  if (error) throw error;
  return data as Activity;
}

export async function updateActivity(activityId: string, updates: Partial<Activity>) {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', activityId)
    .select()
    .single();

  if (error) throw error;
  return data as Activity;
}

export async function deleteActivity(activityId: string) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId);

  if (error) throw error;
}

export async function createTripShare(tripId: string) {
  const { data, error } = await supabase
    .from('trip_shares')
    .insert({ trip_id: tripId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTripShare(tripId: string) {
  const { data, error } = await supabase
    .from('trip_shares')
    .select('*')
    .eq('trip_id', tripId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
