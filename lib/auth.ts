import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getDb } from './db'
import { users } from './schema'
import { eq } from 'drizzle-orm'

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
          if (!process.env.DATABASE_URL || !process.env.SUPABASE_URL) {
            console.error('Database configuration missing. Please check your environment variables.')
            throw new Error('Database not configured')
          }

          const db = getDb()
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1)
          
          if (!user) {
            console.log(`Login attempt failed: User not found for email ${credentials.email}`)
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)
          
          if (!isValidPassword) {
            console.log(`Login attempt failed: Invalid password for email ${credentials.email}`)
            return null
          }

          console.log(`Login successful for user: ${user.email} (${user.role})`)
          
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName || ''}`.trim(),
            firstName: user.firstName,
            lastName: user.lastName || undefined,
            role: user.role,
            verifiedStatus: user.verifiedStatus || false,
            schoolId: user.schoolId || undefined,
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
      if (user) {
        token.role = user.role
        token.verifiedStatus = user.verifiedStatus
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.schoolId = user.schoolId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.verifiedStatus = token.verifiedStatus as boolean
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.schoolId = token.schoolId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}