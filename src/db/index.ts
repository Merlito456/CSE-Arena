import postgres from "postgres";

console.log("🔍 DB INDEX: Loading database configuration...");

// 🔴 HARDCODED - IGNORE EVERYTHING ELSE
const DATABASE_URL = "postgresql://postgres.qipmigufldprvjynbhci:jwLn2r4cqBcmxhly@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

console.log("🔍 DB INDEX: Using URL:", DATABASE_URL.replace(/:[^:]*@/, ':***@'));

export const sql = postgres(DATABASE_URL, {
  ssl: "require",
  idle_timeout: 20,
  connect_timeout: 10,
});

// Test connection immediately when this module loads
(async () => {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log("✅ DB INDEX: Connection test successful at module load!", result);
  } catch (error) {
    console.error("❌ DB INDEX: Connection test FAILED at module load:", error);
  }
})();

export async function initDb() {
  try {
    console.log("📦 DB INDEX: initDb() called - testing connection...");
    const result = await sql`SELECT 1 as connected`;
    console.log("✅ DB INDEX: initDb() connection successful!", result);

    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

    // 1. Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT 'User',
        email TEXT,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        is_premium BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Quiz Results Table
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT REFERENCES users(id),
        category TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. User Answers Table
    await sql`
      CREATE TABLE IF NOT EXISTS user_answers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        result_id UUID REFERENCES quiz_results(id),
        user_id TEXT REFERENCES users(id),
        category TEXT NOT NULL,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_index INTEGER NOT NULL,
        selected_index INTEGER NOT NULL,
        explanation TEXT,
        is_correct BOOLEAN NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Questions Table
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category TEXT NOT NULL,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        difficulty TEXT DEFAULT 'Moderate',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("✅ DB INDEX: Tables initialized");
  } catch (error) {
    console.error("❌ DB INDEX: initDb() failed:", error);
    throw error;
  }
}
