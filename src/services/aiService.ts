import { storageService } from "./storageService";
import { Category } from "../types";

class AIService {
  async getPerformanceInsights(userId: string) {
    const stats = storageService.getStats(userId);
    const mistakes = storageService.getMistakes();
    
    const insights: string[] = [];

    // Accuracy Insight
    if (stats.accuracy < 50) {
      insights.push("Your overall accuracy is currently below 50%. Focus on foundational concepts in your weakest subjects before taking more timed quizzes.");
    } else if (stats.accuracy < 75) {
      insights.push("You're making steady progress! To break into the 80%+ range, try reviewing your mistakes immediately after each session.");
    } else {
      insights.push("Excellent accuracy! You're consistently scoring high. Keep this momentum by challenging yourself with 'Hard' difficulty questions.");
    }

    // Weakest Subject Insight
    if (stats.weakestSubject) {
      insights.push(`Your performance in ${stats.weakestSubject.category} needs attention. Dedicate at least 30 minutes daily to this specific subject.`);
    }

    // Streak Insight
    if (stats.streak > 3) {
      insights.push(`Impressive ${stats.streak}-day streak! Consistency is the key to passing the Civil Service Exam. Don't break the chain!`);
    } else {
      insights.push("Try to build a daily habit. Even 5 questions a day can significantly improve your long-term retention.");
    }

    // Mistake Pattern Insight
    if (mistakes.length > 0) {
      const recentMistake = mistakes[0];
      insights.push(`You recently struggled with a question about "${recentMistake.question_text.substring(0, 30)}...". Review the explanation to avoid repeating the same error.`);
    }

    return `### 🤖 Localized AI Mentor Insights\n\n${insights.map(i => `* ${i}`).join('\n')}\n\n*Keep pushing forward, future Civil Servant!*`;
  }

  async generateStudyPlan(userId: string) {
    const stats = storageService.getStats(userId);
    const weakest = stats.weakestSubject?.category || "General Information";
    
    const plan = [
      {
        day: "Day 1",
        focus: `Foundations of ${weakest}`,
        tasks: ["Review basic concepts", "Take a 10-question diagnostic quiz", "List down terms you find difficult"]
      },
      {
        day: "Day 2",
        focus: "Numerical & Logical Reasoning",
        tasks: ["Practice 15 math problems", "Solve 5 logic puzzles", "Review formula shortcuts"]
      },
      {
        day: "Day 3",
        focus: `Deep Dive: ${weakest}`,
        tasks: ["Focus on complex problems in this category", "Review all past mistakes in this subject", "Take a timed 20-question quiz"]
      },
      {
        day: "Day 4",
        focus: "Verbal Reasoning & Grammar",
        tasks: ["Read 2 long-form articles", "Practice 20 synonym/antonym questions", "Review common grammatical errors"]
      },
      {
        day: "Day 5",
        focus: "General Information & Constitution",
        tasks: ["Review the 1987 Constitution summary", "Practice RA 6713 questions", "Check recent current events"]
      },
      {
        day: "Day 6",
        focus: "Full Mock Simulation",
        tasks: ["Take a 50-question mixed exam", "Simulate actual exam timing", "Do not use any notes"]
      },
      {
        day: "Day 7",
        focus: "Review & Rest",
        tasks: ["Analyze your mock exam results", "Review the 'Review Mistakes' section", "Get plenty of rest for the next week"]
      }
    ];

    return plan;
  }
}

export const aiService = new AIService();
