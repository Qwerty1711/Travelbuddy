import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Deno.serve is provided by the edge runtime
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ==================== TYPES ====================
interface GeneratePackingListRequest {
  destination: string;
  startDate: string;
  endDate: string;
  tripType: "vacation" | "business" | "mixed";
  vibe: "relaxed" | "adventurous" | "luxury" | "budget" | "family";
  numTravelers: number;
  hasChildren: boolean;
  hasElders: boolean;
  climate?: string;
  activities?: string[];
}

interface AIPackingItem {
  name: string;
  quantity: number;
  priority: "essential" | "important" | "optional";
  note?: string;
}

interface GeneratePackingListResponse {
  categories: {
    [category: string]: AIPackingItem[];
  };
  tripDuration: number;
  summary: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate trip duration in days
 */
function calculateTripDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();
  return Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Determine climate/weather type based on destination and trip dates
 * (simplified approach - in production, you'd use a weather API)
 */
function inferClimate(destination: string, climate?: string): string {
  if (climate) return climate;

  const tropicalDests = ["bali", "hawaii", "maldives", "caribbean", "thailand"];
  const coldDests = ["iceland", "norway", "alaska", "siberia", "canada"];
  const desertDests = ["dubai", "cairo", "sahara", "arizona"];

  const lowerDest = destination.toLowerCase();
  if (tropicalDests.some((d) => lowerDest.includes(d))) return "tropical";
  if (coldDests.some((d) => lowerDest.includes(d))) return "cold";
  if (desertDests.some((d) => lowerDest.includes(d))) return "desert";

  return "temperate";
}

/**
 * Generate comprehensive packing list based on trip details
 * Uses hardcoded logic with AI-like recommendations
 */
function generatePackingListItems(
  destination: string,
  startDate: string,
  endDate: string,
  tripType: string,
  vibe: string,
  numTravelers: number,
  hasChildren: boolean,
  hasElders: boolean,
  climate?: string
): { [category: string]: AIPackingItem[] } {
  const duration = calculateTripDuration(startDate, endDate);
  const inferred_climate = inferClimate(destination, climate);
  const isHotClimate = ["tropical", "desert"].includes(inferred_climate);
  const isColdClimate = inferred_climate === "cold";

  const items: { [category: string]: AIPackingItem[] } = {
    "Clothing": [],
    "Toiletries": [],
    "Electronics": [],
    "Documents": [],
    "Health & Safety": [],
    "Miscellaneous": [],
  };

  // ==================== CLOTHING ====================
  const clothingItems: AIPackingItem[] = [];

  // Base clothing
  clothingItems.push(
    { name: "T-shirts/casual tops", quantity: Math.ceil(duration / 2), priority: "essential" },
    { name: "Underwear", quantity: Math.ceil(duration / 2), priority: "essential" },
    { name: "Socks", quantity: Math.ceil(duration / 2), priority: "essential" },
    { name: "Comfortable pants/shorts", quantity: duration < 5 ? 2 : 3, priority: "essential" }
  );

  // Climate-specific clothing
  if (isHotClimate) {
    clothingItems.push(
      { name: "Lightweight summer dress/shirt", quantity: 1, priority: "important" },
      { name: "Shorts", quantity: 2, priority: "essential" },
      { name: "Swimsuit", quantity: hasChildren ? 2 : 1, priority: "important" },
      { name: "Hat/cap", quantity: 1, priority: "essential", note: "UV protection" },
      { name: "Sunglasses", quantity: 1, priority: "essential" }
    );
  } else if (isColdClimate) {
    clothingItems.push(
      { name: "Winter jacket", quantity: 1, priority: "essential" },
      { name: "Thermal layers", quantity: 2, priority: "essential" },
      { name: "Winter hat", quantity: 1, priority: "essential" },
      { name: "Gloves", quantity: 1, priority: "essential" },
      { name: "Scarf/neck warmer", quantity: 1, priority: "important" },
      { name: "Warm socks", quantity: 3, priority: "important" },
      { name: "Winter boots", quantity: 1, priority: "essential" }
    );
  } else {
    clothingItems.push(
      { name: "Light jacket", quantity: 1, priority: "important" },
      { name: "Hat", quantity: 1, priority: "important" }
    );
  }

  // Trip type specific clothing
  if (tripType === "business" || tripType === "mixed") {
    clothingItems.push(
      { name: "Business casual outfit", quantity: 2, priority: "essential" },
      { name: "Closed-toe shoes", quantity: 1, priority: "essential" },
      { name: "Business socks/hosiery", quantity: 2, priority: "important" }
    );
  }

  if (vibe === "luxury" || vibe === "adventurous") {
    clothingItems.push(
      { name: "Formal/semi-formal outfit", quantity: 1, priority: "important", note: "for dining/events" }
    );
  }

  if (vibe === "adventurous") {
    clothingItems.push(
      { name: "Hiking boots", quantity: 1, priority: "important" },
      { name: "Athletic wear", quantity: 2, priority: "important" },
      { name: "Lightweight waterproof jacket", quantity: 1, priority: "important" }
    );
  }

  // Children and elders specific
  if (hasChildren) {
    clothingItems.push(
      { name: "Children's clothing", quantity: Math.ceil(duration / 2), priority: "essential" },
      { name: "Children's shoes", quantity: 2, priority: "essential" }
    );
  }

  if (hasElders) {
    clothingItems.push(
      { name: "Comfortable walking shoes", quantity: 1, priority: "essential" },
      { name: "Extra socks", quantity: 2, priority: "important" }
    );
  }

  // Footwear
  clothingItems.push(
    { name: "Comfortable walking shoes", quantity: 1, priority: "essential" },
    { name: "Sandals/flip-flops", quantity: 1, priority: "important" },
    { name: "Sleepwear", quantity: 2, priority: "essential" }
  );

  items["Clothing"] = clothingItems;

  // ==================== TOILETRIES ====================
  const toiletryItems: AIPackingItem[] = [
    { name: "Toothbrush & toothpaste", quantity: 1, priority: "essential" },
    { name: "Deodorant", quantity: 1, priority: "essential" },
    { name: "Shampoo/body wash", quantity: 1, priority: "essential", note: "travel-size or solid bar" },
    { name: "Conditioner", quantity: 1, priority: "important" },
    { name: "Moisturizer", quantity: 1, priority: "important" },
    { name: "Sunscreen", quantity: 1, priority: "essential", note: "SPF 30+" },
    { name: "Lip balm with SPF", quantity: 1, priority: "important" },
    { name: "Feminine hygiene products", quantity: duration, priority: "essential", note: "if needed" },
    { name: "Razor & shaving cream", quantity: 1, priority: "optional" },
    { name: "Hairbrush/comb", quantity: 1, priority: "important" },
    { name: "Hair ties/clips", quantity: 1, priority: "optional" },
    { name: "Nail clippers", quantity: 1, priority: "optional" },
    { name: "Medications (prescription)", quantity: duration, priority: "essential", note: "full supply" },
    { name: "Pain relievers (ibuprofen/paracetamol)", quantity: 1, priority: "important" },
    { name: "Antacid", quantity: 1, priority: "optional" },
    { name: "Toilet paper/wet wipes", quantity: 1, priority: "important", note: "as backup" },
  ];

  if (isHotClimate) {
    toiletryItems.push(
      { name: "Insect repellent", quantity: 1, priority: "important", note: "DEET-based" },
      { name: "After-sun lotion", quantity: 1, priority: "important" }
    );
  }

  if (hasChildren) {
    toiletryItems.push(
      { name: "Children's toiletries", quantity: 1, priority: "essential" },
      { name: "Diapers/pull-ups", quantity: Math.ceil(duration * 4), priority: "essential" }
    );
  }

  items["Toiletries"] = toiletryItems;

  // ==================== ELECTRONICS ====================
  const electronicsItems: AIPackingItem[] = [
    { name: "Phone & charger", quantity: 1, priority: "essential" },
    { name: "Phone power bank", quantity: 1, priority: "important", note: "5000mAh minimum" },
    { name: "Charging cables", quantity: 2, priority: "essential", note: "USB-C and backup" },
    { name: "Universal power adapter", quantity: 1, priority: "essential" },
    { name: "Headphones/earbuds", quantity: 1, priority: "important" },
    { name: "Camera", quantity: 1, priority: "optional" },
    { name: "E-reader", quantity: 1, priority: "optional" },
    { name: "Laptop/tablet", quantity: 1, priority: "optional", note: "if needed for work" },
  ];

  if (tripType === "business" || tripType === "mixed") {
    electronicsItems.push(
      { name: "Laptop & charger", quantity: 1, priority: "essential" },
      { name: "Portable mouse", quantity: 1, priority: "important" }
    );
  }

  items["Electronics"] = electronicsItems;

  // ==================== DOCUMENTS ====================
  const documentItems: AIPackingItem[] = [
    { name: "Passport", quantity: 1, priority: "essential" },
    { name: "Travel insurance documents", quantity: 1, priority: "essential" },
    { name: "Flight tickets/confirmation", quantity: 1, priority: "essential", note: "digital & printed" },
    { name: "Hotel reservations", quantity: 1, priority: "essential", note: "confirmation numbers" },
    { name: "ID/Driving license", quantity: 1, priority: "essential" },
    { name: "Credit/debit cards", quantity: 1, priority: "essential", note: "multiple cards recommended" },
    { name: "Cash", quantity: 1, priority: "important", note: "local currency" },
    { name: "Emergency contacts", quantity: 1, priority: "important", note: "written backup" },
    { name: "Travel plan/itinerary", quantity: 1, priority: "important", note: "shared with family" },
    { name: "Visa/entry permits", quantity: 1, priority: "essential", note: "if required" },
  ];

  items["Documents"] = documentItems;

  // ==================== HEALTH & SAFETY ====================
  const healthItems: AIPackingItem[] = [
    { name: "First aid kit", quantity: 1, priority: "important", note: "band-aids, antiseptic, gauze" },
    { name: "Antibacterial hand sanitizer", quantity: 1, priority: "important" },
    { name: "Eye drops", quantity: 1, priority: "optional" },
    { name: "Allergy medication", quantity: 1, priority: "optional" },
    { name: "Sleep aid/melatonin", quantity: 1, priority: "optional" },
    { name: "Nausea/motion sickness medication", quantity: 1, priority: "important" },
    { name: "Thermometer", quantity: 1, priority: "optional" },
    { name: "Water bottle", quantity: 1, priority: "important", note: "refillable, 500-1000ml" },
  ];

  if (isHotClimate) {
    healthItems.push(
      { name: "Electrolyte tablets", quantity: 1, priority: "important" },
      { name: "Cooling towel", quantity: 1, priority: "optional" }
    );
  }

  items["Health & Safety"] = healthItems;

  // ==================== MISCELLANEOUS ====================
  const miscItems: AIPackingItem[] = [
    { name: "Luggage locks", quantity: 1, priority: "important" },
    { name: "Travel pillow", quantity: 1, priority: "optional" },
    { name: "Sleep mask", quantity: 1, priority: "optional" },
    { name: "Earplugs", quantity: 1, priority: "optional" },
    { name: "Wet bag", quantity: 1, priority: "important", note: "for damp clothes" },
    { name: "Packing cubes", quantity: 1, priority: "optional" },
    { name: "Laundry bag", quantity: 1, priority: "important" },
    { name: "Portable laundry detergent", quantity: 1, priority: "optional" },
    { name: "Notebook & pen", quantity: 1, priority: "optional" },
    { name: "Book/reading material", quantity: 1, priority: "optional" },
    { name: "Entertainment items", quantity: 1, priority: "optional" },
    { name: "Luggage tags", quantity: 1, priority: "important" },
    { name: "Zip-lock bags", quantity: 1, priority: "important", note: "various sizes" },
    { name: "Duct tape", quantity: 1, priority: "optional", note: "wrapped on cardboard" },
  ];

  if (hasChildren) {
    miscItems.push(
      { name: "Toys/games", quantity: 1, priority: "optional" },
      { name: "Snacks", quantity: 1, priority: "important" },
      { name: "Child entertainment", quantity: 1, priority: "important", note: "tablets, books" }
    );
  }

  items["Miscellaneous"] = miscItems;

  return items;
}

/**
 * Build a human-readable summary of the packing list
 */
function buildSummary(
  destination: string,
  tripType: string,
  vibe: string,
  duration: number,
  climate: string
): string {
  return `Packing list for your ${duration}-day ${vibe} ${tripType} to ${destination}. 
  Climate: ${climate}. 
  Pack essentials and important items; optional items can be added based on personal preference and luggage space.`;
}

// ==================== MAIN HANDLER ====================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: GeneratePackingListRequest = await req.json();

    // Validate required fields
    const requiredFields = ["destination", "startDate", "endDate", "tripType", "vibe", "numTravelers"];
    for (const field of requiredFields) {
      if (!(field in payload)) {
        return new Response(
          JSON.stringify({
            error: `Missing required field: ${field}`,
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    const {
      destination,
      startDate,
      endDate,
      tripType,
      vibe,
      numTravelers,
      hasChildren = false,
      hasElders = false,
      climate,
    } = payload;

    // Calculate trip duration
    const tripDuration = calculateTripDuration(startDate, endDate);

    // Generate packing list
    const categories = generatePackingListItems(
      destination,
      startDate,
      endDate,
      tripType,
      vibe,
      numTravelers,
      hasChildren,
      hasElders,
      climate
    );

    // Build summary
    const inferred_climate = inferClimate(destination, climate);
    const summary = buildSummary(destination, tripType, vibe, tripDuration, inferred_climate);

    // Build response
    const response: GeneratePackingListResponse = {
      categories,
      tripDuration,
      summary,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating packing list:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});