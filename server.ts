import postgres from 'postgres';
console.log('🔴 SERVER TS: Starting with forced Supabase connection test...');

// Force a direct connection BEFORE anything else
const TEST_SQL = postgres('postgresql://postgres.qipmigufldprvjynbhci:jwLn2r4cqBcmxhly@aws-1-ap-south-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require',
});

// Test it immediately
(async () => {
  try {
    const result = await TEST_SQL`SELECT NOW() as time`;
    console.log('🔴 SERVER TS: ✅ FORCED CONNECTION WORKS!', result[0].time);
  } catch (error) {
    console.error('🔴 SERVER TS: ❌ FORCED CONNECTION FAILED:', error);
  }
})();

import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { initDb, sql } from "./src/db/index";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  console.log("Database: Initializing...");
  
  // 🔍 DEBUG: Log the sql object to see its configuration
  console.log("🔍 DEBUG: sql object created from:", sql);
  
  await initDb();

  // Test connection
  try {
    const result = await sql`SELECT NOW() as time`;
    console.log('✅ Connected to Supabase!', result[0].time);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }

  app.use(express.json());

  // API Routes
  app.get("/api/health", async (req, res) => {
    try {
      await sql`SELECT 1`;
      res.json({ status: "ok", db: "connected", geminiKeySet: !!process.env.GEMINI_API_KEY });
    } catch (error) {
      console.error("Database health check failed:", error);
      res.status(500).json({ status: "error", db: "disconnected", error: (error as any).message });
    }
  });

  // User Login/Register
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { id, name, email } = req.body;
      
      // Check if user exists
      const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
      
      if (user) {
        // Update last active
        await sql`UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ${id}`;
        return res.json(user);
      }
 
      // Create new user if registering
      if (name) {
        const [newUser] = await sql`
          INSERT INTO users (id, name, email) 
          VALUES (${id}, ${name}, ${email}) 
          RETURNING *
        `;
        return res.json(newUser);
      }

      res.status(404).json({ error: "User not found" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Save Quiz Result
  app.post("/api/results", async (req, res) => {
    try {
      const { category, score, totalQuestions, answers, questions, userId, mode } = req.body;
      
      const [quizResult] = await sql`
        INSERT INTO quiz_results (category, score, total_questions, user_id, mode) 
        VALUES (${category}, ${score}, ${totalQuestions}, ${userId}, ${mode || 'practice'})
        RETURNING id
      `;
      
      const resultId = quizResult.id;

      const answerRows = questions.map((q: any) => {
        const selected = answers[q.id];
        const isCorrect = selected === q.correctAnswerIndex;
        
        // Ensure question_id is a valid UUID, otherwise leave it null
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q.id);
        
        return {
          result_id: resultId,
          user_id: userId,
          question_id: isValidUuid ? q.id : null,
          category: category,
          question_text: q.text,
          options: sql.json(q.options),
          correct_answer: q.options[q.correctAnswerIndex],
          selected_answer: selected !== undefined ? q.options[selected] : null,
          explanation: q.explanation,
          is_correct: isCorrect
        };
      });

      if (answerRows.length > 0) {
        await sql`
          INSERT INTO user_answers ${sql(answerRows)}
        `;
      }

      res.json({ id: resultId, success: true });
    } catch (error) {
      console.error("Error saving result:", error);
      res.status(500).json({ error: "Failed to save result" });
    }
  });

  // Get Mistakes
  app.get("/api/mistakes", async (req, res) => {
    try {
      const { userId } = req.query;
      const mistakes = await sql`
        SELECT * FROM user_answers 
        WHERE is_correct = false 
        AND user_id = ${userId as string}
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      
      const parsedMistakes = mistakes.map((m: any) => {
        const options = typeof m.options === 'string' ? JSON.parse(m.options) : m.options;
        return {
          ...m,
          options,
          correct_index: options.indexOf(m.correct_answer),
          selected_index: m.selected_answer ? options.indexOf(m.selected_answer) : null
        };
      });
      
      res.json(parsedMistakes);
    } catch (error) {
      console.error("Error fetching mistakes:", error);
      res.status(500).json({ error: "Failed to fetch mistakes" });
    }
  });

  // Get User Stats & Progress
  app.get("/api/stats", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      const stats = await sql`
        SELECT 
          category,
          COUNT(*) as quizzes_taken,
          SUM(score) as total_score,
          SUM(total_questions) as total_questions
        FROM quiz_results
        WHERE user_id = ${userId as string}
        GROUP BY category
      `;
      
      const [totalQuizzes] = await sql`
        SELECT COUNT(*) as count FROM quiz_results 
        WHERE user_id = ${userId as string}
      `;
      
      // Daily Progress (Questions answered today)
      const [dailyProgress] = await sql`
        SELECT COUNT(*) as count 
        FROM user_answers 
        WHERE created_at::date = CURRENT_DATE
        AND user_id = ${userId as string}
      `;

      // Simple Streak Calculation
      const distinctDays = await sql`
        SELECT DISTINCT created_at::date as day 
        FROM quiz_results 
        WHERE user_id = ${userId as string}
        ORDER BY day DESC 
        LIMIT 30
      `;

      // Weakest Subject
      const [weakest] = await sql`
        SELECT category, CAST(SUM(score) AS FLOAT) / SUM(total_questions) as accuracy
        FROM quiz_results
        WHERE user_id = ${userId as string}
        GROUP BY category
        ORDER BY accuracy ASC
        LIMIT 1
      `;

      res.json({
        categoryStats: stats.map(s => ({
          ...s,
          quizzes_taken: parseInt(s.quizzes_taken),
          total_score: parseInt(s.total_score),
          total_questions: parseInt(s.total_questions)
        })),
        totalQuizzes: parseInt(totalQuizzes.count),
        dailyQuestions: parseInt(dailyProgress.count),
        streak: calculateStreak(distinctDays.map(d => ({ day: d.day.toISOString().split('T')[0] }))),
        weakestSubject: weakest ? {
          ...weakest,
          accuracy: parseFloat(weakest.accuracy)
        } : null
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  function calculateStreak(days: { day: string }[]) {
    if (days.length === 0) return 0;
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (days[0].day !== today && days[0].day !== yesterday) {
      return 0;
    }

    let currentDate = new Date(days[0].day);
    
    for (let i = 0; i < days.length; i++) {
      const day = new Date(days[i].day);
      const diffTime = Math.abs(currentDate.getTime() - day.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (i === 0 || diffDays <= 1) {
         streak++;
         currentDate = day;
      } else {
        break;
      }
    }
    return streak;
  }

  // Get Exam History
  app.get("/api/history", async (req, res) => {
    try {
      const { userId } = req.query;
      const history = await sql`
        SELECT * FROM quiz_results 
        WHERE user_id = ${userId as string}
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Admin: Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await sql`
        SELECT 
          u.*,
          (SELECT COUNT(*) FROM quiz_results WHERE user_id = u.id) as quizzes_completed,
          (SELECT AVG(score * 100.0 / total_questions) FROM quiz_results WHERE user_id = u.id) as avg_accuracy
        FROM users u
        ORDER BY u.created_at DESC
      `;
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin: Update user status/role
  app.post("/api/admin/users/update", async (req, res) => {
    const { id, role, status, is_premium } = req.body;
    try {
      await sql`
        UPDATE users 
        SET 
          role = ${role}, 
          status = ${status}, 
          is_premium = ${is_premium}
        WHERE id = ${id}
      `;
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Get All Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await sql`
        SELECT DISTINCT category FROM questions
      `;
      res.json(categories.map(c => c.category));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get Questions (Practice)
  app.get("/api/questions", async (req, res) => {
    try {
      const { category, limit, difficulty } = req.query;
      const questionLimit = parseInt(limit as string) || 10;
      
      console.log(`🔍 Fetching questions: category=${category}, difficulty=${difficulty}, limit=${questionLimit}`);

      // Try with specific difficulty first
      let questions = [];
      
      if (difficulty && difficulty !== 'Mixed' && difficulty !== 'Adaptive') {
        questions = await sql`
          SELECT * FROM questions 
          WHERE category = ${category as string} 
          AND difficulty = ${difficulty as string}
          ORDER BY RANDOM()
          LIMIT ${questionLimit}
        `;
      }

      // If no questions found with specific difficulty, or no difficulty specified
      if (questions.length === 0) {
        console.log(`⚠️ No questions found for ${category} with difficulty ${difficulty}. Trying any difficulty...`);
        questions = await sql`
          SELECT * FROM questions 
          WHERE category = ${category as string}
          ORDER BY RANDOM()
          LIMIT ${questionLimit}
        `;
      }

      if (questions.length === 0) {
        console.log(`❌ Still no questions found for category: ${category}`);
        // Check if there are ANY questions in this category at all
        const [count] = await sql`SELECT COUNT(*) FROM questions WHERE category = ${category as string}`;
        console.log(`📊 Total questions in DB for ${category}: ${count.count}`);
      }
      
      res.json(questions.map(q => ({
        id: q.id,
        category: q.category,
        text: q.question_text,
        options: q.options,
        correctAnswerIndex: q.options.indexOf(q.correct_answer),
        explanation: q.explanation,
        tags: q.tags || []
      })));
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Admin: Get all questions
  app.get("/api/admin/questions", async (req, res) => {
    try {
      const questions = await sql`SELECT * FROM questions ORDER BY created_at DESC`;
      res.json(questions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Admin: Batch Save Questions
  app.post("/api/admin/questions/batch", async (req, res) => {
    try {
      const { questions } = req.body;
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: "Invalid questions format" });
      }

      const rows = questions.map(q => ({
        category: q.category,
        question_text: q.text,
        options: q.options,
        correct_answer: q.options[q.correctAnswerIndex],
        explanation: q.explanation,
        difficulty: q.difficulty || 'Moderate',
        tags: q.tags || []
      }));

      await sql`
        INSERT INTO questions ${sql(rows)}
      `;

      res.json({ success: true, count: questions.length });
    } catch (error) {
      console.error("Failed to batch save questions:", error);
      res.status(500).json({ error: "Failed to save questions" });
    }
  });

  // Admin: Get Dashboard Stats
  app.get("/api/admin/dashboard-stats", async (req, res) => {
    try {
      const [totalUsers] = await sql`SELECT COUNT(*) as count FROM users`;
      const [premiumUsers] = await sql`SELECT COUNT(*) as count FROM users WHERE is_premium = true`;
      const [totalQuizzes] = await sql`SELECT COUNT(*) as count FROM quiz_results`;
      
      res.json({
        totalUsers: parseInt(totalUsers.count),
        premiumUsers: parseInt(premiumUsers.count),
        totalQuizzes: parseInt(totalQuizzes.count),
        revenueToday: 0,
        aiUsageToday: 0
      });
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Admin: Get Revenue Data
  app.get("/api/admin/revenue", async (req, res) => {
    try {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      res.json(months.map(m => ({ name: m, total: 0 })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue" });
    }
  });

  // Admin: Get Weak Topics
  app.get("/api/admin/weak-topics", async (req, res) => {
    try {
      const topics = await sql`
        SELECT category as topic, 
               CAST(COUNT(CASE WHEN is_correct = false THEN 1 END) AS FLOAT) / COUNT(*) * 100 as fail_rate
        FROM user_answers
        GROUP BY category
        ORDER BY fail_rate DESC
        LIMIT 5
      `;
      res.json(topics.map(t => ({ topic: t.topic, failRate: Math.round(t.fail_rate || 0) })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weak topics" });
    }
  });

  // Admin: Get Leaderboard
  app.get("/api/admin/leaderboard", async (req, res) => {
    try {
      const leaders = await sql`
        SELECT name, 
               CAST(SUM(score) AS FLOAT) / SUM(total_questions) * 100 as accuracy,
               COUNT(*) as quizzes
        FROM quiz_results
        JOIN users ON quiz_results.user_id = users.id
        GROUP BY name, users.id
        ORDER BY accuracy DESC
        LIMIT 10
      `;
      res.json(leaders.map((l, i) => ({
        name: l.name,
        score: `${Math.round(l.accuracy)}%`,
        rank: i + 1,
        avatar: l.name.split(' ').map((n: string) => n[0]).join('')
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Flashcards: Get Decks
  app.get("/api/flashcards/decks", async (req, res) => {
    try {
      const decks = await sql`SELECT * FROM flashcard_decks ORDER BY created_at DESC`;
      res.json(decks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch decks" });
    }
  });

  // Flashcards: Get Cards for Deck
  app.get("/api/flashcards/deck/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cards = await sql`SELECT * FROM flashcards WHERE deck_id = ${id}`;
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });

  // User: Update profile
  app.post("/api/user/update", async (req, res) => {
    const { id, name, email } = req.body;
    try {
      const [updatedUser] = await sql`
        UPDATE users 
        SET 
          name = ${name}, 
          email = ${email}
        WHERE id = ${id}
        RETURNING *
      `;
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Failed to update profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Catch-all for unhandled API routes
  app.use('/api/*', (req, res) => {
    console.log(`❌ Unhandled API route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
