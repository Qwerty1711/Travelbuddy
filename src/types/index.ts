export type TripType = 'vacation' | 'business' | 'mixed';
export type TripVibe = 'relaxed' | 'adventurous' | 'luxury' | 'budget' | 'family';
export type CollaboratorRole = 'viewer' | 'editor';
export type ActivityImportance = 'low' | 'medium' | 'high';
export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'activities' | 'other';

export interface Trip {
  id: string;
  owner_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: TripType;
  vibe: TripVibe;
  interests: string[];
  num_travelers: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TripShare {
  id: string;
  trip_id: string;
  public_id: string;
  created_at: string;
}

export interface Collaborator {
  id: string;
  trip_id: string;
  user_id: string;
  role: CollaboratorRole;
  created_at: string;
  user_email?: string;
}

export interface TripDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title: string;
  created_at: string;
  updated_at: string;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  trip_day_id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  category: string;
  location: string;
  notes: string;
  budget_estimate: number;
  booking_required: boolean;
  importance: ActivityImportance;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  trip_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  uploader_id: string;
  uploaded_at: string;
}

export interface PackingItem {
  id: string;
  trip_id: string;
  category: string;
  item_name: string;
  quantity: number;
  note: string;
  packed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  trip_id: string;
  day_number: number;
  text: string;
  ai_summary: string;
  created_at: string;
  updated_at: string;
}

export interface AIItineraryDay {
  dayNumber: number;
  title: string;
  date: string;
  activities: Array<{
    id: string;
    startTime: string;
    endTime: string;
    title: string;
    category: string;
    location: string;
    notes: string;
    budgetEstimate: number;
    bookingRequired: boolean;
    importance: ActivityImportance;
  }>;
}

export interface AIItineraryResponse {
  days: AIItineraryDay[];
}

// ==================== PACKING LIST TYPES ====================
/**
 * Request payload for generatePackingList Edge Function
 * Contains all trip context needed to generate AI packing recommendations
 */
export interface GeneratePackingListRequest {
  destination: string;
  startDate: string; // ISO 8601 format (YYYY-MM-DD)
  endDate: string; // ISO 8601 format (YYYY-MM-DD)
  tripType: TripType; // 'vacation' | 'business' | 'mixed'
  vibe: TripVibe; // 'relaxed' | 'adventurous' | 'luxury' | 'budget' | 'family'
  numTravelers: number;
  hasChildren: boolean; // whether traveling with kids
  hasElders: boolean; // whether traveling with elderly
  climate?: string; // optional: e.g., "tropical", "cold", "temperate"
  activities?: string[]; // optional: specific activities planned
}

/**
 * Individual packing item with priority and optional notes
 */
export interface AIPackingItem {
  name: string;
  quantity: number;
  priority: 'essential' | 'important' | 'optional';
  note?: string;
}

/**
 * Response from generatePackingList Edge Function
 * Organized by category with AI-ranked items by priority
 */
export interface AIPackingListResponse {
  categories: {
    [category: string]: AIPackingItem[];
  };
  tripDuration: number; // number of days
  summary: string; // brief summary of recommendations
}

/**
 * Legacy interface - kept for backward compatibility
 * Use AIPackingItem and AIPackingListResponse instead
 */
export interface AIPackingListResponseLegacy {
  categories: {
    [category: string]: Array<{
      name: string;
      quantity: number;
      note?: string;
    }>;
  };
}

export interface AIRecommendation {
  title: string;
  description: string;
  category: string;
  estimatedCost: number;
  location?: string;
}

export interface AIRecommendationsResponse {
  recommendations: AIRecommendation[];
}
