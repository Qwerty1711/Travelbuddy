import { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, Check } from 'lucide-react';
import type { Trip, PackingItem } from '../../types';
import {
  getPackingItems,
  createPackingItem,
  updatePackingItem,
  deletePackingItem,
  bulkCreatePackingItems,
} from '../../services/packing';
import { generatePackingList } from '../../services/ai';

interface PackingTabProps {
  trip: Trip;
}

export function PackingTab({ trip }: PackingTabProps) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ category: '', name: '', quantity: 1, note: '' });

  useEffect(() => {
    loadItems();
  }, [trip.id]);

  async function loadItems() {
    try {
      const data = await getPackingItems(trip.id);
      setItems(data);
    } catch (error) {
      console.error('Error loading packing items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateList() {
    setGenerating(true);

    try {
      const response = await generatePackingList(trip);
      const newItems: Omit<PackingItem, 'id' | 'created_at' | 'updated_at'>[] = [];

      Object.entries(response.categories).forEach(([category, categoryItems]) => {
        categoryItems.forEach((item) => {
          newItems.push({
            trip_id: trip.id,
            category,
            name: item.name,
            quantity: item.quantity,
            note: item.note || '',
            packed: false,
          });
        });
      });

      await bulkCreatePackingItems(newItems);
      await loadItems();
    } catch (error) {
      console.error('Error generating packing list:', error);
      alert('Failed to generate packing list. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleTogglePacked(item: PackingItem) {
    try {
      await updatePackingItem(item.id, { packed: !item.packed });
      setItems(items.map((i) => (i.id === item.id ? { ...i, packed: !i.packed } : i)));
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }

  async function handleDelete(itemId: string) {
    try {
      await deletePackingItem(itemId);
      setItems(items.filter((i) => i.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  async function handleAddItem() {
    if (!newItem.name || !newItem.category) return;

    try {
      const item = await createPackingItem({
        trip_id: trip.id,
        ...newItem,
        packed: false,
      });
      setItems([...items, item]);
      setNewItem({ category: '', name: '', quantity: 1, note: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  }

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  const totalItems = items.length;
  const packedItems = items.filter((i) => i.packed).length;
  const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No packing list yet</h3>
          <p className="text-gray-600 mb-6">
            Let AI create a personalized packing list for your trip
          </p>
          <button
            onClick={handleGenerateList}
            disabled={generating}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {generating ? 'Generating...' : 'Generate AI Packing List'}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Packing Progress</h3>
              <span className="text-sm text-gray-600">
                {packedItems} of {totalItems} items packed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{category}</h4>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className="flex items-center flex-1">
                        <button
                          onClick={() => handleTogglePacked(item)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                            item.packed
                              ? 'bg-green-600 border-green-600'
                              : 'border-gray-300 hover:border-green-600'
                          }`}
                        >
                          {item.packed && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1">
                          <div className={`font-medium ${item.packed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {item.name} {item.quantity > 1 && `(${item.quantity})`}
                          </div>
                          {item.note && <div className="text-sm text-gray-500">{item.note}</div>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {showAddForm ? (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={newItem.note}
                  onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddItem}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-6 w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item Manually
            </button>
          )}
        </div>
      )}
    </div>
  );
}
