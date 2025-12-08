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
  uploaded_at: string;
}

export interface PackingItem {
  id: string;
  trip_id: string;
  category: string;
  name: string;
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

export interface AIPackingItem {
  name: string;
  quantity: number;
  note?: string;
}

export interface AIPackingListResponse {
  categories: {
    [category: string]: AIPackingItem[];
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
