import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL must be set')
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY must be set')
}

// Create Supabase client - this is the ONLY database connection we use
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Utility functions for real-time timestamps
function calculateTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

function isWithinLast24Hours(dateString: string): boolean {
  const now = new Date()
  const date = new Date(dateString)
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  return diffInHours <= 24
}

// Database operations using ONLY Supabase client (no direct PostgreSQL)
export const db = {
  // Export supabase client for direct access when needed
  supabase,
  // Users operations
  users: {
    async findByEmail(email: string) {
      console.log('🔍 Finding user by email:', email)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle()
      
      if (error) {
        console.error('❌ Error finding user:', error)
        throw error
      }
      
      console.log('✅ User query completed:', data ? 'User found' : 'User not found')
      return data
    },

    async create(userData: {
      email: string
      password_hash: string
      first_name: string
      last_name?: string
      phone?: string
      role: string
      school_id?: string
      business_reg_number?: string
      address?: string
      profile_image_url?: string
      terms_accepted?: boolean
      terms_accepted_at?: string
      verified_status: boolean
    }) {
      console.log('👤 Creating user:', userData.email)
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error creating user:', error)
        throw error
      }
      
      console.log('✅ User created successfully')
      return data
    },

    async findById(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (error) {
        throw error
      }
      
      return data
    },

    async findPendingAgents() {
      console.log('📋 Finding pending agents...')
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone,
          address,
          business_reg_number,
          profile_image_url,
          created_at,
          terms_accepted,
          terms_accepted_at
        `)
        .eq('role', 'agent')
        .eq('verified_status', false)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('❌ Error finding pending agents:', error)
        throw error
      }
      
      console.log(`✅ Found ${data?.length || 0} pending agents`)
      return data || []
    },

    async updateVerificationStatus(userId: string, verified: boolean) {
      console.log(`🔄 Updating verification status for ${userId}:`, verified)
      const { data, error } = await supabase
        .from('users')
        .update({ 
          verified_status: verified,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error updating verification status:', error)
        throw error
      }
      
      console.log('✅ Verification status updated')
      return data
    }
  },

  // Hostels operations
  hostels: {
    async findAll(filters: any = {}) {
      let query = supabase
        .from('hostels')
        .select(`
          *,
          location:locations(id, name, latitude, longitude, school_id),
          agent:users(id, first_name, last_name, phone, verified_status, profile_image_url)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.locationId) {
        query = query.eq('location_id', filters.locationId)
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice)
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }
      if (filters.roomType) {
        query = query.eq('room_type', filters.roomType)
      }
      if (filters.availability !== undefined) {
        query = query.eq('availability', filters.availability)
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
    },

    async create(hostelData: any) {
      const { data, error } = await supabase
        .from('hostels')
        .insert(hostelData)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    }
  },

  // Bookings operations
  bookings: {
    async findByUser(userId: string, userRole: string) {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          hostel:hostels(id, title, price, price_type, images),
          student:users(id, first_name, last_name, email, phone)
        `)

      if (userRole === 'student') {
        query = query.eq('student_id', userId)
      } else if (userRole === 'agent') {
        // For agents, get bookings for their hostels
        query = query.eq('hostels.agent_id', userId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
    },

    async create(bookingData: any) {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    }
  },

  // Schools operations
  schools: {
    async findAll() {
      const { data, error } = await supabase
        .from('schools')
        .select('*')

      if (error) {
        throw error
      }

      return data || []
    }
  },

  // Locations operations
  locations: {
    async findAll() {
      const { data, error } = await supabase
        .from('locations')
        .select(`
          *,
          school:schools(id, name, city, state)
        `)
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    },

    async findBySchool(schoolId: string) {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('school_id', schoolId)

      if (error) {
        throw error
      }

      return data || []
    }
  }
}