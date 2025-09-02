import bcrypt from 'bcryptjs'

// Hardcoded admin credentials (can only be changed in database)
const ADMIN_CREDENTIALS = {
  username: 'k-h-admin',
  password: 'AdminK-H2024!', // This will be hashed
  email: 'admin@k-h.com'
}

export async function validateAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    // Check username
    if (username !== ADMIN_CREDENTIALS.username) {
      return false
    }

    // For development, use plain text comparison
    // In production, this should be hashed in the database
    if (password !== ADMIN_CREDENTIALS.password) {
      return false
    }

    console.log('✅ Admin authentication successful')
    return true
    
  } catch (error) {
    console.error('❌ Admin authentication error:', error)
    return false
  }
}

export function getAdminEmail(): string {
  return ADMIN_CREDENTIALS.email
}

// Admin session data
export interface AdminSession {
  username: string
  email: string
  role: 'admin'
  loginTime: Date
}

export function createAdminSession(): AdminSession {
  return {
    username: ADMIN_CREDENTIALS.username,
    email: ADMIN_CREDENTIALS.email,
    role: 'admin',
    loginTime: new Date()
  }
}