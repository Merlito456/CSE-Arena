import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, Sparkles, Target, ArrowRight, Zap, BookOpen, ArrowLeft } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { Category } from "@/types";

interface SmartReviewProps {
  onBack: () => void;
  onStartQuiz: (category: Category, difficulty: string) => void;
  stats: any;
  userId: string | null;
}

export function SmartReview({ onBack, onStartQuiz, stats, userId }: SmartReviewProps) {
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stats && !aiAdvice) {
      generateAdvice();
    }
  }, [stats]);

  const generateAdvice = async () => {
    setLoading(true);
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const prompt = `
        Analyze these student stats for a Civil Service Exam reviewer:
        Weakest Subject: ${stats?.weakestSubject?.category || "None"} (${Math.round((stats?.weakestSubject?.accuracy || 0) * 100)}% accuracy)
        Overall Accuracy: ${stats?.accuracy || 0}%
        Streak: ${stats?.streak || 0} days

        Provide 3 short, punchy, motivational bullet points on what to focus on. 
        Keep it under 50 words total.
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash-lite-latest",
        contents: prompt
      });
      setAiAdvice(result.text || "Keep practicing!");
    } catch (error) {
      console.error("Failed to generate advice", error);
      setAiAdvice("Focus on your weakest subjects to improve your overall score. Consistency is key!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Smart Review
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Analysis Card */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Sparkles className="w-5 h-5" /> AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-indigo-100 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-indigo-100 rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-indigo-100 rounded w-5/6 animate-pulse" />
              </div>
            ) : (
              <div className="prose prose-sm text-indigo-900">
                <p className="whitespace-pre-line">{aiAdvice}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weakness Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-500" /> Priority Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div>
                <p className="font-semibold text-red-900">{stats?.weakestSubject?.category || "General Practice"}</p>
                <p className="text-xs text-red-700">Lowest accuracy detected</p>
              </div>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onStartQuiz(stats?.weakestSubject?.category as Category || "General Information", "Adaptive")}
              >
                Fix This <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-bold mt-8">Recommended Sessions</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md" onClick={() => onStartQuiz("Numerical Reasoning", "Hard")}>
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-blue-100 rounded-full w-fit">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold">Speed Drill</h4>
              <p className="text-sm text-muted-foreground">10 rapid-fire math questions to build speed.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md" onClick={() => onStartQuiz("Verbal Reasoning", "Adaptive")}>
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-green-100 rounded-full w-fit">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold">Vocabulary Builder</h4>
              <p className="text-sm text-muted-foreground">Expand your word bank with adaptive difficulty.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md" onClick={() => onStartQuiz("Logic", "Hard")}>
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-purple-100 rounded-full w-fit">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-bold">Logic Challenge</h4>
              <p className="text-sm text-muted-foreground">Complex analytical problems to test your reasoning.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
