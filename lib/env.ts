export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_URL',
  ]

  const optional = [
    'SUPABASE_SERVICE_ROLE_KEY',
  ]

  const missing = required.filter(
    (key) => !process.env[key]
  )

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables:\n${missing.join('\n')}`)
  }

  const warnings = optional.filter(
    (key) => !process.env[key]
  )

  if (warnings.length > 0) {
    console.warn(`Warning: Missing optional environment variables:\n${warnings.join('\n')}`)
  }

  return true
}
