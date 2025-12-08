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
    const { destination, interests } = await req.json();

    const recommendations = [
      {
        title: `Top-rated restaurant in ${destination}`,
        description: "Experience authentic local cuisine at this highly-rated establishment",
        category: "Food",
        estimatedCost: 75,
        location: destination,
      },
      {
        title: "Historic city tour",
        description: "Guided walking tour through the historic district",
        category: "Culture",
        estimatedCost: 45,
        location: destination,
      },
      {
        title: "Local market visit",
        description: "Explore the vibrant local markets and shop for souvenirs",
        category: "Shopping",
        estimatedCost: 30,
        location: destination,
      },
      {
        title: "Sunset viewpoint",
        description: "Watch the sunset from the best vantage point in the city",
        category: "Nature",
        estimatedCost: 0,
        location: destination,
      },
      {
        title: "Museum visit",
        description: "Discover the rich history and art at the local museum",
        category: "Art",
        estimatedCost: 20,
        location: destination,
      },
    ];

    const filteredRecommendations = recommendations.filter((rec) =>
      interests.length === 0 || interests.some((interest: string) =>
        rec.category.toLowerCase().includes(interest.toLowerCase())
      )
    );

    return new Response(
      JSON.stringify({ recommendations: filteredRecommendations.slice(0, 5) }),
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