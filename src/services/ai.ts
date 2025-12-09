import { supabase } from '../lib/supabase';
import type {
  Trip,
  AIItineraryResponse,
  AIPackingListResponse,
  AIRecommendationsResponse,
} from '../types';

// ✅ Correct base URL for Supabase Edge Functions
// Final URL will be: https://<project-ref>.supabase.co/functions/v1/<function-name>
const EDGE_FUNCTION_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function generateItinerary(trip: Trip): Promise<AIItineraryResponse> {
  const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/generatetrip`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
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
    throw new Error('Failed to generate itinerary');
  }

  return await response.json();
}

export async function generatePackingList(trip: Trip): Promise<AIPackingListResponse> {
  const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/generatepackinglist`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
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
    throw new Error('Failed to generate packing list');
  }

  return await response.json();
}

export async function getRecommendations(
  destination: string,
  interests: string[]
): Promise<AIRecommendationsResponse> {
  const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/getrecommendations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination,
      interests,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get recommendations');
  }

  return await response.json();
}

export async function summariseNotes(text: string): Promise<string> {
  const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/summarisenotes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to summarise notes');
  }

  const data = await response.json();
  return data.summary;
}
