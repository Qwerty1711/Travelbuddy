import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTripById, getTripDays } from '../../services/trips';
import { getActivitiesByDayId } from '../../services/trips';
import { getPackingItems } from '../../services/packing';
import { getExpenses } from '../../services/expenses';
import { getDocuments } from '../../services/documents';
import type { Trip, TripDay, Activity, PackingItem, Expense, Document } from '../../types';

export function TripPrintPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<(TripDay & { activities: Activity[] })[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      loadAllData();
    }
  }, [tripId]);

  async function loadAllData() {
    if (!tripId) return;

    try {
      const [tripData, daysData, packingData, expensesData, documentsData] = await Promise.all([
        getTripById(tripId),
        getTripDays(tripId),
        getPackingItems(tripId),
        getExpenses(tripId),
        getDocuments(tripId),
      ]);

      if (!tripData) return;

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
      setDocuments(documentsData);
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
        <p className="text-gray-500">Trip not found</p>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const groupedPacking = packingItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 pb-6 border-b-2 border-gray-900">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{trip.title}</h1>
          <div className="flex gap-6 text-gray-700">
            <div>
              <span className="font-medium">Destination:</span> {trip.destination}
            </div>
            <div>
              <span className="font-medium">Dates:</span>{' '}
              {new Date(trip.start_date).toLocaleDateString()} -{' '}
              {new Date(trip.end_date).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Travelers:</span> {trip.num_travelers}
            </div>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary</h2>
          {days.length === 0 ? (
            <p className="text-gray-500">No itinerary</p>
          ) : (
            <div className="space-y-6">
              {days.map((day) => (
                <div key={day.id} className="border-l-4 border-blue-600 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Day {day.day_number}: {day.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {day.activities.length > 0 && (
                    <div className="space-y-2">
                      {day.activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <div className="text-sm text-gray-600 min-w-24">
                            {activity.start_time && activity.end_time &&
                              `${activity.start_time} - ${activity.end_time}`}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{activity.title}</div>
                            {activity.location && (
                              <div className="text-sm text-gray-600">{activity.location}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Packing List</h2>
          {packingItems.length === 0 ? (
            <p className="text-gray-500">No packing list</p>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(groupedPacking).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-900 mb-2">{category}</h3>
                  <ul className="space-y-1">
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
        </section>

        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents</h2>
          {documents.length === 0 ? (
            <p className="text-gray-500">No documents</p>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {documents.map((doc) => (
                <li key={doc.id} className="text-sm text-gray-700">
                  {doc.file_name}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Budget Summary</h2>
          {expenses.length === 0 ? (
            <p className="text-gray-500">No expenses</p>
          ) : (
            <div>
              <div className="mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  Total Spent: ${totalExpenses.toFixed(2)}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-300">
                  <tr>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-200">
                      <td className="py-2">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-2">{expense.description}</td>
                      <td className="py-2 capitalize">{expense.category}</td>
                      <td className="py-2 text-right">
                        {expense.currency} ${expense.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500 print:hidden">
          <p className="mb-4">Use your browser's print dialog (Ctrl/Cmd + P) to save as PDF</p>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
