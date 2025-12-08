import { supabase } from '../lib/supabase';
import type { Document } from '../types';

export async function getDocuments(tripId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('trip_id', tripId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data as Document[];
}

export async function uploadDocument(
  tripId: string,
  file: File
): Promise<Document> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const storagePath = `${tripId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('travel-documents')
    .upload(storagePath, file);

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('documents')
    .insert({
      trip_id: tripId,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      file_size: file.size,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Document;
}

export async function deleteDocument(documentId: string, storagePath: string) {
  const { error: storageError } = await supabase.storage
    .from('travel-documents')
    .remove([storagePath]);

  if (storageError) throw storageError;

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
}

export function getDocumentUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from('travel-documents')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}
