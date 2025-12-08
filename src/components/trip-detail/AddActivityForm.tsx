import { useState, FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { createActivity } from '../../services/trips';

interface AddActivityFormProps {
  dayId: string;
  onCancel: () => void;
  onAdded: () => void;
}

export function AddActivityForm({ dayId, onCancel, onAdded }: AddActivityFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    start_time: '',
    end_time: '',
    category: '',
    location: '',
    notes: '',
    budget_estimate: 0,
    booking_required: false,
    importance: 'medium' as 'low' | 'medium' | 'high',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      await createActivity({
        trip_day_id: dayId,
        ...formData,
        order_index: Date.now(),
      });
      onAdded();
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Failed to create activity. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
      <div className="space-y-3">
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="Activity title"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Category (e.g., Food, Culture)"
          />
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Location"
          />
        </div>

        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={2}
          placeholder="Notes"
        />

        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            value={formData.budget_estimate}
            onChange={(e) => setFormData({ ...formData, budget_estimate: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Budget"
          />
          <select
            value={formData.importance}
            onChange={(e) => setFormData({ ...formData, importance: e.target.value as 'low' | 'medium' | 'high' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
            <input
              type="checkbox"
              checked={formData.booking_required}
              onChange={(e) => setFormData({ ...formData, booking_required: e.target.checked })}
              className="mr-2"
            />
            Booking Required
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Activity
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
