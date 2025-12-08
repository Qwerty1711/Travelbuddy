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
    const { tripId, destination, startDate, endDate, tripType, vibe, interests, numTravelers } = await req.json();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const days = [];
    for (let i = 1; i <= daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i - 1);

      days.push({
        dayNumber: i,
        title: i === 1 ? "Arrival Day" : i === daysDiff ? "Departure Day" : `Exploring ${destination}`,
        date: currentDate.toISOString().split('T')[0],
        activities: [
          {
            id: `temp-${i}-1`,
            startTime: "09:00",
            endTime: "11:00",
            title: `Morning activity in ${destination}`,
            category: interests[0] || "Culture",
            location: destination,
            notes: `Experience the ${vibe} vibe of ${destination}`,
            budgetEstimate: 50,
            bookingRequired: false,
            importance: "medium",
          },
          {
            id: `temp-${i}-2`,
            startTime: "12:00",
            endTime: "14:00",
            title: "Lunch",
            category: "Food",
            location: destination,
            notes: "Try local cuisine",
            budgetEstimate: 30,
            bookingRequired: false,
            importance: "high",
          },
          {
            id: `temp-${i}-3`,
            startTime: "15:00",
            endTime: "18:00",
            title: `Afternoon ${interests[1] || 'sightseeing'}`,
            category: interests[1] || "Culture",
            location: destination,
            notes: `Perfect for a ${tripType} trip`,
            budgetEstimate: 40,
            bookingRequired: true,
            importance: "high",
          },
        ],
      });
    }

    return new Response(
      JSON.stringify({ days }),
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