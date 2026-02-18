export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string;
          following_count: number;
          applying_count: number;
          adopted_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname?: string;
          avatar_url?: string;
          following_count?: number;
          applying_count?: number;
          adopted_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nickname?: string;
          avatar_url?: string;
          following_count?: number;
          applying_count?: number;
          adopted_count?: number;
          updated_at?: string;
        };
      };
      pets: {
        Row: {
          id: string;
          name: string;
          breed: string;
          age_text: string;
          distance: string;
          gender: 'male' | 'female';
          image_url: string;
          price: number;
          location: string;
          weight: string;
          description: string;
          tags: string[];
          is_urgent: boolean;
          story: string;
          health: Json;
          foster_parent_name: string;
          foster_parent_avatar: string;
          category: 'all' | 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';
          status: 'available' | 'adopted' | 'pending';
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          breed: string;
          age_text: string;
          distance?: string;
          gender: 'male' | 'female';
          image_url?: string;
          price?: number;
          location?: string;
          weight?: string;
          description?: string;
          tags?: string[];
          is_urgent?: boolean;
          story?: string;
          health?: Json;
          foster_parent_name?: string;
          foster_parent_avatar?: string;
          category?: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['pets']['Insert']>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          pet_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pet_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>;
      };
      adoption_applications: {
        Row: {
          id: string;
          user_id: string;
          pet_id: string;
          full_name: string;
          age: string;
          occupation: string;
          housing_type: string;
          living_status: string;
          has_experience: boolean;
          message: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pet_id: string;
          full_name: string;
          age: string;
          occupation: string;
          housing_type: string;
          living_status: string;
          has_experience?: boolean;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['adoption_applications']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          other_user_name: string;
          other_user_avatar: string;
          last_message: string;
          last_message_time: string;
          unread_count: number;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          other_user_name: string;
          other_user_avatar?: string;
          last_message?: string;
          last_message_time?: string;
          unread_count?: number;
          is_system?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          content: string;
          is_self: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          content: string;
          is_self?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>;
      };
      verifications: {
        Row: {
          id: string;
          user_id: string;
          real_name: string;
          id_type: string;
          id_number: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          real_name: string;
          id_type?: string;
          id_number: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['verifications']['Insert']>;
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          content: string;
          contact: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          content: string;
          contact?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['feedback']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
