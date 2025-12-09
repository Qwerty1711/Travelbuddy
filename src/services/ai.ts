import { supabase } from '../lib/supabase';
import type {
  Trip,
  AIItineraryResponse,
  AIPackingListResponse,
  AIRecommendationsResponse,
} from '../types';

// Base URL for Supabase Edge Functions
// Example: https://xyz.supabase.co/functions/v1
const FUNCTION_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

// Helper: build correct auth headers for calling Edge Functions
async function buildFunctionHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Include API key for Supabase Edge Functions
  if (anonKey) {
    headers['apikey'] = anonKey;
  }

  // If user is logged in, include their JWT token
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

// ----------------- Itinerary (generatetrip) -----------------

export async function generateItinerary(trip: Trip): Promise<AIItineraryResponse> {
  const headers = await buildFunctionHeaders();
  const url = `${FUNCTION_BASE_URL}/generatetrip`;

  console.log('DEBUG: Calling generateItinerary with:', {
    url,
    headers: Object.keys(headers),
    hasApiKey: !!headers['apikey'],
    hasAuth: !!headers['Authorization'],
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      tripId: trip.id,
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      tripType: trip.trip_type,
      vibe: trip.vibe,
      interests: trip.interests,
      numTravelers: trip.num_travelers,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('generateItinerary HTTP error', response.status, text);
    throw new Error(`Failed to generate itinerary: ${response.status} - ${text}`);
  }

  const data = (await response.json()) as AIItineraryResponse;
  return data;
}

// ----------------- Packing List (generatepackinglist) -----------------

export async function generatePackingList(trip: Trip): Promise<AIPackingListResponse> {
  const headers = await buildFunctionHeaders();

  const response = await fetch(`${FUNCTION_BASE_URL}/generatepackinglist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      tripType: trip.trip_type,
      vibe: trip.vibe,
      numTravelers: trip.num_travelers,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('generatePackingList HTTP error', response.status, text);
    throw new Error('Failed to generate packing list');
  }

  const data = (await response.json()) as AIPackingListResponse;
  return data;
}

// ----------------- Recommendations (getrecommendations) -----------------

export async function getRecommendations(
  destination: string,
  interests: string[]
): Promise<AIRecommendationsResponse> {
  const headers = await buildFunctionHeaders();

  const response = await fetch(`${FUNCTION_BASE_URL}/getrecommendations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      destination,
      interests,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('getRecommendations HTTP error', response.status, text);
    throw new Error('Failed to get recommendations');
  }

  const data = (await response.json()) as AIRecommendationsResponse;
  return data;
}

// ----------------- Notes Summary (summarisenotes) -----------------

export async function summariseNotes(text: string): Promise<string> {
  const headers = await buildFunctionHeaders();

  const response = await fetch(`${FUNCTION_BASE_URL}/summarisenotes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const textBody = await response.text().catch(() => '');
    console.error('summariseNotes HTTP error', response.status, textBody);
    throw new Error('Failed to summarise notes');
  }

  const data = (await response.json()) as { summary: string };
  return data.summary;
}
