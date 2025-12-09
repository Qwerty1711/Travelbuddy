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
  // Validate payload before sending
  const requiredFields = ['trip_id', 'date', 'category', 'description', 'amount', 'currency'];
  for (const field of requiredFields) {
    if (
      expense[field] === undefined ||
      expense[field] === null ||
      (typeof expense[field] === 'string' && expense[field].trim() === '')
    ) {
      throw new Error(`Missing or invalid field: ${field}`);
    }
  }

  // Ensure amount is a number and not NaN
  if (typeof expense.amount !== 'number' || isNaN(expense.amount) || expense.amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();

  if (error) {
    // Log error details for debugging
    console.error('Supabase insert error:', JSON.stringify(error, null, 2));
    console.error('Payload:', JSON.stringify(expense, null, 2));
    throw new Error(`Failed to create expense: ${error.message || JSON.stringify(error)}`);
  }
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
