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
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string | null
          phone: string | null
          role: 'student' | 'agent' | 'admin'
          school_id: string | null
          business_reg_number: string | null
          address: string | null
          profile_image_url: string | null
          face_photo_url: string | null
          verified_status: boolean
          terms_accepted: boolean
          terms_accepted_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name?: string | null
          phone?: string | null
          role?: 'student' | 'agent' | 'admin'
          school_id?: string | null
          business_reg_number?: string | null
          address?: string | null
          profile_image_url?: string | null
          face_photo_url?: string | null
          verified_status?: boolean
          terms_accepted?: boolean
          terms_accepted_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string | null
          phone?: string | null
          role?: 'student' | 'agent' | 'admin'
          school_id?: string | null
          business_reg_number?: string | null
          address?: string | null
          profile_image_url?: string | null
          face_photo_url?: string | null
          verified_status?: boolean
          terms_accepted?: boolean
          terms_accepted_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      schools: {
        Row: {
          id: string
          name: string
          city: string
          state: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          state: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          state?: string
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
  }
}
