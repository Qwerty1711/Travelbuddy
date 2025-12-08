import { supabase } from '../lib/supabase';
import type { Expense } from '../types';

export async function getExpenses(tripId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data as Expense[];
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(expenseId: string, updates: Partial<Expense>) {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', expenseId)
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(expenseId: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw error;
}
