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

  if (editing) {
    return (
      <div className="card-elevated border-primary-300 bg-primary-50 animate-slide-up">
        <div className="space-y-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="Activity title"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
              placeholder="Category"
            />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
              placeholder="Location"
            />
          </div>

          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input-field resize-none"
            placeholder="Notes"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.01"
              value={formData.budget_estimate}
              onChange={(e) => setFormData({ ...formData, budget_estimate: parseFloat(e.target.value) })}
              className="input-field"
              placeholder="Budget"
            />
            <select
              value={formData.importance}
              onChange={(e) => setFormData({ ...formData, importance: e.target.value as any })}
              className="input-field"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <label className="flex items-center px-4 py-3 border border-neutral-300 rounded-lg bg-white cursor-pointer hover:bg-neutral-50 transition-colors font-medium">
            <input
              type="checkbox"
              checked={formData.booking_required}
              onChange={(e) => setFormData({ ...formData, booking_required: e.target.checked })}
              className="mr-3 w-4 h-4"
            />
            <span className="text-neutral-700">Booking Required</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 btn-outline flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryEmojis = {
    food: '🍽️',
    adventure: '🎯',
    culture: '🏛️',
    nightlife: '🎉',
    chill: '😌',
    default: '📍',
  };

  const categoryEmoji = categoryEmojis[formData.category.toLowerCase() as keyof typeof categoryEmojis] || categoryEmojis.default;

  return (
    <div className="card hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{categoryEmoji}</span>
            <h5 className="font-display font-bold text-neutral-900 text-lg group-hover:text-primary-600 transition-colors">
              {activity.title}
            </h5>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-neutral-600 font-medium mb-3">
            {activity.start_time && activity.end_time && (
              <div className="flex items-center gap-1 bg-neutral-100 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-primary-600" />
                {activity.start_time} - {activity.end_time}
              </div>
            )}
            {activity.location && (
              <div className="flex items-center gap-1 bg-neutral-100 px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4 text-secondary-600" />
                {activity.location}
              </div>
            )}
            {activity.budget_estimate > 0 && (
              <div className="flex items-center gap-1 bg-neutral-100 px-3 py-1 rounded-full">
                <DollarSign className="w-4 h-4 text-accent-600" />
                ${activity.budget_estimate}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={handleMoveUp}
            className="btn-icon text-neutral-400 hover:text-primary-600 hover:bg-primary-100 transition-all"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={handleMoveDown}
            className="btn-icon text-neutral-400 hover:text-primary-600 hover:bg-primary-100 transition-all"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="btn-icon text-neutral-400 hover:text-primary-600 hover:bg-primary-100 transition-all"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="btn-icon text-neutral-400 hover:text-red-600 hover:bg-red-100 transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activity.notes && (
        <p className="text-sm text-neutral-700 mb-3 leading-relaxed">{activity.notes}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <span className="badge badge-primary text-xs">
          {activity.category}
        </span>
        <span className={`badge text-xs font-semibold ${
          activity.importance === 'high' ? 'badge-error' :
          activity.importance === 'medium' ? 'badge-warning' :
          'badge-primary'
        }`}>
          {activity.importance.charAt(0).toUpperCase() + activity.importance.slice(1)}
        </span>
        {activity.booking_required && (
          <span className="badge badge-accent text-xs flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Booking Req.
          </span>
        )}
      </div>
    </div>
  );
}
