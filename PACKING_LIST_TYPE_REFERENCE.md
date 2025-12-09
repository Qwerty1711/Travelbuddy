<!-- REFERENCE: TYPE DEFINITIONS & PAYLOADS -->

# Packing List Generation - Complete Type Reference

This file contains all TypeScript interfaces and example payloads for the packing list generation system.

---

## Types: Request & Response

### GeneratePackingListRequest

**Location**: `src/types/index.ts`

```typescript
export interface GeneratePackingListRequest {
  // ===== REQUIRED FIELDS =====
  destination: string;
  startDate: string;    // "YYYY-MM-DD"
  endDate: string;      // "YYYY-MM-DD"
  tripType: "vacation" | "business" | "mixed";
  vibe: "relaxed" | "adventurous" | "luxury" | "budget" | "family";
  numTravelers: number;
  hasChildren: boolean;
  hasElders: boolean;
  
  // ===== OPTIONAL FIELDS =====
  climate?: string;     // "tropical" | "cold" | "desert" | "temperate"
  activities?: string[]; // ["hiking", "diving", "business"]
}
```

---

### AIPackingItem

**Location**: `src/types/index.ts`

```typescript
export interface AIPackingItem {
  name: string;
  quantity: number;
  priority: "essential" | "important" | "optional";
  note?: string;
}
```

**Priority Legend:**
- `essential`: Must pack (trip suffers without it)
- `important`: Should pack (trip quality affected if missing)
- `optional`: Nice-to-have (can be omitted based on space/preference)

---

### AIPackingListResponse

**Location**: `src/types/index.ts`

```typescript
export interface AIPackingListResponse {
  categories: {
    [category: string]: AIPackingItem[];
  };
  tripDuration: number;
  summary: string;
}
```

---

## Example Payloads

### Request: Beach Vacation (Tropical)

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
  "climate": "tropical",
  "activities": ["swimming", "snorkeling", "beach"]
}
```

---

### Response: Beach Vacation

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
        "name": "Underwear",
        "quantity": 4,
        "priority": "essential"
      },
      {
        "name": "Socks",
        "quantity": 4,
        "priority": "essential"
      },
      {
        "name": "Comfortable pants/shorts",
        "quantity": 2,
        "priority": "essential"
      },
      {
        "name": "Lightweight summer dress/shirt",
        "quantity": 1,
        "priority": "important"
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
      },
      {
        "name": "Sunglasses",
        "quantity": 1,
        "priority": "essential"
      },
      {
        "name": "Light jacket",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Hat",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Comfortable walking shoes",
        "quantity": 1,
        "priority": "essential"
      },
      {
        "name": "Sandals/flip-flops",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Sleepwear",
        "quantity": 2,
        "priority": "essential"
      }
    ],
    "Toiletries": [
      {
        "name": "Toothbrush & toothpaste",
        "quantity": 1,
        "priority": "essential"
      },
      {
        "name": "Deodorant",
        "quantity": 1,
        "priority": "essential"
      },
      {
        "name": "Shampoo/body wash",
        "quantity": 1,
        "priority": "essential",
        "note": "travel-size or solid bar"
      },
      {
        "name": "Conditioner",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Moisturizer",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Sunscreen",
        "quantity": 1,
        "priority": "essential",
        "note": "SPF 30+"
      },
      {
        "name": "Lip balm with SPF",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Feminine hygiene products",
        "quantity": 8,
        "priority": "essential",
        "note": "if needed"
      },
      {
        "name": "Razor & shaving cream",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Hairbrush/comb",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Hair ties/clips",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Nail clippers",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Medications (prescription)",
        "quantity": 8,
        "priority": "essential",
        "note": "full supply"
      },
      {
        "name": "Pain relievers (ibuprofen/paracetamol)",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Antacid",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Toilet paper/wet wipes",
        "quantity": 1,
        "priority": "important",
        "note": "as backup"
      },
      {
        "name": "Insect repellent",
        "quantity": 1,
        "priority": "important",
        "note": "DEET-based"
      },
      {
        "name": "After-sun lotion",
        "quantity": 1,
        "priority": "important"
      }
    ],
    "Electronics": [
      {
        "name": "Phone & charger",
        "quantity": 1,
        "priority": "essential"
      },
      {
        "name": "Phone power bank",
        "quantity": 1,
        "priority": "important",
        "note": "5000mAh minimum"
      },
      {
        "name": "Charging cables",
        "quantity": 2,
        "priority": "essential",
        "note": "USB-C and backup"
      },
      {
        "name": "Universal power adapter",
        "quantity": 1,
        "priority": "essential"
      },
      {
        "name": "Headphones/earbuds",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Camera",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "E-reader",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Laptop/tablet",
        "quantity": 1,
        "priority": "optional",
        "note": "if needed for work"
      }
    ],
    "Documents": [
      {
        "name": "Passport",
        "quantity": 1,
        "priority": "essential"
      },
      {
        "name": "Travel insurance documents",
        "quantity": 1,
        "priority": "essential"
      },
      {
        "name": "Flight tickets/confirmation",
        "quantity": 1,
        "priority": "essential",
        "note": "digital & printed"
      },
      {
        "name": "Hotel reservations",
        "quantity": 1,
        "priority": "essential",
        "note": "confirmation numbers"
      },
      {
        "name": "ID/Driving license",
        "quantity": 1,
        "priority": "essential"
      },
      {
        "name": "Credit/debit cards",
        "quantity": 1,
        "priority": "essential",
        "note": "multiple cards recommended"
      },
      {
        "name": "Cash",
        "quantity": 1,
        "priority": "important",
        "note": "local currency"
      },
      {
        "name": "Emergency contacts",
        "quantity": 1,
        "priority": "important",
        "note": "written backup"
      },
      {
        "name": "Travel plan/itinerary",
        "quantity": 1,
        "priority": "important",
        "note": "shared with family"
      },
      {
        "name": "Visa/entry permits",
        "quantity": 1,
        "priority": "essential",
        "note": "if required"
      }
    ],
    "Health & Safety": [
      {
        "name": "First aid kit",
        "quantity": 1,
        "priority": "important",
        "note": "band-aids, antiseptic, gauze"
      },
      {
        "name": "Antibacterial hand sanitizer",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Eye drops",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Allergy medication",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Sleep aid/melatonin",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Nausea/motion sickness medication",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Thermometer",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Water bottle",
        "quantity": 1,
        "priority": "important",
        "note": "refillable, 500-1000ml"
      },
      {
        "name": "Electrolyte tablets",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Cooling towel",
        "quantity": 1,
        "priority": "optional"
      }
    ],
    "Miscellaneous": [
      {
        "name": "Luggage locks",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Travel pillow",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Sleep mask",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Earplugs",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Wet bag",
        "quantity": 1,
        "priority": "important",
        "note": "for damp clothes"
      },
      {
        "name": "Packing cubes",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Laundry bag",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Portable laundry detergent",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Notebook & pen",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Book/reading material",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Entertainment items",
        "quantity": 1,
        "priority": "optional"
      },
      {
        "name": "Luggage tags",
        "quantity": 1,
        "priority": "important"
      },
      {
        "name": "Zip-lock bags",
        "quantity": 1,
        "priority": "important",
        "note": "various sizes"
      },
      {
        "name": "Duct tape",
        "quantity": 1,
        "priority": "optional",
        "note": "wrapped on cardboard"
      }
    ]
  }
}
```

---

### Request: Winter Business Trip

```json
{
  "destination": "New York",
  "startDate": "2025-01-15",
  "endDate": "2025-01-18",
  "tripType": "business",
  "vibe": "luxury",
  "numTravelers": 1,
  "hasChildren": false,
  "hasElders": false,
  "climate": "cold"
}
```

---

### Request: Family Adventure

```json
{
  "destination": "Iceland",
  "startDate": "2025-07-01",
  "endDate": "2025-07-08",
  "tripType": "vacation",
  "vibe": "adventurous",
  "numTravelers": 4,
  "hasChildren": true,
  "hasElders": false,
  "activities": ["hiking", "waterfall", "glacier"]
}
```

---

## Database Schema (packing_items table)

When items are saved via `saveAIPackingList()`, they're stored as:

```typescript
interface PackingItem {
  id: string;           // UUID, auto-generated
  trip_id: string;      // Foreign key to trips table
  category: string;     // "Clothing", "Electronics", etc.
  name: string;         // Item name from AI response
  quantity: number;     // Quantity from AI response
  note: string;         // Stores "Priority: essential" + any custom notes
  packed: boolean;      // false by default; user toggles via checkbox
  created_at: string;   // ISO timestamp, auto
  updated_at: string;   // ISO timestamp, auto
}
```

---

## Service Functions Signature

### generatePackingListWithAI()

```typescript
async function generatePackingListWithAI(
  request: GeneratePackingListRequest
): Promise<AIPackingListResponse>
```

**Usage:**
```typescript
const response = await generatePackingListWithAI({
  destination: "Bali",
  startDate: "2024-12-20",
  endDate: "2024-12-27",
  tripType: "vacation",
  vibe: "relaxed",
  numTravelers: 2,
  hasChildren: false,
  hasElders: false,
});
```

---

### saveAIPackingList()

```typescript
async function saveAIPackingList(
  tripId: string,
  aiResponse: AIPackingListResponse
): Promise<PackingItem[]>
```

**Usage:**
```typescript
const savedItems = await saveAIPackingList(trip.id, response);
// Returns array of created PackingItem records
```

---

### Other Functions

```typescript
async function getPackingItems(tripId: string): Promise<PackingItem[]>

async function createPackingItem(
  item: Omit<PackingItem, 'id' | 'created_at' | 'updated_at'>
): Promise<PackingItem>

async function updatePackingItem(
  itemId: string,
  updates: Partial<PackingItem>
): Promise<PackingItem>

async function deletePackingItem(itemId: string): Promise<void>

async function bulkCreatePackingItems(
  items: Omit<PackingItem, 'id' | 'created_at' | 'updated_at'>[]
): Promise<PackingItem[]>
```

---

## Category Breakdown by Trip Type & Climate

### Standard Categories (Always Included)

1. **Clothing** — 10-20 items depending on climate
2. **Toiletries** — 15-20 items
3. **Electronics** — 8-10 items
4. **Documents** — 10 items
5. **Health & Safety** — 8-10 items
6. **Miscellaneous** — 15 items

### Conditional Categories

- **Business**: Added if `tripType === "business"` or `"mixed"`
  - Business casual outfit
  - Laptop & charger
  - Professional accessories

---

## Item Count by Trip Type/Climate

| Scenario | Total Items | Dominant Category |
|----------|------------|-------------------|
| 7-day tropical beach | ~100 | Clothing (swimwear, light layers) |
| 3-day city business | ~85 | Documents + Clothing (business wear) |
| 10-day cold adventure | ~110 | Clothing (thermal layers, outerwear) |
| 5-day family vacation | ~115 | Clothing + Misc (kid items) |

---

## Error Responses

### Missing Required Field

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

---

## Priority Distribution

Typical distribution across a generated list:

- **Essential**: ~40% of items (must pack)
- **Important**: ~45% of items (should pack)
- **Optional**: ~15% of items (nice-to-have)

This allows users to quickly filter by priority if they need to reduce luggage weight.
