import { useState, useEffect } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import type { Trip, AIRecommendation } from '../../types';
import { getRecommendations } from '../../services/ai';

interface RecommendationsPanelProps {
  trip: Trip;
  onClose: () => void;
  onActivityAdded: () => void;
}

export function RecommendationsPanel({ trip, onClose, onActivityAdded }: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    try {
      const response = await getRecommendations(trip.destination, trip.interests);
      setRecommendations(response.recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {rec.category}
                    </span>
                    {rec.estimatedCost > 0 && (
                      <span className="text-gray-600">${rec.estimatedCost}</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      alert('Select a day and time in the itinerary to add this activity');
                    }}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
