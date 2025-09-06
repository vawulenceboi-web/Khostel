'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log('👤 AUTH PROVIDER DEBUG: Initializing auth provider')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('👤 AUTH PROVIDER DEBUG: Initial session check')
      console.log('👤 AUTH PROVIDER DEBUG: Session present:', !!session)
      console.log('👤 AUTH PROVIDER DEBUG: User present:', !!session?.user)
      
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      if (session?.user) {
        console.log('👤 AUTH PROVIDER DEBUG: User ID:', session.user.id)
        console.log('👤 AUTH PROVIDER DEBUG: User email:', session.user.email)
        console.log('👤 AUTH PROVIDER DEBUG: User metadata:', JSON.stringify(session.user.user_metadata, null, 2))
        console.log('👤 AUTH PROVIDER DEBUG: User role from metadata:', session.user.user_metadata?.role)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('👤 AUTH PROVIDER DEBUG: Auth state change')
      console.log('👤 AUTH PROVIDER DEBUG: Event:', event)
      console.log('👤 AUTH PROVIDER DEBUG: Session present:', !!session)
      console.log('👤 AUTH PROVIDER DEBUG: User present:', !!session?.user)
      
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      if (session?.user) {
        console.log('👤 AUTH PROVIDER DEBUG: Updated user ID:', session.user.id)
        console.log('👤 AUTH PROVIDER DEBUG: Updated user email:', session.user.email)
        console.log('👤 AUTH PROVIDER DEBUG: Updated user metadata:', JSON.stringify(session.user.user_metadata, null, 2))
        console.log('👤 AUTH PROVIDER DEBUG: Updated user role:', session.user.user_metadata?.role)
      }
      
      router.refresh()
    })

    return () => {
      console.log('👤 AUTH PROVIDER DEBUG: Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const value = {
    user,
    session,
    isLoading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
