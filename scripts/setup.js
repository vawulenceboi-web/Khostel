#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 k-H Platform Setup\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    // Copy .env.example to .env.local
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env.local from .env.example');
    console.log('📝 Please update .env.local with your Supabase credentials\n');
  } else {
    console.log('❌ .env.example not found');
  }
} else {
  console.log('✅ .env.local already exists\n');
}

// Display setup instructions
console.log('🔑 **Required Environment Variables:**\n');
console.log('1. SUPABASE_URL - Your Supabase project URL');
console.log('   Get from: Supabase Dashboard → Settings → API');
console.log('   Example: https://abcdefgh.supabase.co\n');

console.log('2. SUPABASE_ANON_KEY - Your Supabase anon key');
console.log('   Get from: Supabase Dashboard → Settings → API');
console.log('   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');

console.log('3. DATABASE_URL - Your PostgreSQL connection string');
console.log('   Get from: Supabase Dashboard → Settings → Database → Connection string');
console.log('   Example: postgresql://postgres:your-password@db.abcdefgh.supabase.co:5432/postgres\n');

console.log('4. NEXTAUTH_SECRET - Random secret for authentication');
console.log('   Generate: openssl rand -base64 32');
console.log('   Or use any random string\n');

console.log('🗄️ **Database Setup:**\n');
console.log('After adding your credentials to .env.local:');
console.log('1. npm run db:push    # Create database tables');
console.log('2. npm run dev        # Start development server');
console.log('3. Visit: http://localhost:3000/api/seed  # Seed initial data\n');

console.log('🎯 **Quick Test:**\n');
console.log('1. Register as a student');
console.log('2. Browse hostels');
console.log('3. Book an inspection');
console.log('4. Check your dashboard\n');

console.log('🎊 **That\'s it! Your k-H platform will be fully functional.**');