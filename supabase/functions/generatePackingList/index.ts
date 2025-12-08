import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { destination, startDate, endDate, tripType, vibe, numTravelers } = await req.json();

    const categories = {
      "Clothing": [
        { name: "T-shirts", quantity: 5, note: "Casual wear" },
        { name: "Pants/Jeans", quantity: 3, note: "Comfortable" },
        { name: "Underwear", quantity: 7, note: "One per day" },
        { name: "Socks", quantity: 7 },
        { name: "Jacket", quantity: 1, note: "Weather dependent" },
      ],
      "Toiletries": [
        { name: "Toothbrush & toothpaste", quantity: 1 },
        { name: "Shampoo", quantity: 1 },
        { name: "Deodorant", quantity: 1 },
        { name: "Sunscreen", quantity: 1, note: "SPF 30+" },
      ],
      "Electronics": [
        { name: "Phone charger", quantity: 1 },
        { name: "Power adapter", quantity: 1, note: "For international travel" },
        { name: "Headphones", quantity: 1 },
      ],
      "Documents": [
        { name: "Passport", quantity: 1, note: "Check expiry date" },
        { name: "Travel insurance", quantity: 1 },
        { name: "Hotel confirmations", quantity: 1 },
        { name: "Flight tickets", quantity: 1 },
      ],
    };

    if (tripType === "business") {
      categories["Work"] = [
        { name: "Laptop", quantity: 1 },
        { name: "Laptop charger", quantity: 1 },
        { name: "Business cards", quantity: 1 },
        { name: "Notebook", quantity: 1 },
      ];
    }

    if (vibe === "family") {
      categories["Kids"] = [
        { name: "Toys/Entertainment", quantity: 1 },
        { name: "Snacks", quantity: 1 },
        { name: "First aid kit", quantity: 1 },
      ];
    }

    return new Response(
      JSON.stringify({ categories }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
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