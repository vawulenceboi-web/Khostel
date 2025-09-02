#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 k-H Platform Setup\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  // Generate a random secret
  const randomSecret = crypto.randomBytes(32).toString('base64');
  
  // Create .env.local with template
  const envContent = `# k-H Platform Environment Variables
# Add your Supabase credentials below

# Supabase Configuration (Required)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Database Configuration (Required)
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# Authentication (Auto-generated)
NEXTAUTH_SECRET=${randomSecret}
NEXTAUTH_URL=http://localhost:3000

# Optional Features
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
SENDGRID_API_KEY=your-sendgrid-api-key

# Development
NODE_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local with auto-generated NEXTAUTH_SECRET');
  console.log('📝 Please add your Supabase credentials to .env.local\n');
} else {
  console.log('✅ .env.local already exists\n');
}

console.log('🔑 **Quick Setup Steps:**\n');

console.log('1. **Supabase Dashboard** → Settings → API');
console.log('   Copy: Project URL and anon/public key\n');

console.log('2. **Supabase Dashboard** → Settings → Database');
console.log('   Copy: Connection string (Direct connection)\n');

console.log('3. **SQL Editor** in Supabase');
console.log('   Paste: Content of sql/schema.sql file');
console.log('   Click: Run (creates all tables and sample data)\n');

console.log('4. **Update .env.local** with your credentials\n');

console.log('5. **Start the platform:**');
console.log('   npm run dev\n');

console.log('🎯 **Test Accounts (created automatically):**\n');
console.log('   Admin:   admin@k-hostel.com / admin123');
console.log('   Agent:   agent@k-hostel.com / admin123');
console.log('   Student: student@k-hostel.com / admin123\n');

console.log('🎊 **Your k-H platform will be fully functional with real data!**');