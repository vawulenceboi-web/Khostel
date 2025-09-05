import { Database as DatabaseGenerated } from '@/types/database.generated'

export type Database = DatabaseGenerated

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

export type UserMetadata = {
  first_name: string
  last_name?: string | null
  phone?: string | null
  role: 'student' | 'agent' | 'admin'
  school_id?: string | null
  business_reg_number?: string | null
  address?: string | null
  profile_image_url?: string | null
  face_photo_url?: string | null
  verified_status?: boolean
  terms_accepted: boolean
  terms_accepted_at: string
}

declare module '@supabase/supabase-js' {
  export interface UserMetadata extends Record<string, any> {
    first_name: string
    last_name?: string | null
    phone?: string | null
    role: 'student' | 'agent' | 'admin'
    school_id?: string | null
    business_reg_number?: string | null
    address?: string | null
    profile_image_url?: string | null
    face_photo_url?: string | null
    verified_status?: boolean
    terms_accepted: boolean
    terms_accepted_at: string
  }
}
