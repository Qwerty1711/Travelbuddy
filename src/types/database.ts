export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          destination: string;
          start_date: string;
          end_date: string;
          trip_type: 'vacation' | 'business' | 'mixed';
          vibe: 'relaxed' | 'adventurous' | 'luxury' | 'budget' | 'family';
          interests: string[];
          num_travelers: number;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['trips']['Insert']>;
      };
      trip_shares: {
        Row: {
          id: string;
          trip_id: string;
          public_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trip_shares']['Row'], 'id' | 'public_id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['trip_shares']['Insert']>;
      };
      collaborators: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          role: 'viewer' | 'editor';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['collaborators']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['collaborators']['Insert']>;
      };
      trip_days: {
        Row: {
          id: string;
          trip_id: string;
          day_number: number;
          date: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trip_days']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['trip_days']['Insert']>;
      };
      activities: {
        Row: {
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
          importance: 'low' | 'medium' | 'high';
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['activities']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['activities']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          trip_id: string;
          file_name: string;
          storage_path: string;
          mime_type: string;
          file_size: number;
          uploader_id: string;
          uploaded_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'uploaded_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      packing_items: {
        Row: {
          id: string;
          trip_id: string;
          category: string;
          item_name: string;
          quantity: number;
          note: string;
          packed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['packing_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['packing_items']['Insert']>;
      };
      expenses: {
        Row: {
          id: string;
          trip_id: string;
          date: string;
          category: 'transport' | 'accommodation' | 'food' | 'activities' | 'other';
          description: string;
          amount: number;
          currency: string;
          note: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
      };
      notes: {
        Row: {
          id: string;
          trip_id: string;
          day_number: number;
          text: string;
          ai_summary: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['notes']['Insert']>;
      };
    };
  };
};
