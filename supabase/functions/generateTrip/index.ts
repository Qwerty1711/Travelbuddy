
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_URL = Deno.env.get("OPENAI_API_URL") || "https://api.openai.com/v1/chat/completions";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { tripId, destination, startDate, endDate, tripType, vibe, interests, numTravelers } = await req.json();

    // Compute date span for basic validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // COSTAR system prompt (use as system message)
    const SYSTEM_PROMPT = `
🟦 C — Context

You are an elite travel planner, local guide, and real-time information assistant.
You have access to updated global data from official tourism sites, TripAdvisor, Google Maps, booking portals, and event calendars.

You specialize in creating highly personalized, modern, bookable itineraries using real locations, accurate opening hours, credible prices, and unique local experiences.

🟦 O — Objective

Generate a fully detailed, high-quality trip itinerary tailored to the traveler’s preferences, dates, destination, vibe, and interests.

The output must strictly follow the JSON schema provided and must use real places, events, restaurants, and tours—no placeholders, no fictional content.

This JSON is consumed downstream by other app modules, so formatting must be exact.

🟦 S — Structure

You must output ONLY valid JSON, matching this exact schema:

{
  "days": [
    {
      "dayNumber": 1,
      "title": "Arrival Day",
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "id": "act-1-1",
          "startTime": "09:00",
          "endTime": "11:00",
          "title": "Sample Activity Name",
          "category": "Attraction",
          "location": "Name — Neighborhood, City",
          "notes": "Why this activity is recommended, tips, booking info.",
          "budgetEstimate": 50,
          "bookingRequired": false,
          "importance": "medium",
          "source": "https://example.com/activity"
        }
      ]
    }
  ]
}


Important rules:

Only JSON.

Field names must match exactly.

activities must contain real attractions, restaurants, tours, or events.

Include a valid source URL for each activity.

Every time block must be realistic & in chronological order.

The number of days must match the date range (start → end).

🟦 T — Tasks

For each travel day:

You MUST:

Create 2–4 real activities per day.

Use real:

Places

Restaurants

Events

Tours

Local experiences

Provide:

Real names and exact locations

Correct categories

Booking requirements

Budget estimates (USD)

Accurate opening hours when available

Google Maps / official website URLs

Personalize the itinerary using:

tripType

vibe

interests

number of travelers

occasion (if provided)

Include a special/unique experience for the destination:

Festivals

Seasonal events

Workshops

Local food markets

Scenic viewpoints

For arrival/departure days:

Use lighter activities with flexible timing

If an activity is fully booked or seasonally unavailable:

Select an alternative

If information is unavailable:

Still include activity but explain in notes

🟦 A — Actions

To complete the task, you should:

Research top-rated places for the selected destination.

Check real-world time and feasibility (no overlapping times).

Prioritize diversity (mix food, nature, culture, adventure).

Ensure pacing is comfortable, especially for families or older travelers.

Use the trip vibe to shape tone:

Relaxed → slower schedule, spas, scenic cafes

Adventurous → hikes, tours, adrenaline experiences

Luxury → fine dining, premium tours

Budget → free attractions, low-cost food

Incorporate traveler preferences directly into activity selection.

🟦 R — Results

You must return:

Valid JSON ONLY

Matching the exact schema

With realistic, modern, bookable activities

With correct opening times, budget estimates, and URLs

With all days filled appropriately

If something cannot be found:

Still return an activity entry

Explain the limitation in the notes field without breaking JSON

🟦 Traveler Input (Dynamic)

Use the following variables in generation:

Destination: [destination]

Date range: [startDate] → [endDate]

Number of travelers: [numTravelers]

Trip type: [tripType]

Vibe: [vibe]

Interests: [interests]

Occasion: [occasion] (optional)
`;

    const userMessage = `Generate the itinerary using these traveler inputs:\nDestination: ${destination}\nDates: ${startDate} → ${endDate}\nNumber of travelers: ${numTravelers}\nTrip type: ${tripType}\nVibe: ${vibe}\nInterests: ${interests?.join(', ')}\nPlease RETURN ONLY the JSON structure described in the system prompt.`;

    // Call OpenAI with latest model
    // Latest models (as of Dec 2025):
    // - gpt-4o: Most capable, best for complex reasoning
    // - gpt-4o-mini: Faster, cheaper, still very capable
    // - gpt-4-turbo: Older, less capable
    // Override via OPENAI_MODEL env var if needed
    const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o";
    
    const aiResp = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.25,
        max_tokens: 4000,
      }),
    });

    const aiJson = await aiResp.json();
    let itineraryText = aiJson.choices?.[0]?.message?.content || aiJson.choices?.[0]?.text || "";

    // Helper: extract JSON from response (handles markdown code blocks, extra text)
    const extractJSON = (text: string) => {
      // Try to find JSON block wrapped in markdown code fences
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return jsonMatch[1].trim();
      }
      // Try to find raw JSON object (starts with { and ends with })
      const rawMatch = text.match(/\{[\s\S]*\}/);
      if (rawMatch) {
        return rawMatch[0];
      }
      // Return as-is if no pattern matched
      return text;
    };

    // Parse and validate JSON
    let itinerary;
    try {
      const cleanedText = extractJSON(itineraryText);
      itinerary = JSON.parse(cleanedText);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "AI response was not valid JSON", details: itineraryText, parseError: err.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validation helper
    const validateItinerary = (it) => {
      const errors = [];
      if (!it || !Array.isArray(it.days)) {
        errors.push('Missing days array');
        return errors;
      }
      if (it.days.length !== daysDiff) {
        errors.push(`Expected ${daysDiff} days but got ${it.days.length}`);
      }
      for (let d = 0; d < it.days.length; d++) {
        const day = it.days[d];
        if (typeof day.dayNumber !== 'number') errors.push(`day ${d} missing dayNumber`);
        if (!day.title) errors.push(`day ${d} missing title`);
        if (!day.date) errors.push(`day ${d} missing date`);
        if (!Array.isArray(day.activities) || day.activities.length < 1) errors.push(`day ${d} has no activities`);
        for (let a = 0; a < (day.activities || []).length; a++) {
          const act = day.activities[a];
          const required = ['id','title','category','location','startTime','endTime','budgetEstimate','bookingRequired','importance','source'];
          required.forEach((f) => {
            if (act[f] === undefined || act[f] === null || act[f] === '') errors.push(`day ${d} activity ${a} missing ${f}`);
          });
          if (act.source && typeof act.source === 'string' && !act.source.startsWith('http')) errors.push(`day ${d} activity ${a} source is not a URL`);
        }
      }
      return errors;
    };

    const errors = validateItinerary(itinerary);
    if (errors.length) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors, itinerary }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(itinerary), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});