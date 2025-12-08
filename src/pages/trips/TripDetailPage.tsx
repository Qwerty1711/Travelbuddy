import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { getTripById } from '../../services/trips';
import { ItineraryTab } from '../../components/trip-detail/ItineraryTab';
import { WalletTab } from '../../components/trip-detail/WalletTab';
import { PackingTab } from '../../components/trip-detail/PackingTab';
import { BudgetTab } from '../../components/trip-detail/BudgetTab';
import { NotesTab } from '../../components/trip-detail/NotesTab';
import { SettingsTab } from '../../components/trip-detail/SettingsTab';
import type { Trip } from '../../types';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';

type TabType = 'itinerary' | 'wallet' | 'packing' | 'budget' | 'notes' | 'settings';

export function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');

  useEffect(() => {
    if (tripId) {
      loadTrip();
    }
  }, [tripId]);

  async function loadTrip() {
    if (!tripId) return;

    try {
      const data = await getTripById(tripId);
      if (!data) {
        navigate('/trips');
        return;
      }
      setTrip(data);
    } catch (error) {
      console.error('Error loading trip:', error);
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!trip) {
    return null;
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'wallet', label: 'Travel Wallet' },
    { id: 'packing', label: 'Packing List' },
    { id: 'budget', label: 'Budget & Expenses' },
    { id: 'notes', label: 'Notes & Journal' },
    { id: 'settings', label: 'Settings' },
  ];

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
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 py-6">
            <button
              onClick={() => navigate('/trips')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Trips
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {trip.destination}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {startDate} - {endDate}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8">
            <div className="flex gap-1 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === 'itinerary' && <ItineraryTab trip={trip} />}
          {activeTab === 'wallet' && <WalletTab trip={trip} />}
          {activeTab === 'packing' && <PackingTab trip={trip} />}
          {activeTab === 'budget' && <BudgetTab trip={trip} />}
          {activeTab === 'notes' && <NotesTab trip={trip} />}
          {activeTab === 'settings' && <SettingsTab trip={trip} onTripUpdated={setTrip} />}
        </div>
      </div>
    </MainLayout>
  );
}
