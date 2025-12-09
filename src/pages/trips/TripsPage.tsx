import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Trash2 } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { CreateTripModal } from '../../components/trips/CreateTripModal';
import { getTrips, deleteTrip } from '../../services/trips';
import type { Trip } from '../../types';

export function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTrip(tripId: string) {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      await deleteTrip(tripId);
      setTrips(trips.filter((t) => t.id !== tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  }

  function handleTripCreated(newTrip: Trip) {
    setTrips([newTrip, ...trips]);
    setShowCreateModal(false);
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-subtle">
        <div className="px-8 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-2">
                My Adventures
              </h1>
              <p className="text-lg text-neutral-600">
                Discover, plan, and share your next travel experience
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Trip
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="spinner"></div>
            </div>
          ) : trips.length === 0 ? (
            <div className="card-elevated text-center py-24 max-w-2xl mx-auto">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-12 h-12 text-primary-600" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-neutral-900 mb-3">
                Ready to Explore?
              </h3>
              <p className="text-neutral-600 mb-8 text-lg">
                Start planning your dream adventure now. Create your first trip and let AI help you craft the perfect itinerary.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateTripModal
          onClose={() => setShowCreateModal(false)}
          onTripCreated={handleTripCreated}
        />
      )}
    </MainLayout>
  );
}

interface TripCardProps {
  trip: Trip;
  onDelete: (tripId: string) => void;
}

function TripCard({ trip, onDelete }: TripCardProps) {
  const startDate = new Date(trip.start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const endDate = new Date(trip.end_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const dayCount = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const gradients = [
    'from-primary-700 to-secondary-700',
    'from-accent-600 to-primary-700',
    'from-secondary-700 to-accent-600',
  ];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group card-hover overflow-hidden"
    >
      {/* Hero gradient - darker for better visibility */}
      <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden mb-4 shadow-md`}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-2 right-2 text-4xl">✈️</div>
          <div className="absolute bottom-2 left-2 text-4xl">🗺️</div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
              {trip.title}
            </h3>
            <div className="flex items-center text-neutral-600 text-sm font-medium">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{trip.destination}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(trip.id);
            }}
            className="btn-icon p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-2 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center text-neutral-500 text-sm mb-4 font-medium">
          <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{startDate}</span>
          <span className="mx-1">•</span>
          <span>{dayCount} {dayCount === 1 ? 'day' : 'days'}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="badge badge-primary text-xs">
            {trip.trip_type}
          </span>
          <span className="badge badge-secondary text-xs">
            {trip.vibe}
          </span>
          {trip.num_travelers > 1 && (
            <span className="badge badge-accent text-xs">
              {trip.num_travelers} travelers
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
