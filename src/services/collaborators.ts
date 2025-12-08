import { supabase } from '../lib/supabase';
import type { Collaborator } from '../types';

export async function getCollaborators(tripId: string) {
  const { data, error } = await supabase
    .from('collaborators')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Collaborator[];
}

export async function addCollaborator(
  tripId: string,
  userEmail: string,
  role: 'viewer' | 'editor'
) {
  const { data: userData, error: userError } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle();

  if (userError) throw new Error('User not found');
  if (!userData) throw new Error('User not found');

  const { data, error } = await supabase
    .from('collaborators')
    .insert({
      trip_id: tripId,
      user_id: userData.id,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Collaborator;
}

export async function updateCollaboratorRole(
  collaboratorId: string,
  role: 'viewer' | 'editor'
) {
  const { data, error } = await supabase
    .from('collaborators')
    .update({ role })
    .eq('id', collaboratorId)
    .select()
    .single();

  if (error) throw error;
  return data as Collaborator;
}

export async function removeCollaborator(collaboratorId: string) {
  const { error } = await supabase
    .from('collaborators')
    .delete()
    .eq('id', collaboratorId);

  if (error) throw error;
}

export async function checkUserRole(tripId: string, userId: string) {
  const { data: trip } = await supabase
    .from('trips')
    .select('owner_id')
    .eq('id', tripId)
    .maybeSingle();

  if (trip?.owner_id === userId) {
    return 'owner';
  }

  const { data: collaborator } = await supabase
    .from('collaborators')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  return collaborator?.role || null;
}
