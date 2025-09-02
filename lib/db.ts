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

// Database operations using ONLY Supabase client (no direct PostgreSQL)
export const db = {
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
    }
  },

  // Hostels operations
  hostels: {
    async findAll(filters: any = {}) {
      let query = supabase
        .from('hostels')
        .select(`
          *,
          location:locations(*),
          agent:users(id, first_name, last_name, phone, verified_status)
        `)

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