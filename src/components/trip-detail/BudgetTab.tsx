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
      alert('Failed to add expense. Please try again.');
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

  const categoryColors = {
    transport: 'bg-blue-100 text-blue-700',
    accommodation: 'bg-purple-100 text-purple-700',
    food: 'bg-green-100 text-green-700',
    activities: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Total Spent</h4>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Transactions</h4>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{expenses.length}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Average per Day</h4>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${expenses.length > 0 ? (totalSpent / expenses.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h4>
        <div className="space-y-3">
          {Object.entries(categoryTotals).map(([category, total]) => {
            const percentage = (total / totalSpent) * 100;
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                  <span className="text-sm text-gray-600">${total.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Expense</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="transport">Transport</option>
                <option value="accommodation">Accommodation</option>
                <option value="food">Food</option>
                <option value="activities">Activities</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="e.g., Taxi to airport"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input
                type="text"
                value={newExpense.currency}
                onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <textarea
              value={newExpense.note}
              onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={2}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddExpense}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Add Expense
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Expense
        </button>
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No expenses recorded yet. Add your first expense above.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{expense.description}</div>
                    {expense.note && <div className="text-gray-500 text-xs">{expense.note}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${categoryColors[expense.category]}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {expense.currency} ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-gray-400 hover:text-red-600"
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
