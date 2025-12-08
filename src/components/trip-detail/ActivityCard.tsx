import { useState } from 'react';
import { Clock, MapPin, DollarSign, Edit2, Trash2, Save, X, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import type { Activity } from '../../types';
import { updateActivity, deleteActivity } from '../../services/trips';

interface ActivityCardProps {
  activity: Activity;
  onUpdate: () => void;
}

export function ActivityCard({ activity, onUpdate }: ActivityCardProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: activity.title,
    start_time: activity.start_time || '',
    end_time: activity.end_time || '',
    category: activity.category,
    location: activity.location,
    notes: activity.notes,
    budget_estimate: activity.budget_estimate,
    booking_required: activity.booking_required,
    importance: activity.importance,
  });

  async function handleSave() {
    try {
      await updateActivity(activity.id, formData);
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Failed to update activity. Please try again.');
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      await deleteActivity(activity.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
    }
  }

  async function handleMoveUp() {
    try {
      await updateActivity(activity.id, { order_index: activity.order_index - 1.5 });
      onUpdate();
    } catch (error) {
      console.error('Error moving activity:', error);
    }
  }

  async function handleMoveDown() {
    try {
      await updateActivity(activity.id, { order_index: activity.order_index + 1.5 });
      onUpdate();
    } catch (error) {
      console.error('Error moving activity:', error);
    }
  }

  const importanceColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-red-100 text-red-700',
  };

  if (editing) {
    return (
      <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
        <div className="space-y-3">
          <input
            type="text"
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
              placeholder="Category"
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
              onClick={handleSave}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h5 className="font-semibold text-gray-900 mb-1">{activity.title}</h5>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            {activity.start_time && activity.end_time && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {activity.start_time} - {activity.end_time}
              </div>
            )}
            {activity.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {activity.location}
              </div>
            )}
            {activity.budget_estimate > 0 && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                ${activity.budget_estimate}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleMoveUp}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={handleMoveDown}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activity.notes && (
        <p className="text-sm text-gray-600 mb-2">{activity.notes}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
          {activity.category}
        </span>
        <span className={`px-2 py-1 text-xs rounded ${importanceColors[activity.importance]}`}>
          {activity.importance}
        </span>
        {activity.booking_required && (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Booking Required
          </span>
        )}
      </div>
    </div>
  );
}
