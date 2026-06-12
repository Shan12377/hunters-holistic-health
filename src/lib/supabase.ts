import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual Supabase project URL and anon key
// Get these from: https://app.supabase.com → Project Settings → API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          age: number | null
          role: 'client' | 'educator'
          display_handle: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      blood_pressure_logs: {
        Row: {
          id: string
          user_id: string
          systolic: number
          diastolic: number
          pulse: number | null
          notes: string | null
          logged_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['blood_pressure_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['blood_pressure_logs']['Insert']>
      }
      daily_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          steps: number | null
          energy_level: number | null
          water_oz: number | null
          morning_fast_done: boolean
          meal1_logged: boolean
          meal2_logged: boolean
          snack_logged: boolean
          supplement_am_done: boolean
          supplement_pm_done: boolean
          late_slip_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_logs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['daily_logs']['Insert']>
      }
      meal_logs: {
        Row: {
          id: string
          user_id: string
          food_name: string
          meal_type: 'morning_fast' | 'meal1' | 'meal2' | 'snack'
          calories: number | null
          ai_flag: boolean
          ai_warning: string | null
          ai_alternatives: string[] | null
          logged_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['meal_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['meal_logs']['Insert']>
      }
    }
  }
}
