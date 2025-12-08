import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plane, MapPin, Calendar } from 'lucide-react';
import { getTripByPublicId, getTripDays } from '../../services/trips';
import { getActivitiesByDayId } from '../../services/trips';
import { getPackingItems } from '../../services/packing';
import { getExpenses } from '../../services/expenses';
import type { Trip, TripDay, Activity, PackingItem, Expense } from '../../types';

export function SharePage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<(TripDay & { activities: Activity[] })[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'packing' | 'budget'>('itinerary');

  useEffect(() => {
    if (publicId) {
      loadAllData();
    }
  }, [publicId]);

  async function loadAllData() {
    if (!publicId) return;

    try {
      const tripData = await getTripByPublicId(publicId);
      if (!tripData) {
        setLoading(false);
        return;
      }

      const [daysData, packingData, expensesData] = await Promise.all([
        getTripDays(tripData.id),
        getPackingItems(tripData.id),
        getExpenses(tripData.id),
      ]);

      const daysWithActivities = await Promise.all(
        daysData.map(async (day) => {
          const activities = await getActivitiesByDayId(day.id);
          return { ...day, activities };
        })
      );

      setTrip(tripData);
      setDays(daysWithActivities);
      setPackingItems(packingData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Trip Not Found</h2>
          <p className="text-gray-600">This trip link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const groupedPacking = packingItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  const tabs = [
    { id: 'itinerary' as const, label: 'Itinerary' },
    { id: 'packing' as const, label: 'Packing List' },
    { id: 'budget' as const, label: 'Budget' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center mb-4">
            <Plane className="w-8 h-8 text-blue-600 mr-3" />
            <span className="text-xl font-bold text-gray-900">Travel Buddy</span>
            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
              Shared Trip
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.title}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {trip.destination}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(trip.start_date).toLocaleDateString()} -{' '}
              {new Date(trip.end_date).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6">
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
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            {days.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No itinerary available</p>
            ) : (
              days.map((day) => (
                <div key={day.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Day {day.day_number}: {day.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {day.activities.length > 0 && (
                    <div className="space-y-3">
                      {day.activities.map((activity) => (
                        <div key={activity.id} className="border-l-2 border-blue-600 pl-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{activity.title}</h4>
                              <div className="flex gap-3 text-sm text-gray-600 mt-1">
                                {activity.start_time && activity.end_time && (
                                  <span>
                                    {activity.start_time} - {activity.end_time}
                                  </span>
                                )}
                                {activity.location && <span>{activity.location}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'packing' && (
          <div>
            {packingItems.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No packing list available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedPacking).map(([category, items]) => (
                  <div key={category} className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item.id} className="text-sm text-gray-700">
                          {item.name} {item.quantity > 1 && `(${item.quantity})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <div>
            {expenses.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No expenses recorded</p>
            ) : (
              <div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Spent</h3>
                  <p className="text-3xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {expense.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {expense.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {expense.currency} ${expense.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
