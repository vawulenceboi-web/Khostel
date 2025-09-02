import { defineConfig } from "drizzle-kit";

// Auto-generate database URL from Supabase URL if not provided
function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  if (process.env.SUPABASE_URL) {
    // Extract project ref from Supabase URL
    const supabaseUrl = process.env.SUPABASE_URL;
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      const projectRef = match[1];
      console.log(`🔗 Auto-detected Supabase project: ${projectRef}`);
      console.log(`📝 Please ensure your DATABASE_URL is set with your actual password`);
      return `postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`;
    }
  }
  
  throw new Error("Either DATABASE_URL or SUPABASE_URL must be set");
}

const databaseUrl = getDatabaseUrl();

if (databaseUrl.includes('[YOUR-PASSWORD]')) {
  console.error('❌ Please replace [YOUR-PASSWORD] in your DATABASE_URL with your actual Supabase database password');
  process.exit(1);
}

export default defineConfig({
  out: "./migrations",
  schema: "./lib/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});