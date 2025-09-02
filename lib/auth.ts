import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if environment variables are set
          if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            console.error('Supabase configuration missing. Please check your environment variables.')
            throw new Error('Supabase not configured')
          }

          console.log('🔍 Looking up user:', credentials.email)
          const user = await db.users.findByEmail(credentials.email)
          
          if (!user) {
            console.log(`Login attempt failed: User not found for email ${credentials.email}`)
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
          
          if (!isValidPassword) {
            console.log(`Login attempt failed: Invalid password for email ${credentials.email}`)
            return null
          }

          console.log(`Login successful for user: ${user.email} (${user.role})`)
          
          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name || ''}`.trim(),
            firstName: user.first_name,
            lastName: user.last_name || undefined,
            phone: user.phone || undefined,
            address: user.address || undefined,
            profileImage: user.profile_image_url || undefined,
            facePhoto: user.face_photo_url || undefined,
            role: user.role,
            verifiedStatus: user.verified_status || false,
            schoolId: user.school_id || undefined,
          }
        } catch (error) {
          console.error('Auth error details:', error)
          
          // Return specific error messages for different scenarios
          if (error.message?.includes('Database not configured')) {
            throw new Error('Database configuration error. Please check environment variables.')
          }
          
          if (error.message?.includes('connect')) {
            throw new Error('Database connection failed. Please check your DATABASE_URL.')
          }
          
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          console.log('🔑 JWT callback - adding user data to token')
          token.role = user.role
          token.verifiedStatus = user.verifiedStatus
          token.firstName = user.firstName
          token.lastName = user.lastName
          token.phone = user.phone
          token.address = user.address
          token.profileImage = user.profileImage
          token.facePhoto = user.facePhoto
          token.schoolId = user.schoolId
          console.log('✅ JWT token updated successfully')
        }
        return token
      } catch (error) {
        console.error('❌ JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token.sub) {
          console.log('👤 Session callback - creating user session')
          session.user.id = token.sub
          session.user.role = (token.role as string) || 'student'
          session.user.verifiedStatus = (token.verifiedStatus as boolean) || false
          session.user.firstName = (token.firstName as string) || ''
          session.user.lastName = (token.lastName as string) || ''
          session.user.phone = (token.phone as string) || ''
          session.user.address = (token.address as string) || ''
          session.user.profileImage = (token.profileImage as string) || ''
          session.user.facePhoto = (token.facePhoto as string) || ''
          session.user.schoolId = (token.schoolId as string) || ''
          console.log('✅ Session created successfully for:', session.user.email)
        }
        return session
      } catch (error) {
        console.error('❌ Session callback error:', error)
        return session
      }
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}