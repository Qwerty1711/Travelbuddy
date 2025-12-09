<!-- QUICK START: FOR NEHA (UI Integration) -->

# Packing List AI Integration - Quick Start for UI

## What You Need to Know

The backend is ready! Here's exactly how to use it in the PackingTab component.

---

## Import the Functions

```typescript
import { 
  generatePackingListWithAI,  // Call the AI Edge Function
  saveAIPackingList,           // Save generated items to database
  getPackingItems,             // Fetch existing items
  createPackingItem,           // Add a new item manually
  updatePackingItem,           // Mark as packed, edit quantity
  deletePackingItem,           // Remove an item
} from '../../services/packing';

import type { GeneratePackingListRequest } from '../../types';
```

---

## Basic Flow: "Generate with AI" Button

### Step 1: Prepare the Request

```typescript
// User clicks "Generate with AI" button
async function handleGeneratePackingList() {
  setLoading(true);
  
  try {
    const request: GeneratePackingListRequest = {
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      tripType: trip.trip_type,
      vibe: trip.vibe,
      numTravelers: trip.num_travelers,
      hasChildren: false,  // Ask user in modal if needed
      hasElders: false,    // Ask user in modal if needed
      // climate: undefined,  // Optional; auto-inferred from destination
    };

    const response = await generatePackingListWithAI(request);
    
    // response.categories = { "Clothing": [...], "Electronics": [...], ... }
    // response.tripDuration = 7
    // response.summary = "Packing list for your 7-day relaxed vacation..."
```

### Step 2: Show Results Preview (Optional)

```typescript
    // Optional: Show modal with summary and item count
    const totalItems = Object.values(response.categories)
      .reduce((sum, items) => sum + items.length, 0);
    
    alert(`Generated ${totalItems} items across ${Object.keys(response.categories).length} categories.\n\n${response.summary}`);
```

### Step 3: Save to Database

```typescript
    // Save all items to packing_items table
    const savedItems = await saveAIPackingList(trip.id, response);
    
    // Refresh local state
    await loadPackingItems(); // Re-fetch from database
    
  } catch (error) {
    console.error('Failed to generate packing list:', error);
    alert('Failed to generate packing list. Please try again.');
  } finally {
    setLoading(false);
  }
}
```

---

## Response Structure (What You Get Back)

```typescript
{
  tripDuration: 7,
  summary: "Packing list for your 7-day relaxed vacation to Bali...",
  categories: {
    "Clothing": [
      {
        name: "T-shirts/casual tops",
        quantity: 4,
        priority: "essential",  // "essential" | "important" | "optional"
      },
      {
        name: "Swimsuit",
        quantity: 1,
        priority: "important",
        note: undefined  // Optional guidance
      }
    ],
    "Toiletries": [
      {
        name: "Sunscreen",
        quantity: 1,
        priority: "essential",
        note: "SPF 30+"
      }
    ],
    // ... more categories
  }
}
```

---

## Database Schema (What Gets Saved)

Each item maps to the `packing_items` table:

```typescript
interface PackingItem {
  id: string;                    // Auto-generated
  trip_id: string;               // Your trip.id
  category: string;              // "Clothing", "Electronics", etc.
  name: string;                  // Item name
  quantity: number;              // How many
  note: string;                  // Stores: "Priority: essential" or custom notes
  packed: boolean;               // Default false; user marks as packed
  created_at: string;            // Auto
  updated_at: string;            // Auto
}
```

---

## UI Component Example (PackingTab)

Here's a minimal example of how to wire it up:

```typescript
import { useState, useEffect } from 'react';
import { Plus, Wand2, Trash2 } from 'lucide-react';
import type { Trip } from '../../types';
import {
  generatePackingListWithAI,
  saveAIPackingList,
  getPackingItems,
  updatePackingItem,
  deletePackingItem,
} from '../../services/packing';

interface PackingTabProps {
  trip: Trip;
}

export function PackingTab({ trip }: PackingTabProps) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadPackingItems();
  }, [trip.id]);

  async function loadPackingItems() {
    try {
      setLoading(true);
      const data = await getPackingItems(trip.id);
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateWithAI() {
    setGenerating(true);
    try {
      const response = await generatePackingListWithAI({
        destination: trip.destination,
        startDate: trip.start_date,
        endDate: trip.end_date,
        tripType: trip.trip_type,
        vibe: trip.vibe,
        numTravelers: trip.num_travelers,
        hasChildren: false,
        hasElders: false,
      });

      // Count items for confirmation
      const count = Object.values(response.categories).reduce(
        (sum: number, items: any[]) => sum + items.length,
        0
      );

      if (window.confirm(`Add ${count} items to your packing list?`)) {
        await saveAIPackingList(trip.id, response);
        await loadPackingItems();
      }
    } catch (error) {
      console.error('Failed to generate:', error);
      alert('Failed to generate packing list. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleTogglePacked(itemId: string, currentState: boolean) {
    try {
      await updatePackingItem(itemId, { packed: !currentState });
      await loadPackingItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }

  async function handleDelete(itemId: string) {
    try {
      await deletePackingItem(itemId);
      await loadPackingItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  // Group items by category for display
  const itemsByCategory = items.reduce((acc: any, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="p-8">
      {/* Generate with AI button */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleGenerateWithAI}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Wand2 className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>

      {/* Items by category */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : Object.keys(itemsByCategory).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No items yet. Click "Generate with AI" to start.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(itemsByCategory).map(([category, categoryItems]: any) => (
            <div key={category}>
              <h3 className="font-bold text-lg mb-3 text-gray-800">{category}</h3>
              <div className="space-y-2">
                {categoryItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm"
                  >
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => handleTogglePacked(item.id, item.packed)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className={item.packed ? 'line-through text-gray-400' : 'text-gray-900'}>
                        {item.name}
                      </p>
                      {item.note && <p className="text-xs text-gray-500">{item.note}</p>}
                    </div>
                    <span className="text-sm text-gray-600 min-w-fit">Qty: {item.quantity}</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Key Points for Implementation

### ✅ Do This

- Call `generatePackingListWithAI()` with required fields
- Show a confirmation before saving (so users can review)
- Use `saveAIPackingList()` to batch-insert items
- Allow users to manually add/edit/delete items after generation
- Group display by category for better UX

### ❌ Don't Do This

- Don't try to write directly to `packing_items` yourself (use `saveAIPackingList()`)
- Don't block the UI while generating (show spinner)
- Don't save without user confirmation (they might want to review first)
- Don't pass undefined required fields (destination, startDate, etc.)

---

## Optional: Show Trip Summary First

If you want to ask the user about children/elders before generating:

```typescript
const [showModal, setShowModal] = useState(false);
const [hasChildren, setHasChildren] = useState(false);
const [hasElders, setHasElders] = useState(false);

return (
  <>
    <button onClick={() => setShowModal(true)} className="...">
      Generate with AI
    </button>

    {showModal && (
      <div className="modal">
        <h2>Trip Details</h2>
        <label>
          <input
            type="checkbox"
            checked={hasChildren}
            onChange={(e) => setHasChildren(e.target.checked)}
          />
          Traveling with children?
        </label>
        <label>
          <input
            type="checkbox"
            checked={hasElders}
            onChange={(e) => setHasElders(e.target.checked)}
          />
          Traveling with elderly?
        </label>
        <button onClick={handleGenerateWithAI}>Generate</button>
        <button onClick={() => setShowModal(false)}>Cancel</button>
      </div>
    )}
  </>
);
```

---

## Troubleshooting

### "Failed to generate packing list"
- Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in `.env`
- Ensure `generatePackingList` Edge Function is deployed

### Empty response or missing categories
- Verify the request payload has all required fields
- Check browser console for error details
- Try refreshing the page

### Items not saving to database
- Verify you're calling `saveAIPackingList()`, not trying to insert manually
- Check that `trip.id` is correct and user is authenticated
- Verify RLS policies allow user to insert into `packing_items`

---

## Full API Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `generatePackingListWithAI(request)` | Call Edge Function, get AI recommendations | `AIPackingListResponse` |
| `saveAIPackingList(tripId, response)` | Convert and save items to database | `PackingItem[]` |
| `getPackingItems(tripId)` | Fetch all items for a trip | `PackingItem[]` |
| `createPackingItem(item)` | Add one item manually | `PackingItem` |
| `updatePackingItem(id, updates)` | Edit item (mark packed, change qty) | `PackingItem` |
| `deletePackingItem(id)` | Remove an item | `void` |
| `bulkCreatePackingItems(items)` | Insert multiple items at once | `PackingItem[]` |

---

## You're All Set! 🎉

The backend is complete and ready to use. Just wire up the UI components and you're good to go!

For questions or changes to the API contract, see `PACKING_LIST_API_SPEC.md`.
