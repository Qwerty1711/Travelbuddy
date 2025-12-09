import { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import type { Trip, PackingItem, GeneratePackingListRequest } from '../../types';
import {
  getPackingItems,
  createPackingItem,
  updatePackingItem,
  deletePackingItem,
  generatePackingListWithAI,
  saveAIPackingList,
} from '../../services/packing';

interface PackingTabProps {
  trip: Trip;
}

interface NewItemForm {
  category: string;
  item_name: string;
  quantity: number;
  note: string;
  priority: 'essential' | 'important' | 'optional';
}

export function PackingTab({ trip }: PackingTabProps) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<PackingItem> | null>(null);
  const [newItem, setNewItem] = useState<NewItemForm>({ 
    category: '', 
    item_name: '', 
    quantity: 1, 
    note: '', 
    priority: 'important' 
  });

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
      // Prepare request for AI Edge Function
      const request: GeneratePackingListRequest = {
        destination: trip.destination,
        startDate: trip.start_date,
        endDate: trip.end_date,
        tripType: trip.trip_type,
        vibe: trip.vibe,
        numTravelers: trip.num_travelers,
        hasChildren: false,
        hasElders: false,
      };

      // Call AI Edge Function
      const response = await generatePackingListWithAI(request);

      // Count total items for confirmation
      const totalItems = Object.values(response.categories).reduce(
        (sum, items) => sum + items.length,
        0
      );

      // Show confirmation with summary
      const confirmed = window.confirm(
        `Generate ${totalItems} packing items?\n\n${response.summary}`
      );

      if (!confirmed) {
        setGenerating(false);
        return;
      }

      // Save to database
      await saveAIPackingList(trip.id, response);

      // Reload items from database
      await loadItems();
      alert(`Successfully generated ${totalItems} items!`);
    } catch (error) {
      console.error('Error generating packing list:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate packing list: ${errorMessage}`);
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
    if (!newItem.item_name || !newItem.category) return;

    try {
      const itemToAdd = {
        trip_id: trip.id,
        category: newItem.category,
        item_name: newItem.item_name,
        quantity: newItem.quantity,
        note: newItem.note ? `${newItem.note}, Priority: ${newItem.priority}` : `Priority: ${newItem.priority}`,
        packed: false,
      };
      
      const item = await createPackingItem(itemToAdd);
      setItems([...items, item]);
      setNewItem({ category: '', item_name: '', quantity: 1, note: '', priority: 'important' });
      setShowAddForm(false);
      setShowNewCategoryInput(false);
      setNewCategoryInput('');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  }

  function handleAddNewCategory() {
    if (!newCategoryInput.trim()) return;
    setNewItem({ ...newItem, category: newCategoryInput });
    setShowNewCategoryInput(false);
    setNewCategoryInput('');
  }

  function handleStartEdit(item: PackingItem) {
    setEditingId(item.id);
    setEditingItem({ ...item });
  }

  async function handleSaveEdit() {
    if (!editingId || !editingItem) return;
    
    try {
      await updatePackingItem(editingId, editingItem);
      setItems(items.map((item) => (item.id === editingId ? { ...item, ...editingItem } : item)));
      setEditingId(null);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditingItem(null);
  }

  const existingCategories = Array.from(new Set(items.map((item) => item.category))).sort();

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => {
              const packedInCategory = categoryItems.filter((item) => item.packed).length;
              const totalInCategory = categoryItems.length;
              const categoryProgress = (packedInCategory / totalInCategory) * 100;

              return (
                <div key={category} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{category}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        {packedInCategory}/{totalInCategory} packed
                      </span>
                      <span className="text-xs text-gray-500">{Math.round(categoryProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${categoryProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categoryItems.map((item) => (
                    editingId === item.id && editingItem ? (
                      <div key={item.id} className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editingItem.item_name || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Item name"
                          />
                          <input
                            type="number"
                            min="1"
                            value={editingItem.quantity || 1}
                            onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Quantity"
                          />
                        </div>
                        <input
                          type="text"
                          value={editingItem.note || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, note: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Note"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
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
                              {item.item_name} {item.quantity > 1 && `(${item.quantity})`}
                            </div>
                            {item.note && <div className="text-sm text-gray-500">{item.note}</div>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  ))}
                  </div>
                </div>
              );
            })}
          </div>

          {showAddForm ? (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="relative">
                  {showNewCategoryInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New category"
                        value={newCategoryInput}
                        onChange={(e) => {
                          setNewCategoryInput(e.target.value);
                          setNewItem({ ...newItem, category: e.target.value });
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNewCategory();
                          }
                        }}
                        autoFocus
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <button
                        onClick={handleAddNewCategory}
                        className="px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setNewCategoryInput('');
                          setNewItem({ ...newItem, category: '' });
                        }}
                        className="px-2 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : newItem.category ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-blue-50 text-blue-900 font-medium">
                        {newItem.category}
                      </div>
                      <button
                        onClick={() => {
                          setShowNewCategoryInput(true);
                          setNewCategoryInput(newItem.category);
                        }}
                        className="px-2 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                        title="Change category"
                      >
                        ✏️
                      </button>
                    </div>
                  ) : (
                    <select
                      value={newItem.category}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setShowNewCategoryInput(true);
                        } else {
                          setNewItem({ ...newItem, category: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Select or create category</option>
                      {existingCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__new__">+ Add new category</option>
                    </select>
                  )}
                </div>
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
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'essential' | 'important' | 'optional' })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="essential">Priority: Essential</option>
                  <option value="important">Priority: Important</option>
                  <option value="optional">Priority: Optional</option>
                </select>
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={newItem.note}
                  onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                  onClick={() => {
                    setShowAddForm(false);
                    setShowNewCategoryInput(false);
                    setNewCategoryInput('');
                  }}
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
