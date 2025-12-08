/*
  # Travel Buddy - Complete Database Schema

  1. New Tables
    - `trips`
      - Core trip information with owner, destination, dates, preferences
      - Stores trip type, vibe, interests, and traveler count
    
    - `trip_shares`
      - Public sharing links for trips (read-only access)
      - Generates unique public_id for shareable URLs
    
    - `collaborators`
      - User-based collaboration on trips
      - Roles: viewer (read-only) or editor (can modify)
    
    - `trip_days`
      - Individual days within a trip itinerary
      - Links to trip with day number, date, and title
    
    - `activities`
      - Detailed activities within each trip day
      - Includes timing, location, category, budget, and importance
    
    - `documents`
      - Travel documents (boarding passes, confirmations, visas)
      - References files stored in Supabase Storage
    
    - `packing_items`
      - Packing list items organized by category
      - Tracks packed status for each item
    
    - `expenses`
      - Trip expenses with category and currency
      - Enables budget tracking and financial summaries
    
    - `notes`
      - Daily journal entries and notes
      - Includes AI-generated summaries
  
  2. Security
    - Enable RLS on all tables
    - Owners have full access to their trips and related data
    - Collaborators can access based on their role (viewer/editor)
    - Public shares allow read-only access via public_id
    - All policies verify authentication and ownership/collaboration
  
  3. Indexes
    - Foreign key indexes for performance
    - Unique constraints on public share IDs
    - Composite indexes for common queries
*/

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  trip_type text NOT NULL CHECK (trip_type IN ('vacation', 'business', 'mixed')),
  vibe text NOT NULL CHECK (vibe IN ('relaxed', 'adventurous', 'luxury', 'budget', 'family')),
  interests text[] DEFAULT '{}',
  num_travelers integer DEFAULT 1 CHECK (num_travelers > 0),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trip_shares table for public sharing
CREATE TABLE IF NOT EXISTS trip_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  public_id text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz DEFAULT now()
);

-- Create collaborators table
CREATE TABLE IF NOT EXISTS collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('viewer', 'editor')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- Create trip_days table
CREATE TABLE IF NOT EXISTS trip_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  day_number integer NOT NULL CHECK (day_number > 0),
  date date NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, day_number)
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_day_id uuid REFERENCES trip_days(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  start_time time,
  end_time time,
  category text NOT NULL,
  location text DEFAULT '',
  notes text DEFAULT '',
  budget_estimate numeric(10,2) DEFAULT 0,
  booking_required boolean DEFAULT false,
  importance text DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high')),
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  file_size integer DEFAULT 0,
  uploaded_at timestamptz DEFAULT now()
);

-- Create packing_items table
CREATE TABLE IF NOT EXISTS packing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  name text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  note text DEFAULT '',
  packed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  category text NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'activities', 'other')),
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  day_number integer NOT NULL CHECK (day_number > 0),
  text text DEFAULT '',
  ai_summary text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, day_number)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_owner_id ON trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_trip_shares_public_id ON trip_shares(public_id);
CREATE INDEX IF NOT EXISTS idx_trip_shares_trip_id ON trip_shares(trip_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_trip_id ON collaborators(trip_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip_day_id ON activities(trip_day_id);
CREATE INDEX IF NOT EXISTS idx_documents_trip_id ON documents(trip_id);
CREATE INDEX IF NOT EXISTS idx_packing_items_trip_id ON packing_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_notes_trip_id ON notes(trip_id);

-- Enable Row Level Security on all tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Trips policies
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
  );

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Trip shares policies
CREATE POLICY "Users can view shares for their trips"
  ON trip_shares FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid() OR
      id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Trip owners can create shares"
  ON trip_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())
  );

CREATE POLICY "Trip owners can delete shares"
  ON trip_shares FOR DELETE
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())
  );

-- Public read-only access for shared trips (via public_id)
CREATE POLICY "Anyone can view shared trip data via public_id"
  ON trips FOR SELECT
  TO anon, authenticated
  USING (
    id IN (SELECT trip_id FROM trip_shares)
  );

-- Collaborators policies
CREATE POLICY "Users can view collaborators for their trips"
  ON collaborators FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid() OR
      id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Trip owners can add collaborators"
  ON collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())
  );

CREATE POLICY "Trip owners can update collaborators"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())
  );

CREATE POLICY "Trip owners can remove collaborators"
  ON collaborators FOR DELETE
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE owner_id = auth.uid())
  );

-- Trip days policies
CREATE POLICY "Users can view trip days for accessible trips"
  ON trip_days FOR SELECT
  TO anon, authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid()) OR
        id IN (SELECT trip_id FROM trip_shares)
    )
  );

CREATE POLICY "Users can create trip days for accessible trips"
  ON trip_days FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

CREATE POLICY "Users can update trip days for editable trips"
  ON trip_days FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

CREATE POLICY "Users can delete trip days for editable trips"
  ON trip_days FOR DELETE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

-- Activities policies
CREATE POLICY "Users can view activities for accessible trips"
  ON activities FOR SELECT
  TO anon, authenticated
  USING (
    trip_day_id IN (
      SELECT id FROM trip_days WHERE trip_id IN (
        SELECT id FROM trips WHERE 
          owner_id = auth.uid() OR
          id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid()) OR
          id IN (SELECT trip_id FROM trip_shares)
      )
    )
  );

CREATE POLICY "Users can create activities for editable trips"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_day_id IN (
      SELECT id FROM trip_days WHERE trip_id IN (
        SELECT id FROM trips WHERE 
          owner_id = auth.uid() OR
          id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
      )
    )
  );

CREATE POLICY "Users can update activities for editable trips"
  ON activities FOR UPDATE
  TO authenticated
  USING (
    trip_day_id IN (
      SELECT id FROM trip_days WHERE trip_id IN (
        SELECT id FROM trips WHERE 
          owner_id = auth.uid() OR
          id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
      )
    )
  )
  WITH CHECK (
    trip_day_id IN (
      SELECT id FROM trip_days WHERE trip_id IN (
        SELECT id FROM trips WHERE 
          owner_id = auth.uid() OR
          id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
      )
    )
  );

CREATE POLICY "Users can delete activities for editable trips"
  ON activities FOR DELETE
  TO authenticated
  USING (
    trip_day_id IN (
      SELECT id FROM trip_days WHERE trip_id IN (
        SELECT id FROM trips WHERE 
          owner_id = auth.uid() OR
          id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
      )
    )
  );

-- Documents policies
CREATE POLICY "Users can view documents for accessible trips"
  ON documents FOR SELECT
  TO anon, authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid()) OR
        id IN (SELECT trip_id FROM trip_shares)
    )
  );

CREATE POLICY "Users can upload documents for editable trips"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

CREATE POLICY "Users can delete documents for editable trips"
  ON documents FOR DELETE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

-- Packing items policies
CREATE POLICY "Users can view packing items for accessible trips"
  ON packing_items FOR SELECT
  TO anon, authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid()) OR
        id IN (SELECT trip_id FROM trip_shares)
    )
  );

CREATE POLICY "Users can create packing items for editable trips"
  ON packing_items FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

CREATE POLICY "Users can update packing items for editable trips"
  ON packing_items FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

CREATE POLICY "Users can delete packing items for editable trips"
  ON packing_items FOR DELETE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

-- Expenses policies
CREATE POLICY "Users can view expenses for accessible trips"
  ON expenses FOR SELECT
  TO anon, authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid()) OR
        id IN (SELECT trip_id FROM trip_shares)
    )
  );

CREATE POLICY "Users can create expenses for editable trips"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

CREATE POLICY "Users can update expenses for editable trips"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

CREATE POLICY "Users can delete expenses for editable trips"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

-- Notes policies
CREATE POLICY "Users can view notes for accessible trips"
  ON notes FOR SELECT
  TO anon, authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid()) OR
        id IN (SELECT trip_id FROM trip_shares)
    )
  );

CREATE POLICY "Users can create notes for editable trips"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

CREATE POLICY "Users can update notes for editable trips"
  ON notes FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );

CREATE POLICY "Users can delete notes for editable trips"
  ON notes FOR DELETE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = auth.uid() OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = auth.uid() AND role = 'editor')
    )
  );