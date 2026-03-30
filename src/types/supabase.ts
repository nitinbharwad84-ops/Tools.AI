export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string
          bio: string | null
          avatar_url: string | null
          gemini_api_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email: string
          bio?: string | null
          avatar_url?: string | null
          gemini_api_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string
          bio?: string | null
          avatar_url?: string | null
          gemini_api_key?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      generation_history: {
        Row: {
          id: string
          user_id: string
          tool_name: string
          user_prompt: string
          enhanced_prompt: string | null
          options_selected: Json
          output: string
          output_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_name: string
          user_prompt: string
          enhanced_prompt?: string | null
          options_selected?: Json
          output: string
          output_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_name?: string
          user_prompt?: string
          enhanced_prompt?: string | null
          options_selected?: Json
          output?: string
          output_type?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type GenerationHistory = Database['public']['Tables']['generation_history']['Row'];
