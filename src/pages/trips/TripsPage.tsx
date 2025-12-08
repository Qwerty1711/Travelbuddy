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
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
            <p className="text-gray-600">Plan and manage all your travel adventures</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Trip
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No trips yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first trip and start planning your adventure
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {trip.title}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {trip.destination}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(trip.id);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-4">
          <Calendar className="w-4 h-4 mr-1" />
          {startDate} - {endDate}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {trip.trip_type}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {trip.vibe}
          </span>
          {trip.num_travelers > 1 && (
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {trip.num_travelers} travelers
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
