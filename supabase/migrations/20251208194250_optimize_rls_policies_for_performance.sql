/*
  # Optimize RLS Policies for Performance

  1. Performance Optimization
    - Replace all `auth.uid()` calls with `(select auth.uid())`
    - This ensures auth functions are evaluated once per query instead of per row
    - Significantly improves query performance at scale
  
  2. Changes
    - Drop and recreate all RLS policies with optimized subqueries
    - Combine multiple SELECT policies on trips table to avoid duplication
    - Maintain exact same security logic with better performance
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own trips" ON trips;
DROP POLICY IF EXISTS "Users can create own trips" ON trips;
DROP POLICY IF EXISTS "Users can update own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON trips;
DROP POLICY IF EXISTS "Anyone can view shared trip data via public_id" ON trips;

DROP POLICY IF EXISTS "Users can view shares for their trips" ON trip_shares;
DROP POLICY IF EXISTS "Trip owners can create shares" ON trip_shares;
DROP POLICY IF EXISTS "Trip owners can delete shares" ON trip_shares;

DROP POLICY IF EXISTS "Users can view collaborators for their trips" ON collaborators;
DROP POLICY IF EXISTS "Trip owners can add collaborators" ON collaborators;
DROP POLICY IF EXISTS "Trip owners can update collaborators" ON collaborators;
DROP POLICY IF EXISTS "Trip owners can remove collaborators" ON collaborators;

DROP POLICY IF EXISTS "Users can view trip days for accessible trips" ON trip_days;
DROP POLICY IF EXISTS "Users can create trip days for accessible trips" ON trip_days;
DROP POLICY IF EXISTS "Users can update trip days for editable trips" ON trip_days;
DROP POLICY IF EXISTS "Users can delete trip days for editable trips" ON trip_days;

DROP POLICY IF EXISTS "Users can view activities for accessible trips" ON activities;
DROP POLICY IF EXISTS "Users can create activities for editable trips" ON activities;
DROP POLICY IF EXISTS "Users can update activities for editable trips" ON activities;
DROP POLICY IF EXISTS "Users can delete activities for editable trips" ON activities;

DROP POLICY IF EXISTS "Users can view documents for accessible trips" ON documents;
DROP POLICY IF EXISTS "Users can upload documents for editable trips" ON documents;
DROP POLICY IF EXISTS "Users can delete documents for editable trips" ON documents;

DROP POLICY IF EXISTS "Users can view packing items for accessible trips" ON packing_items;
DROP POLICY IF EXISTS "Users can create packing items for editable trips" ON packing_items;
DROP POLICY IF EXISTS "Users can update packing items for editable trips" ON packing_items;
DROP POLICY IF EXISTS "Users can delete packing items for editable trips" ON packing_items;

DROP POLICY IF EXISTS "Users can view expenses for accessible trips" ON expenses;
DROP POLICY IF EXISTS "Users can create expenses for editable trips" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses for editable trips" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses for editable trips" ON expenses;

DROP POLICY IF EXISTS "Users can view notes for accessible trips" ON notes;
DROP POLICY IF EXISTS "Users can create notes for editable trips" ON notes;
DROP POLICY IF EXISTS "Users can update notes for editable trips" ON notes;
DROP POLICY IF EXISTS "Users can delete notes for editable trips" ON notes;

-- Optimized trips policies (combined SELECT policy)
CREATE POLICY "Users can view own and shared trips"
  ON trips FOR SELECT
  TO anon, authenticated
  USING (
    owner_id = (select auth.uid()) OR
    id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid())) OR
    id IN (SELECT trip_id FROM trip_shares)
  );

CREATE POLICY "Users can create own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (
    owner_id = (select auth.uid()) OR
    id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
  )
  WITH CHECK (
    owner_id = (select auth.uid()) OR
    id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
  );

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (owner_id = (select auth.uid()));

-- Optimized trip_shares policies
CREATE POLICY "Users can view shares for their trips"
  ON trip_shares FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = (select auth.uid()) OR
      id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()))
    )
  );

CREATE POLICY "Trip owners can create shares"
  ON trip_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE owner_id = (select auth.uid()))
  );

CREATE POLICY "Trip owners can delete shares"
  ON trip_shares FOR DELETE
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE owner_id = (select auth.uid()))
  );

-- Optimized collaborators policies
CREATE POLICY "Users can view collaborators for their trips"
  ON collaborators FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = (select auth.uid()) OR
      id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()))
    )
  );

CREATE POLICY "Trip owners can add collaborators"
  ON collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE owner_id = (select auth.uid()))
  );

CREATE POLICY "Trip owners can update collaborators"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE owner_id = (select auth.uid()))
  )
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE owner_id = (select auth.uid()))
  );

CREATE POLICY "Trip owners can remove collaborators"
  ON collaborators FOR DELETE
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE owner_id = (select auth.uid()))
  );

-- Optimized trip_days policies
CREATE POLICY "Users can view trip days for accessible trips"
  ON trip_days FOR SELECT
  TO anon, authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid())) OR
        id IN (SELECT trip_id FROM trip_shares)
    )
  );

CREATE POLICY "Users can create trip days for accessible trips"
  ON trip_days FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

CREATE POLICY "Users can update trip days for editable trips"
  ON trip_days FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

CREATE POLICY "Users can delete trip days for editable trips"
  ON trip_days FOR DELETE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

-- Optimized activities policies
CREATE POLICY "Users can view activities for accessible trips"
  ON activities FOR SELECT
  TO anon, authenticated
  USING (
    trip_day_id IN (
      SELECT id FROM trip_days WHERE trip_id IN (
        SELECT id FROM trips WHERE 
          owner_id = (select auth.uid()) OR
          id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid())) OR
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
          owner_id = (select auth.uid()) OR
          id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
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
          owner_id = (select auth.uid()) OR
          id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
      )
    )
  )
  WITH CHECK (
    trip_day_id IN (
      SELECT id FROM trip_days WHERE trip_id IN (
        SELECT id FROM trips WHERE 
          owner_id = (select auth.uid()) OR
          id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
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
          owner_id = (select auth.uid()) OR
          id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
      )
    )
  );

-- Optimized documents policies
CREATE POLICY "Users can view documents for accessible trips"
  ON documents FOR SELECT
  TO anon, authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid())) OR
        id IN (SELECT trip_id FROM trip_shares)
    )
  );

CREATE POLICY "Users can upload documents for editable trips"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

CREATE POLICY "Users can delete documents for editable trips"
  ON documents FOR DELETE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

-- Optimized packing_items policies
CREATE POLICY "Users can view packing items for accessible trips"
  ON packing_items FOR SELECT
  TO anon, authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid())) OR
        id IN (SELECT trip_id FROM trip_shares)
    )
  );

CREATE POLICY "Users can create packing items for editable trips"
  ON packing_items FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

CREATE POLICY "Users can update packing items for editable trips"
  ON packing_items FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

CREATE POLICY "Users can delete packing items for editable trips"
  ON packing_items FOR DELETE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

-- Optimized expenses policies
CREATE POLICY "Users can view expenses for accessible trips"
  ON expenses FOR SELECT
  TO anon, authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid())) OR
        id IN (SELECT trip_id FROM trip_shares)
    )
  );

CREATE POLICY "Users can create expenses for editable trips"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

CREATE POLICY "Users can update expenses for editable trips"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

CREATE POLICY "Users can delete expenses for editable trips"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

-- Optimized notes policies
CREATE POLICY "Users can view notes for accessible trips"
  ON notes FOR SELECT
  TO anon, authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid())) OR
        id IN (SELECT trip_id FROM trip_shares)
    )
  );

CREATE POLICY "Users can create notes for editable trips"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

CREATE POLICY "Users can update notes for editable trips"
  ON notes FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  )
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );

CREATE POLICY "Users can delete notes for editable trips"
  ON notes FOR DELETE
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE 
        owner_id = (select auth.uid()) OR
        id IN (SELECT trip_id FROM collaborators WHERE user_id = (select auth.uid()) AND role = 'editor')
    )
  );