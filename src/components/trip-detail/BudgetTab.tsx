import { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import type { Trip, Expense, ExpenseCategory } from '../../types';
import { getExpenses, createExpense, deleteExpense } from '../../services/expenses';

interface BudgetTabProps {
  trip: Trip;
}

export function BudgetTab({ trip }: BudgetTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'food' as ExpenseCategory,
    description: '',
    amount: 0,
    currency: 'USD',
    note: '',
  });

  useEffect(() => {
    loadExpenses();
  }, [trip.id]);

  async function loadExpenses() {
    try {
      const data = await getExpenses(trip.id);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddExpense() {
    if (!newExpense.description || newExpense.amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const expense = await createExpense({
        trip_id: trip.id,
        ...newExpense,
      });
      setExpenses([expense, ...expenses]);
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        category: 'food',
        description: '',
        amount: 0,
        currency: 'USD',
        note: '',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to add expense: ${errorMessage}`);
    }
  }

  async function handleDelete(expenseId: string) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await deleteExpense(expenseId);
      setExpenses(expenses.filter((e) => e.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-subtle min-h-screen">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Spent */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Total Spent</h4>
            <div className="p-2 bg-primary-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-neutral-900 mb-1">
            ${totalSpent.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-500">{expenses.length} transactions</p>
        </div>

        {/* Transaction Count */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Transactions</h4>
            <div className="p-2 bg-secondary-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-secondary-600" />
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-neutral-900 mb-1">
            {expenses.length}
          </p>
          <p className="text-xs text-neutral-500">Tracked expenses</p>
        </div>

        {/* Average per Day */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Avg/Day</h4>
            <div className="p-2 bg-accent-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-accent-600" />
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-neutral-900 mb-1">
            ${expenses.length > 0 ? (totalSpent / expenses.length).toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-neutral-500">Per transaction</p>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="card-elevated mb-8">
        <h4 className="text-lg font-display font-bold text-neutral-900 mb-6">Spending by Category</h4>
        <div className="space-y-5">
          {totalSpent === 0 ? (
            <p className="text-center text-neutral-500 py-8">No spending data yet</p>
          ) : (
            Object.entries(categoryTotals).map(([category, total]) => {
              const percentage = (total / totalSpent) * 100;
              const categoryColors = {
                transport: { bg: 'bg-blue-100', bar: 'bg-blue-500', text: 'text-blue-700' },
                accommodation: { bg: 'bg-purple-100', bar: 'bg-purple-500', text: 'text-purple-700' },
                food: { bg: 'bg-green-100', bar: 'bg-green-500', text: 'text-green-700' },
                activities: { bg: 'bg-yellow-100', bar: 'bg-yellow-500', text: 'text-yellow-700' },
                other: { bg: 'bg-neutral-100', bar: 'bg-neutral-500', text: 'text-neutral-700' },
              };
              const colors = categoryColors[category as keyof typeof categoryColors] || categoryColors.other;
              
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <span className={`text-sm font-bold ${colors.text}`}>
                          {category.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 capitalize">{category}</p>
                        <p className="text-xs text-neutral-500">${total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900">{percentage.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${colors.bar} h-3 rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="card-elevated mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
            <h4 className="text-lg font-display font-bold text-neutral-900">Add Expense</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Date</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                className="input-field"
              >
                <option value="transport">✈️ Transport</option>
                <option value="accommodation">🏨 Accommodation</option>
                <option value="food">🍽️ Food</option>
                <option value="activities">🎭 Activities</option>
                <option value="other">📦 Other</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Description</label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="input-field"
              placeholder="e.g., Taxi to airport"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                value={isNaN(newExpense.amount) || newExpense.amount === 0 ? "" : newExpense.amount}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewExpense({
                    ...newExpense,
                    amount: val === "" ? 0 : parseFloat(val)
                  });
                }}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Currency</label>
              <input
                type="text"
                value={newExpense.currency}
                onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Note (Optional)</label>
            <textarea
              value={newExpense.note}
              onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
              className="input-field resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddExpense}
              className="flex-1 btn-primary"
            >
              Add Expense
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Expense Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mb-8 flex items-center justify-center px-6 py-4 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all font-semibold group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          Add Expense
        </button>
      )}

      {/* Expenses Table */}
      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <DollarSign className="w-full h-full" />
          </div>
          <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
            No expenses recorded
          </h3>
          <p className="text-neutral-600 mb-6">
            Start adding expenses to track your budget
          </p>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-neutral-900">{expense.description}</div>
                    {expense.note && <div className="text-neutral-500 text-xs mt-1">{expense.note}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-primary text-xs capitalize">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-neutral-900 text-right">
                    {expense.currency} ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="btn-icon text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
