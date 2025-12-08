import { useState, useEffect } from 'react';
import { Sparkles, Plus, Lightbulb } from 'lucide-react';
import type { Trip, TripDay, Activity } from '../../types';
import { getTripDays, createTripDay, createActivity } from '../../services/trips';
import { generateItinerary } from '../../services/ai';
import { DayColumn } from './DayColumn';
import { RecommendationsPanel } from './RecommendationsPanel';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';

interface ItineraryTabProps {
  trip: Trip;
}

export function ItineraryTab({ trip }: ItineraryTabProps) {
  const [days, setDays] = useState<TripDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  useRealtimeSubscription('trip_days', `trip_id=eq.${trip.id}`, loadDays);
  useRealtimeSubscription('activities', null, loadDays);

  useEffect(() => {
    loadDays();
  }, [trip.id]);

  async function loadDays() {
    try {
      const daysData = await getTripDays(trip.id);
      setDays(daysData);
    } catch (error) {
      console.error('Error loading days:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateItinerary() {
    setGenerating(true);
    setError('');

    try {
      const response = await generateItinerary(trip);

      for (const day of response.days) {
        const tripDay = await createTripDay({
          trip_id: trip.id,
          day_number: day.dayNumber,
          date: day.date,
          title: day.title,
        });

        for (let i = 0; i < day.activities.length; i++) {
          const act = day.activities[i];
          await createActivity({
            trip_day_id: tripDay.id,
            title: act.title,
            start_time: act.startTime,
            end_time: act.endTime,
            category: act.category,
            location: act.location,
            notes: act.notes,
            budget_estimate: act.budgetEstimate,
            booking_required: act.bookingRequired,
            importance: act.importance,
            order_index: i,
          });
        }
      }

      await loadDays();
    } catch (error) {
      console.error('Error generating itinerary:', error);
      setError('We couldn\'t generate your itinerary this time. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {days.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No itinerary yet
          </h3>
          <p className="text-gray-600 mb-6">
            Let AI create a personalized itinerary based on your trip preferences
          </p>
          <button
            onClick={handleGenerateItinerary}
            disabled={generating}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {generating ? 'Generating...' : 'Generate AI Itinerary'}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Your Itinerary
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showRecommendations ? 'Hide' : 'Show'} Recommendations
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {days.map((day) => (
              <DayColumn key={day.id} day={day} onUpdate={loadDays} />
            ))}
          </div>
        </div>
      )}

      {showRecommendations && (
        <RecommendationsPanel
          trip={trip}
          onClose={() => setShowRecommendations(false)}
          onActivityAdded={loadDays}
        />
      )}
    </div>
  );
}
