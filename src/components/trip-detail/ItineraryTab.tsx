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
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-subtle min-h-screen">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium animate-slide-up">
          {error}
        </div>
      )}

      {days.length === 0 ? (
        <div className="card-elevated text-center py-24 max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-primary-600" />
            </div>
          </div>
          <h3 className="text-2xl font-display font-bold text-neutral-900 mb-3">
            Build Your Perfect Itinerary
          </h3>
          <p className="text-neutral-600 mb-8 text-lg">
            Our AI will craft a personalized itinerary based on your destination, preferences, and travel style.
          </p>
          <button
            onClick={handleGenerateItinerary}
            disabled={generating}
            className="btn-primary inline-flex items-center shadow-lg disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Magic...
              </>
            ) : (
              'Generate AI Itinerary'
            )}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <h3 className="text-3xl font-display font-bold text-neutral-900 mb-4 md:mb-0">
              Your Adventure Timeline
            </h3>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className={`flex items-center px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
                showRecommendations
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200'
              }`}
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              {showRecommendations ? 'Hide' : 'Show'} AI Suggestions
            </button>
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
