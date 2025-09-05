import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key for auth operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Use this for admin operations only
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Auth helper functions
export const auth = {
  // Password reset
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
    });
  },

  // Admin functions - use with caution
  inviteUser: async (email: string) => {
    return await supabaseAdmin.auth.admin.inviteUserByEmail(email);
  }
};
