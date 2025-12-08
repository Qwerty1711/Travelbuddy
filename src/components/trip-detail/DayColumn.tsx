import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { TripDay, Activity } from '../../types';
import { getActivitiesByDayId } from '../../services/trips';
import { ActivityCard } from './ActivityCard';
import { AddActivityForm } from './AddActivityForm';

interface DayColumnProps {
  day: TripDay;
  onUpdate: () => void;
}

export function DayColumn({ day, onUpdate }: DayColumnProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [day.id]);

  async function loadActivities() {
    try {
      const data = await getActivitiesByDayId(day.id);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }

  const date = new Date(day.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="text-left">
          <h4 className="text-lg font-semibold text-gray-900">
            Day {day.day_number}: {day.title}
          </h4>
          <p className="text-sm text-gray-600">{date}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {expanded && (
        <div className="p-6 space-y-4">
          {activities.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-gray-500">
              No activities yet. Add your first activity below.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onUpdate={() => {
                    loadActivities();
                    onUpdate();
                  }}
                />
              ))}
            </div>
          )}

          {showAddForm ? (
            <AddActivityForm
              dayId={day.id}
              onCancel={() => setShowAddForm(false)}
              onAdded={() => {
                setShowAddForm(false);
                loadActivities();
                onUpdate();
              }}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Activity
            </button>
          )}
        </div>
      )}
    </div>
  );
}
