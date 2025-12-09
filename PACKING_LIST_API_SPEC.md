<!-- PACKING LIST AI ENGINE - API CONTRACT & DOCUMENTATION -->

# Packing List Generation - AI Engine Documentation

## Overview

The **generatePackingList** Supabase Edge Function is the backend AI engine for automatically generating comprehensive packing lists based on trip context. It encapsulates all logic for:

- Parsing trip details (destination, dates, type, vibe, travelers)
- Inferring climate and weather conditions
- Generating context-aware packing recommendations
- Organizing items by category with priority levels
- Returning structured JSON for frontend consumption

**Key Design Decision**: The function generates items only; it does NOT write to the database. Neha's UI handles persistence via `saveAIPackingList()`.

---

## API Contract

### Request Payload: `GeneratePackingListRequest`

```typescript
interface GeneratePackingListRequest {
  // Required
  destination: string;           // e.g., "Bali", "Iceland", "New York"
  startDate: string;             // ISO 8601 format: "YYYY-MM-DD"
  endDate: string;               // ISO 8601 format: "YYYY-MM-DD"
  tripType: "vacation" | "business" | "mixed";
  vibe: "relaxed" | "adventurous" | "luxury" | "budget" | "family";
  numTravelers: number;          // e.g., 1, 2, 4
  
  // Defaults to false if not provided
  hasChildren: boolean;          // Include kids' clothing, diapers, etc.
  hasElders: boolean;            // Include elder-friendly items
  
  // Optional
  climate?: string;              // "tropical" | "cold" | "desert" | "temperate"
                                 // Auto-inferred from destination if omitted
  activities?: string[];         // e.g., ["hiking", "diving", "business meetings"]
}
```

#### Example Request

```json
{
  "destination": "Bali",
  "startDate": "2024-12-20",
  "endDate": "2024-12-27",
  "tripType": "vacation",
  "vibe": "relaxed",
  "numTravelers": 2,
  "hasChildren": false,
  "hasElders": false,
  "climate": "tropical"
}
```

---

### Response Payload: `AIPackingListResponse`

```typescript
interface AIPackingItem {
  name: string;                                    // Item name
  quantity: number;                                // How many to pack
  priority: "essential" | "important" | "optional"; // Packing priority
  note?: string;                                   // Optional guidance
}

interface GeneratePackingListResponse {
  categories: {
    [category: string]: AIPackingItem[];
  };
  tripDuration: number;                            // Computed from start/end dates
  summary: string;                                 // Human-readable summary
}
```

#### Example Response

```json
{
  "tripDuration": 8,
  "summary": "Packing list for your 8-day relaxed vacation to Bali. Climate: tropical. Pack essentials and important items; optional items can be added based on personal preference and luggage space.",
  "categories": {
    "Clothing": [
      {
        "name": "T-shirts/casual tops",
        "quantity": 4,
        "priority": "essential"
      },
      {
        "name": "Shorts",
        "quantity": 2,
        "priority": "essential"
      },
      {
        "name": "Swimsuit",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Hat/cap",
        "quantity": 1,
        "priority": "essential",
        "note": "UV protection"
      }
    ],
    "Toiletries": [
      {
        "name": "Sunscreen",
        "quantity": 1,
        "priority": "essential",
        "note": "SPF 30+"
      },
      {
        "name": "Insect repellent",
        "quantity": 1,
        "priority": "important",
        "note": "DEET-based"
      }
    ],
    "Electronics": [
      {
        "name": "Phone & charger",
        "quantity": 1,
        "priority": "essential"
      }
    ]
  }
}
```

---

## Frontend Integration: How Neha Uses This

### Step 1: Call generatePackingListWithAI()

Located in `src/services/packing.ts`, Neha's UI calls:

```typescript
import { generatePackingListWithAI, saveAIPackingList } from '../../services/packing';

const response = await generatePackingListWithAI({
  destination: trip.destination,
  startDate: trip.start_date,
  endDate: trip.end_date,
  tripType: trip.trip_type,
  vibe: trip.vibe,
  numTravelers: trip.num_travelers,
  hasChildren: false,        // From UI modal/settings
  hasElders: false,          // From UI modal/settings
  // climate is auto-inferred if not provided
});
```

### Step 2: Save to Database

```typescript
// response contains AIPackingListResponse
// saveAIPackingList() converts categories → packing_items and saves
const savedItems = await saveAIPackingList(tripId, response);
```

### Step 3: Display in PackingTab

Neha's UI displays `savedItems` in the packing tab, allowing users to:
- Check items off as packed
- Edit quantities
- Add notes
- Delete items
- Add custom items manually

---

## Constraints & Design Decisions

### Max Items Per Category

The function does NOT enforce a hard limit on items per category. However:
- Typical **Clothing** category: 15-20 items
- Typical **Toiletries** category: 15-20 items
- Typical **Electronics** category: 8-10 items
- **Total items across all categories**: ~80-120 items per trip

**Rationale**: Users can always delete unwanted items after generation. Better to be comprehensive than sparse.

### Priority Levels

Three tiers help users decide what to pack:

| Priority | Guidance |
|----------|----------|
| **essential** | Must pack; trip would suffer without it |
| **important** | Should pack; trip quality significantly affected if missing |
| **optional** | Nice-to-have; can be omitted based on luggage space or personal preference |

### Database Mapping

When saving to `packing_items`, the service converts:
- `aiItem.priority` → stored in `note` field as `"Priority: essential"` (for backward compatibility)
- All items default to `packed: false`

### Function Behavior (Non-Write)

The Edge Function:
- ✅ Generates and returns recommendations
- ✅ Validates request payload
- ✅ Handles errors gracefully
- ❌ Does NOT write directly to `packing_items` table

**Why**: Separates concerns. Frontend controls persistence, allowing:
- Batch inserts (efficient)
- User confirmation before saving
- Easy rollback if user cancels
- Audit trail (user controls what gets saved)

---

## Backend Logic: Climate Inference

The function auto-detects climate from destination if not explicitly provided:

```typescript
const tropicalDests = ["bali", "hawaii", "maldives", "caribbean", "thailand"];
const coldDests = ["iceland", "norway", "alaska", "siberia", "canada"];
const desertDests = ["dubai", "cairo", "sahara", "arizona"];
```

If destination matches a known list → use that climate
Otherwise → default to "temperate"

**Improvements for Production**:
- Integrate OpenWeatherMap or similar API for actual forecast
- Add season detection (summer vs winter)
- Consider latitude/longitude-based climate classification

---

## Trip Type & Vibe Adaptations

### Trip Type: "business" or "mixed"
Adds:
- Business casual outfit (2 items)
- Closed-toe shoes
- Business socks/hosiery
- (If mixed) Laptop & charger (priority: essential)

### Trip Type: "vacation"
Standard packing list; no business items

### Vibe: "adventurous"
Adds:
- Hiking boots
- Athletic wear (2 items)
- Lightweight waterproof jacket

### Vibe: "luxury"
Adds:
- Formal/semi-formal outfit for dining

### Vibe: "family"
Adjusts quantities; hasChildren flag triggers:
- Children's clothing (based on trip duration)
- Children's shoes
- Diapers/pull-ups
- Child entertainment items

---

## Error Handling

### Invalid Request

```json
{
  "status": 400,
  "error": "Missing required field: destination"
}
```

### Server Error

```json
{
  "status": 500,
  "error": "Unknown error"
}
```

The function catches all exceptions and returns a safe error message.

---

## Quantities: How They're Calculated

### Clothing
- **T-shirts**: `Math.ceil(duration / 2)` – Rotate/rewear
- **Underwear/Socks**: `Math.ceil(duration / 2)` – Assume laundry mid-trip
- **Pants/Shorts**: 2-3 depending on trip length

### Toiletries
- **Feminine hygiene**: `quantity: duration` – One per day if needed
- **Medications**: `quantity: duration` – Full supply
- **Deodorant/Sunscreen**: `quantity: 1` – Travel-size bottles

### Climate-Specific
- **Swimsuit**: 1 for adults, 2 if `hasChildren: true`
- **Warm socks** (cold climate): 3
- **Insect repellent** (tropical): 1

---

## TypeScript Types: Location & Reuse

### Shared Types (Frontend + Backend)

**`src/types/index.ts`**:
```typescript
export interface GeneratePackingListRequest { ... }
export interface AIPackingItem { ... }
export interface GeneratePackingListResponse { ... }
```

Used by:
- `src/services/ai.ts` – `generatePackingList()` function
- `src/services/packing.ts` – `generatePackingListWithAI()` wrapper
- Neha's UI components

**`supabase/functions/generatePackingList/index.ts`**:
- Defines the same interfaces locally
- Not imported from `src/types` (Edge Function isolation)
- Ensures contract alignment

### Adding New Fields

When adding fields to `GeneratePackingListRequest`:
1. Update interface in `src/types/index.ts`
2. Update interface in `supabase/functions/generatePackingList/index.ts`
3. Update logic in Edge Function to handle new field
4. Update `generatePackingListWithAI()` call in frontend service
5. Test end-to-end

---

## Future Enhancements

### Short-Term
- [ ] Filter items by category from UI
- [ ] Mark items "already own" vs "need to buy"
- [ ] Export packing list as PDF or image
- [ ] Share packing list with collaborators

### Medium-Term
- [ ] Integrate OpenWeatherMap for real weather forecast
- [ ] Detect season (summer/winter) for better recommendations
- [ ] Add user preferences (e.g., "prefer lightweight travel")
- [ ] LLM-based generation (use OpenAI to dynamically generate items)

### Long-Term
- [ ] Machine learning: Learn from user edits to refine recommendations
- [ ] Weight recommendations by cost/weight
- [ ] Integration with shopping lists (Amazon, local stores)
- [ ] Multi-language support for item names

---

## Questions to Clarify with Team

### Q1: Should we eventually write directly from the Edge Function?
**A**: No, keep it return-only. Gives Neha's UI full control.

### Q2: How many items is too many?
**A**: ~120 items across all categories is reasonable. Users filter by priority.

### Q3: What if a destination isn't in the hardcoded list?
**A**: Default to "temperate" climate. User can override via `climate` param.

### Q4: Can we add LLM integration later?
**A**: Yes! Replace the hardcoded logic with OpenAI API calls inside the Edge Function. Signature stays the same.

### Q5: Where should we store climate data?
**A**: Consider a `destinations` table with precomputed climate/season info. Edge Function can query it.

---

## Summary

✅ **Complete Backend Implementation** for packing list generation  
✅ **Robust Error Handling** and validation  
✅ **Climate & Context Awareness** with fallback logic  
✅ **Clean Separation of Concerns** (generate ≠ persist)  
✅ **Type-Safe** interfaces for frontend-backend alignment  
✅ **Production-Ready** Edge Function with full documentation  

Neha can now confidently:
1. Call `generatePackingListWithAI({ ...tripContext })`
2. Receive structured, categorized recommendations
3. Save them to the database with one line: `saveAIPackingList(tripId, response)`
4. Display in the PackingTab with full CRUD capabilities
